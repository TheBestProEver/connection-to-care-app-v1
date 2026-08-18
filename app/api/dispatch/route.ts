import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { getClinicReferralPackageEmail, getPatientCompletionEmail } from '@/lib/emailTemplates';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, token, signature } = body;

    let patient = null;
    if (patientId) {
      patient = db.getPatientById(patientId);
    } else if (token) {
      patient = db.getPatientByToken(token);
    }

    if (!patient) {
      return NextResponse.json({ error: 'Patient referral record not found.' }, { status: 404 });
    }

    if (!patient.matched_clinic_id) {
      return NextResponse.json(
        { error: 'Cannot dispatch referral: No matched clinic is assigned to this patient yet.' },
        { status: 400 }
      );
    }

    const clinic = db.getClinicById(patient.matched_clinic_id);
    if (!clinic) {
      return NextResponse.json({ error: 'Matched clinic details not found.' }, { status: 404 });
    }

    // 1. Update patient consent & dispatch state
    const consentSignature = signature || `${patient.first_name} ${patient.last_name} (Digital Auth)`;
    const now = new Date().toISOString();

    const updatedPatient = db.updatePatient(patient.id, {
      status: 'COMPLETED',
      consent_date: patient.consent_date || now,
      consent_signature: consentSignature,
      dispatched_at: now,
    });

    if (!updatedPatient) {
      return NextResponse.json({ error: 'Failed to update referral record.' }, { status: 500 });
    }

    // 2. Transmit Patient Referral Package to Clinic
    const clinicEmailData = getClinicReferralPackageEmail(updatedPatient, clinic);
    const clinicEmailRes = await sendEmail({
      to: clinic.email,
      subject: clinicEmailData.subject,
      html: clinicEmailData.html,
      text: clinicEmailData.text,
    });

    // 3. Send Patient Completion ("All Clear, Best Wishes") Email
    const patientEmailData = getPatientCompletionEmail(updatedPatient, clinic);
    const patientEmailRes = await sendEmail({
      to: updatedPatient.email,
      subject: patientEmailData.subject,
      html: patientEmailData.html,
      text: patientEmailData.text,
    });

    return NextResponse.json({
      success: true,
      patient: updatedPatient,
      clinic,
      clinicTransmitted: Boolean(clinicEmailRes.success),
      patientConfirmed: Boolean(patientEmailRes.success),
      message: `Referral successfully dispatched to ${clinic.name}. Completion notification sent to ${updatedPatient.first_name}.`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal Dispatch Error';
    console.error('Dispatch API Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
