import { Clinic, Patient } from './types';

/**
 * 1. Urgent Triage Alert Email Template (Patient)
 */
export function getUrgentTriageAlertEmail(patient: Patient, baseUrl: string): { subject: string; html: string; text: string } {
  const patientName = `${patient.first_name} ${patient.last_name}`;
  const subject = `⚠️ URGENT: Action Needed Regarding Your Recent Dermatology Screening - ${patient.first_name}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #dc2626; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .body { padding: 28px 24px; }
    .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 16px; border-radius: 6px; margin: 18px 0; }
    .button { display: inline-block; background-color: #dc2626; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; margin: 16px 0; }
    .footer { padding: 20px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
    .meta-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    .meta-table td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
    .meta-table td:first-child { font-weight: 600; color: #475569; width: 35%; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Connection to Care — Urgent Referral Notice</h1>
      <span class="badge">Urgent Triage Status: RED FLAG</span>
    </div>
    <div class="body">
      <p>Dear <strong>${patientName}</strong>,</p>
      <div class="alert-box">
        <p style="margin: 0; font-weight: 600; color: #991b1b;">Immediate Follow-up Recommended</p>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #7f1d1d;">
          During your recent skin health screening, our clinical team identified an area of concern that warrants a prompt evaluation by a specialist within <strong>2 to 3 weeks</strong>.
        </p>
      </div>

      <p>To eliminate wait times and prevent delays, our automated matching system is actively finding an in-network dermatology partner near your location (ZIP: <strong>${patient.zip}</strong>) with guaranteed priority availability.</p>

      <table class="meta-table">
        <tr><td>Patient Name:</td><td>${patientName}</td></tr>
        <tr><td>Insurance Carrier:</td><td>${patient.insurance_carrier} (${patient.insurance_plan || 'Standard'})</td></tr>
        <tr><td>Search Radius:</td><td>Within ${patient.search_radius_miles} miles of ${patient.zip}</td></tr>
        <tr><td>Clinical Priority:</td><td><strong style="color: #dc2626;">Urgent (2–3 Week Window)</strong></td></tr>
      </table>

      <p><strong>What Happens Next:</strong></p>
      <ol style="padding-left: 20px; font-size: 14px; color: #334155;">
        <li>Our 2-Tier Matching Engine will pair you with the highest-rated in-network clinic.</li>
        <li>You will receive a one-click authorization request to approve sending your screening records.</li>
        <li>The partner clinic will receive your referral package immediately for direct outreach.</li>
      </ol>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${baseUrl}/consent?patientId=${patient.id}&token=${patient.consent_token}" class="button">View Referral Status & Intake Details &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Connection to Care Referral & Matching System &bull; Confidential Healthcare Communication &bull; HIPAA Compliant
    </div>
  </div>
</body>
</html>`;

  const text = `URGENT NOTICE: Action Needed Regarding Your Recent Dermatology Screening
Dear ${patientName},
Our clinical team identified a screening finding requiring follow-up within 2-3 weeks.
Our automated system is locating an in-network dermatology clinic near ZIP ${patient.zip}.
View your status here: ${baseUrl}/consent?patientId=${patient.id}&token=${patient.consent_token}`;

  return { subject, html, text };
}

/**
 * 2. Patient Consent & Authorization Request Email Template
 */
export function getPatientConsentRequestEmail(
  patient: Patient,
  clinic: Clinic,
  tier: string,
  distanceMiles: number,
  baseUrl: string
): { subject: string; html: string; text: string } {
  const patientName = `${patient.first_name} ${patient.last_name}`;
  const consentUrl = `${baseUrl}/consent?patientId=${patient.id}&token=${patient.consent_token}`;
  const tierBadge = tier === 'TIER_1' ? 'Tier 1 Verified Partner Practice' : 'Tier 2 Area Dermatology Search';
  const tierColor = tier === 'TIER_1' ? '#0d9488' : '#d97706';

  const subject = `Action Required: 1-Click Consent to Release Screening Records to ${clinic.name}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 28px 24px; }
    .clinic-card { background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .clinic-title { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
    .tag { display: inline-block; background-color: ${tierColor}; color: white; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .button { display: inline-block; background-color: #0d9488; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 16px; margin: 12px 0; }
    .footer { padding: 20px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Connection to Care — Clinic Match Found</h1>
    </div>
    <div class="body">
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>Great news: We have successfully matched your urgent dermatology referral with a qualified specialist who meets your insurance requirements and has guaranteed availability within <strong>2–3 weeks</strong>.</p>

      <div class="clinic-card">
        <span class="tag">${tierBadge}</span>
        <h2 class="clinic-title">${clinic.name}</h2>
        <p style="margin: 4px 0; color: #475569; font-size: 14px;">📍 ${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}</p>
        <p style="margin: 4px 0; color: #475569; font-size: 14px;">🚗 <strong>${distanceMiles} miles</strong> from your location</p>
        <p style="margin: 4px 0; color: #475569; font-size: 14px;">🛡️ Insurance: <strong>In-Network (${patient.insurance_carrier})</strong></p>
        <p style="margin: 4px 0; color: #0d9488; font-size: 14px; font-weight: 600;">⏱️ Estimated Appointment Availability: <strong>${clinic.avg_wait_days} business days</strong></p>
      </div>

      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px; border-radius: 6px; margin: 18px 0; font-size: 14px; color: #1e3a8a;">
        <strong>Patient Consent Requirement:</strong> Under HIPAA regulations, we need your digital authorization before transmitting your screening notes and photos to ${clinic.name}.
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${consentUrl}" class="button">Authorize & Send Records Now &rarr;</a>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center;">
        Or copy and paste this link into your browser:<br/>
        <a href="${consentUrl}" style="color: #0d9488;">${consentUrl}</a>
      </p>
    </div>
    <div class="footer">
      Connection to Care Referral & Matching System &bull; Confidential
    </div>
  </div>
</body>
</html>`;

  const text = `Clinic Match Found for ${patientName}!
Matched Clinic: ${clinic.name}
Distance: ${distanceMiles} miles | Insurance: ${patient.insurance_carrier}
Estimated Wait: ~${clinic.avg_wait_days} days
Please authorize record release here: ${consentUrl}`;

  return { subject, html, text };
}

/**
 * 3. Clinic Referral Package & Clinical Summary Email (To Clinic)
 */
export function getClinicReferralPackageEmail(
  patient: Patient,
  clinic: Clinic
): { subject: string; html: string; text: string } {
  const patientName = `${patient.first_name} ${patient.last_name}`;
  const subject = `URGENT REFERRAL (${patient.urgency_level}): Patient Intake Package - ${patientName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #1e293b; background: #f8fafc; }
    .container { max-width: 650px; margin: 20px auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
    .urgent-banner { background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; padding: 12px 16px; border-radius: 6px; font-weight: 700; font-size: 14px; margin: 16px 0; }
    .section { margin: 20px 0; }
    .section-title { font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; margin-bottom: 12px; }
    .info-grid { width: 100%; border-collapse: collapse; font-size: 14px; }
    .info-grid td { padding: 6px 8px; vertical-align: top; }
    .info-grid td.label { font-weight: 600; color: #64748b; width: 35%; }
    .consent-stamp { background: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 12px; border-radius: 6px; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="float: right; text-align: right; font-size: 12px; color: #64748b;">
        Ref ID: ${patient.id.slice(0, 8)}<br/>
        Dispatched: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}
      </div>
      <h1 class="title">Connection to Care — Urgent Referral Transmission</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Direct Provider Transmission to ${clinic.name}</p>
    </div>

    <div class="urgent-banner">
      🚨 HIGH PRIORITY / URGENT DERMATOLOGY SCREENING FINDING (2-3 WEEK WINDOW)
    </div>

    <div class="section">
      <div class="section-title">Patient Demographics & Contact</div>
      <table class="info-grid">
        <tr><td class="label">Patient Name:</td><td><strong>${patientName}</strong></td></tr>
        <tr><td class="label">Contact Phone:</td><td><a href="tel:${patient.phone}">${patient.phone}</a></td></tr>
        <tr><td class="label">Contact Email:</td><td><a href="mailto:${patient.email}">${patient.email}</a></td></tr>
        <tr><td class="label">Location / ZIP:</td><td>${patient.zip}</td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Coverage & Insurance Information</div>
      <table class="info-grid">
        <tr><td class="label">Primary Carrier:</td><td><strong>${patient.insurance_carrier}</strong></td></tr>
        <tr><td class="label">Plan Details:</td><td>${patient.insurance_plan || 'Standard PPO/EPO'}</td></tr>
        <tr><td class="label">Network Status:</td><td><span style="color: #16a34a; font-weight: 600;">Verified Accepted</span></td></tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Clinical Screening Summary & Notes</div>
      <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 14px; color: #334155;">
        ${patient.screening_notes || 'Patient screened positive for high-risk pigmented skin lesion requiring prompt clinical evaluation and dermoscopy.'}
      </div>
    </div>

    <div class="section">
      <div class="section-title">HIPAA Authorization & Consent Verification</div>
      <div class="consent-stamp">
        ✅ <strong>Digital Patient Consent Verified</strong><br/>
        Authorized by: ${patient.consent_signature || patientName}<br/>
        Timestamp: ${patient.consent_date ? new Date(patient.consent_date).toLocaleString() : new Date().toLocaleString()}<br/>
        Record Release Authorized specifically for: ${clinic.name}
      </div>
    </div>

    <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
      Please initiate patient outreach within 24–48 hours to schedule the initial consultation. Thank you for partnering with Connection to Care.
    </p>
  </div>
</body>
</html>`;

  const text = `URGENT REFERRAL INTAKE: ${patientName}
Urgency: ${patient.urgency_level}
Phone: ${patient.phone} | Email: ${patient.email} | ZIP: ${patient.zip}
Insurance: ${patient.insurance_carrier} (${patient.insurance_plan})
Clinical Notes: ${patient.screening_notes || 'High risk skin lesion evaluation needed within 2-3 weeks.'}
Patient Consent: Verified on file.`;

  return { subject, html, text };
}

/**
 * 4. Patient Completion / "All Clear" Best Wishes Email
 */
export function getPatientCompletionEmail(
  patient: Patient,
  clinic: Clinic
): { subject: string; html: string; text: string } {
  const patientName = `${patient.first_name} ${patient.last_name}`;
  const subject = `✅ All Clear: Your Dermatology Referral has been Transmitted to ${clinic.name}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0d9488; color: #ffffff; padding: 28px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 28px 24px; }
    .success-card { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .footer { padding: 20px; background: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
      <h1>Referral Successfully Dispatched</h1>
    </div>
    <div class="body">
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>You're all set! Your clinical screening records and intake authorization have been securely transmitted directly to the care team at <strong>${clinic.name}</strong>.</p>

      <div class="success-card">
        <h3 style="margin: 0 0 8px 0; color: #0f766e;">Matched Clinic Information</h3>
        <p style="margin: 4px 0; font-size: 14px;"><strong>${clinic.name}</strong></p>
        <p style="margin: 4px 0; font-size: 14px; color: #475569;">📍 ${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #475569;">📞 Phone: <strong>${clinic.phone}</strong></p>
        <p style="margin: 4px 0; font-size: 14px; color: #475569;">✉️ Email: ${clinic.email}</p>
      </div>

      <h3 style="font-size: 16px; color: #0f172a; margin-top: 20px;">What to Expect Next:</h3>
      <ul style="font-size: 14px; color: #334155; padding-left: 20px;">
        <li><strong>Clinic Outreach:</strong> The clinic's scheduling coordinator will reach out to you by phone or email within <strong>24 to 48 hours</strong> to confirm your appointment time.</li>
        <li><strong>Direct Contact:</strong> If you would like to schedule sooner or have questions, you may call them directly at <strong>${clinic.phone}</strong>. Mention your Connection to Care referral.</li>
      </ul>

      <p style="margin-top: 24px;">Thank you for taking proactive steps for your skin health. We wish you the very best with your upcoming appointment!</p>
      
      <p style="margin-top: 16px; font-weight: 600; color: #0d9488;">— The Connection to Care Team</p>
    </div>
    <div class="footer">
      Connection to Care Referral & Matching System &bull; Confidential Healthcare Communication
    </div>
  </div>
</body>
</html>`;

  const text = `All Clear! Your referral has been dispatched to ${clinic.name}.
Clinic Contact: ${clinic.phone} | ${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}
The clinic will contact you within 24-48 hours to schedule your appointment.
Best wishes,
The Connection to Care Team`;

  return { subject, html, text };
}
