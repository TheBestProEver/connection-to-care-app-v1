import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { Patient, UrgencyLevel } from '@/lib/types';
import { getCoordinatesForZip } from '@/lib/zipCoordinates';
import { getUrgentTriageAlertEmail } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      zip,
      search_radius_miles = 25,
      insurance_carrier,
      insurance_plan = 'Standard PPO',
      urgency_level = 'URGENT_RED',
      screening_notes = 'Urgent skin lesion flagged during clinical screening requiring specialist evaluation.',
    } = body;

    if (!first_name || !last_name || !email || !zip || !insurance_carrier) {
      return NextResponse.json(
        { error: 'Missing required patient fields: first_name, last_name, email, zip, insurance_carrier are mandatory.' },
        { status: 400 }
      );
    }

    const coords = getCoordinatesForZip(zip);
    const consentToken = `tok_${Math.random().toString(36).substring(2, 12)}`;

    const newPatient: Patient = {
      id: `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '(555) 000-0000',
      zip: zip.trim(),
      lat: coords.lat,
      lng: coords.lng,
      search_radius_miles: Number(search_radius_miles) || 25,
      insurance_carrier: insurance_carrier.trim(),
      insurance_plan: insurance_plan.trim(),
      urgency_level: urgency_level as UrgencyLevel,
      screening_notes: screening_notes.trim(),
      status: 'TRIAGED',
      consent_token: consentToken,
      triage_alert_sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Save to database
    db.savePatient(newPatient);

    // Send immediate urgent alert email if flagged as Urgent Red
    let emailResult = null;
    if (newPatient.urgency_level === 'URGENT_RED') {
      const origin = req.headers.get('origin') || req.headers.get('host') || 'http://localhost:3000';
      const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;

      const emailData = getUrgentTriageAlertEmail(newPatient, baseUrl);
      emailResult = await sendEmail({
        to: newPatient.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });
    }

    return NextResponse.json({
      success: true,
      patient: newPatient,
      emailDispatched: Boolean(emailResult?.success),
      emailResult,
      message: `Patient ${newPatient.first_name} triaged as ${newPatient.urgency_level}. Urgent notification dispatched.`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Triage Error';
    console.error('Triage API Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
