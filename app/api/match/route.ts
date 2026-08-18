import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { executeTwoTierMatch } from '@/lib/matchingEngine';
import { getPatientConsentRequestEmail } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, patientIds } = body;

    const idsToMatch: string[] = patientIds || (patientId ? [patientId] : []);
    
    if (idsToMatch.length === 0) {
      // If no specific IDs passed, match all pending TRIAGED patients
      const allPatients = db.getAllPatients();
      const pending = allPatients.filter((p) => p.status === 'TRIAGED');
      pending.forEach((p) => idsToMatch.push(p.id));
    }

    if (idsToMatch.length === 0) {
      return NextResponse.json({
        success: true,
        matchedCount: 0,
        results: [],
        message: 'No pending patients requiring matching.',
      });
    }

    const clinics = db.getAllClinics();
    const origin = req.headers.get('origin') || req.headers.get('host') || 'http://localhost:3000';
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;

    const matchResults = [];

    for (const id of idsToMatch) {
      const patient = db.getPatientById(id);
      if (!patient) continue;

      const matchOutput = executeTwoTierMatch(patient, clinics);

      if (matchOutput.success && matchOutput.matchedClinic) {
        // Update patient record
        const updated = db.updatePatient(patient.id, {
          matched_clinic_id: matchOutput.matchedClinic.id,
          match_tier: matchOutput.tier || 'TIER_1',
          match_distance_miles: matchOutput.distanceMiles || 0,
          status: 'CONSENT_REQUESTED',
        });

        // Dispatch Patient Consent Email
        let emailRes = null;
        if (updated) {
          const emailData = getPatientConsentRequestEmail(
            updated,
            matchOutput.matchedClinic,
            matchOutput.tier || 'TIER_1',
            matchOutput.distanceMiles || 0,
            baseUrl
          );

          emailRes = await sendEmail({
            to: updated.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          });
        }

        matchResults.push({
          patientId: patient.id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          matchedClinic: matchOutput.matchedClinic,
          tier: matchOutput.tier,
          distanceMiles: matchOutput.distanceMiles,
          consentEmailDispatched: Boolean(emailRes?.success),
          message: matchOutput.message,
        });
      } else {
        matchResults.push({
          patientId: patient.id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          matchedClinic: null,
          tier: null,
          distanceMiles: null,
          consentEmailDispatched: false,
          message: matchOutput.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      matchedCount: matchResults.filter((r) => r.matchedClinic).length,
      results: matchResults,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Matching Error';
    console.error('Match API Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
