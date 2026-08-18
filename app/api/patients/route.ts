import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { BatchPatientRow, Patient, UrgencyLevel } from '@/lib/types';
import { getCoordinatesForZip } from '@/lib/zipCoordinates';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');

    if (id) {
      const patient = db.getPatientById(id);
      if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      return NextResponse.json({ patient });
    }

    if (token) {
      const patient = db.getPatientByToken(token);
      if (!patient) return NextResponse.json({ error: 'Invalid consent token' }, { status: 404 });
      return NextResponse.json({ patient });
    }

    let patients = db.getAllPatients();

    if (status) {
      patients = patients.filter((p) => p.status === status);
    }

    if (urgency) {
      patients = patients.filter((p) => p.urgency_level === urgency);
    }

    // Compute pipeline analytics
    const stats = {
      total: patients.length,
      urgentRed: patients.filter((p) => p.urgency_level === 'URGENT_RED').length,
      triaged: patients.filter((p) => p.status === 'TRIAGED').length,
      matching: patients.filter((p) => p.status === 'MATCH_FOUND').length,
      consentPending: patients.filter((p) => p.status === 'CONSENT_REQUESTED').length,
      consentGranted: patients.filter((p) => p.status === 'CONSENT_GRANTED').length,
      dispatchedOrCompleted: patients.filter((p) => p.status === 'COMPLETED' || p.status === 'DISPATCHED').length,
      tier1Count: patients.filter((p) => p.match_tier === 'TIER_1').length,
      tier2Count: patients.filter((p) => p.match_tier === 'TIER_2').length,
    };

    return NextResponse.json({
      patients,
      stats,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Patients Fetch Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, batchPatients } = body;

    if (action === 'RESET_DATABASE') {
      db.reset();
      return NextResponse.json({ success: true, message: 'Database reset to initial sample state.' });
    }

    if (Array.isArray(batchPatients)) {
      const added: Patient[] = [];

      for (const row of batchPatients as BatchPatientRow[]) {
        if (!row.first_name || !row.last_name || !row.email || !row.zip || !row.insurance_carrier) {
          continue;
        }

        const coords = getCoordinatesForZip(row.zip);
        const consentToken = `tok_${Math.random().toString(36).substring(2, 12)}`;

        const newPat: Patient = {
          id: `pat-batch-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          first_name: row.first_name.trim(),
          last_name: row.last_name.trim(),
          email: row.email.trim().toLowerCase(),
          phone: row.phone?.trim() || '(555) 000-0000',
          zip: row.zip.trim(),
          lat: coords.lat,
          lng: coords.lng,
          search_radius_miles: Number(row.search_radius_miles) || 25,
          insurance_carrier: row.insurance_carrier.trim(),
          insurance_plan: row.insurance_plan?.trim() || 'Standard PPO',
          urgency_level: (row.urgency_level as UrgencyLevel) || 'URGENT_RED',
          screening_notes: row.screening_notes?.trim() || 'Batch intake from mobile dermatology screening clinic.',
          status: 'TRIAGED',
          consent_token: consentToken,
          triage_alert_sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        db.savePatient(newPat);
        added.push(newPat);
      }

      return NextResponse.json({
        success: true,
        count: added.length,
        patients: added,
        message: `Successfully ingested ${added.length} patient records from batch upload.`,
      });
    }

    return NextResponse.json({ error: 'Invalid batch request' }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Patient Ingestion Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
