'use client';

import React, { useState } from 'react';
import { X, Mail, Eye } from 'lucide-react';
import { Clinic, Patient } from '@/lib/types';
import {
  getUrgentTriageAlertEmail,
  getPatientConsentRequestEmail,
  getClinicReferralPackageEmail,
  getPatientCompletionEmail,
} from '@/lib/emailTemplates';

interface EmailPreviewModalProps {
  patient: Patient | null;
  clinic: Clinic | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailPreviewModal({
  patient,
  clinic,
  isOpen,
  onClose,
}: EmailPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'triage' | 'consent' | 'clinic' | 'completion'>('triage');

  if (!isOpen || !patient) return null;

  const mockClinic: Clinic = clinic || {
    id: 'clinic-sample',
    name: 'Manhattan Dermatology Associates',
    clinic_group: 'Metro Derm Partners',
    address: '420 Lexington Ave, Ste 800',
    city: 'New York',
    state: 'NY',
    zip: '10017',
    lat: 40.7527,
    lng: -73.9772,
    phone: '(212) 555-0143',
    fax: '(212) 555-0144',
    email: 'referrals@manhattanderm.example.com',
    is_partner: true,
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
    avg_wait_days: 7,
    guaranteed_availability_weeks: 2,
    rating: 4.9,
    active: true,
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const triageEmail = getUrgentTriageAlertEmail(patient, baseUrl);
  const consentEmail = getPatientConsentRequestEmail(
    patient,
    mockClinic,
    patient.match_tier || 'TIER_1',
    patient.match_distance_miles || 2.4,
    baseUrl
  );
  const clinicEmail = getClinicReferralPackageEmail(patient, mockClinic);
  const completionEmail = getPatientCompletionEmail(patient, mockClinic);

  let currentContent = triageEmail;
  if (activeTab === 'consent') currentContent = consentEmail;
  if (activeTab === 'clinic') currentContent = clinicEmail;
  if (activeTab === 'completion') currentContent = completionEmail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Automated Email Template Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Live rendering for {patient.first_name} {patient.last_name} ({patient.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'triage'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Urgent Triage Alert
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'consent'
                ? 'border-teal-600 text-teal-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Patient Consent Request
          </button>
          <button
            onClick={() => setActiveTab('clinic')}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'clinic'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Clinic Referral Transmission
          </button>
          <button
            onClick={() => setActiveTab('completion')}
            className={`px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === 'completion'
                ? 'border-emerald-600 text-emerald-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Patient Completion &quot;All Clear&quot;
          </button>
        </div>

        {/* Subject preview */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 text-xs flex items-center gap-2">
          <span className="font-semibold text-slate-500">Subject:</span>
          <span className="font-medium text-slate-800">{currentContent.subject}</span>
        </div>

        {/* HTML Email Body Container */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div
              dangerouslySetInnerHTML={{ __html: currentContent.html }}
              className="preview-email-content"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-teal-600" />
            Live Resend payload formatted for mobile and desktop email clients
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
