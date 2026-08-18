'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Send, 
  Eye, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  RefreshCw, 
  ArrowRight,
  Filter,
  FileText,
  UserCheck
} from 'lucide-react';
import { Clinic, Patient, ReferralStatus } from '@/lib/types';
import EmailPreviewModal from './EmailPreviewModal';

interface ReferralPipelineDashboardProps {
  patients: Patient[];
  onRefresh: () => void;
}

export default function ReferralPipelineDashboard({
  patients,
  onRefresh,
}: ReferralPipelineDashboardProps) {
  const [selectedPatientForEmail, setSelectedPatientForEmail] = useState<Patient | null>(null);
  const [selectedClinicForEmail, setSelectedClinicForEmail] = useState<Clinic | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Trigger 2-Tier Match for a specific patient or all triaged patients
  const handleRunMatch = async (patientId?: string) => {
    setMatchingInProgress(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientId ? { patientId } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute matching.');
      onRefresh();
    } catch (err) {
      console.error('Error running match:', err);
    } finally {
      setMatchingInProgress(false);
    }
  };

  // Trigger Dispatch for a patient
  const handleDispatch = async (patient: Patient) => {
    setDispatchingId(patient.id);
    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          signature: `${patient.first_name} ${patient.last_name} (Fast-Track Auth)`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch referral.');
      onRefresh();
    } catch (err) {
      console.error('Error dispatching referral:', err);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleOpenEmailPreview = (patient: Patient) => {
    setSelectedPatientForEmail(patient);
    setSelectedClinicForEmail(patient.matched_clinic || null);
    setIsEmailModalOpen(true);
  };

  // Pipeline categorization
  const triagedPatients = patients.filter((p) => p.status === 'TRIAGED');
  const matchedPatients = patients.filter((p) => p.status === 'MATCH_FOUND');
  const consentRequestedPatients = patients.filter((p) => p.status === 'CONSENT_REQUESTED');
  const consentGrantedPatients = patients.filter((p) => p.status === 'CONSENT_GRANTED');
  const completedPatients = patients.filter((p) => p.status === 'COMPLETED' || p.status === 'DISPATCHED');

  const filteredPatients = patients.filter((p) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'URGENT_RED') return p.urgency_level === 'URGENT_RED';
    if (statusFilter === 'TIER_1') return p.match_tier === 'TIER_1';
    if (statusFilter === 'TIER_2') return p.match_tier === 'TIER_2';
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter View:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="ALL">All Referrals ({patients.length})</option>
            <option value="URGENT_RED">Urgent Red Flags Only</option>
            <option value="TRIAGED">1. Triage Stage</option>
            <option value="CONSENT_REQUESTED">2. Consent Pending</option>
            <option value="COMPLETED">3. Dispatched / Completed</option>
            <option value="TIER_1">Tier 1 Partners Only</option>
            <option value="TIER_2">Tier 2 Fallback Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {triagedPatients.length > 0 && (
            <button
              onClick={() => handleRunMatch()}
              disabled={matchingInProgress}
              className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {matchingInProgress ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Run 2-Tier Match for Pending ({triagedPatients.length})</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition flex items-center gap-1"
            title="Refresh pipeline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 4-Stage Visual Referral Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Column 1: Urgent Triage */}
        <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                1. Urgent Triage
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
              {triagedPatients.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {triagedPatients.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No patients waiting in triage.</div>
            ) : (
              triagedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white p-3.5 rounded-lg border border-red-200 shadow-sm hover:shadow transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {patient.first_name} {patient.last_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{patient.email}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                      URGENT RED
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded border border-slate-100">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      ZIP {patient.zip} &bull; Radius: {patient.search_radius_miles} mi
                    </p>
                    <p className="font-medium text-slate-800">
                      🛡️ {patient.insurance_carrier}
                    </p>
                    <p className="text-slate-500 italic text-[10px] line-clamp-2">
                      &quot;{patient.screening_notes}&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleRunMatch(patient.id)}
                      disabled={matchingInProgress}
                      className="flex-1 py-1.5 px-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] rounded transition flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Run 2-Tier Match
                    </button>
                    <button
                      onClick={() => handleOpenEmailPreview(patient)}
                      title="Inspect Email Template"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Matching Engine / Match Found */}
        <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                2. Matched Practice
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
              {matchedPatients.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {matchedPatients.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No newly matched records.</div>
            ) : (
              matchedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white p-3.5 rounded-lg border border-teal-200 shadow-sm hover:shadow transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {patient.first_name} {patient.last_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{patient.email}</p>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        patient.match_tier === 'TIER_1'
                          ? 'bg-teal-100 text-teal-800 border border-teal-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {patient.match_tier === 'TIER_1' ? 'Tier 1 Partner' : 'Tier 2 Fallback'}
                    </span>
                  </div>

                  {patient.matched_clinic && (
                    <div className="text-[11px] text-slate-700 bg-teal-50/60 p-2 rounded border border-teal-100 space-y-1">
                      <p className="font-bold text-teal-900">{patient.matched_clinic.name}</p>
                      <p className="text-slate-600">
                        🚗 {patient.match_distance_miles} miles away &bull; ZIP {patient.matched_clinic.zip}
                      </p>
                      <p className="text-teal-700 font-medium">
                        ⏱️ Est. wait: ~{patient.matched_clinic.avg_wait_days} days
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleOpenEmailPreview(patient)}
                      className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-[11px] rounded transition flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Preview Consent Email
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Consent Requested & In-Progress */}
        <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                3. Consent Portal
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              {consentRequestedPatients.length + consentGrantedPatients.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {consentRequestedPatients.length === 0 && consentGrantedPatients.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No consent requests pending.</div>
            ) : (
              [...consentRequestedPatients, ...consentGrantedPatients].map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white p-3.5 rounded-lg border border-blue-200 shadow-sm hover:shadow transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {patient.first_name} {patient.last_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{patient.email}</p>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        patient.status === 'CONSENT_GRANTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {patient.status === 'CONSENT_GRANTED' ? 'Consent Signed ✅' : 'Email Sent ✉️'}
                    </span>
                  </div>

                  {patient.matched_clinic && (
                    <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="font-semibold text-slate-900">{patient.matched_clinic.name}</p>
                      <p className="text-slate-500 text-[10px]">
                        Matched via {patient.match_tier === 'TIER_1' ? 'Tier 1 Partner' : 'Tier 2 Area Search'}
                      </p>
                    </div>
                  )}

                  {/* Direct Test Portal Link */}
                  <a
                    href={`/consent?patientId=${patient.id}&token=${patient.consent_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-[11px] rounded transition flex items-center justify-center gap-1"
                  >
                    <span>Open Patient Consent Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Quick Dispatch Action */}
                  <button
                    onClick={() => handleDispatch(patient)}
                    disabled={dispatchingId === patient.id}
                    className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded transition flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {dispatchingId === patient.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                    <span>Authorize &amp; Dispatch to Clinic</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 4: Dispatched & Completed */}
        <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                4. Dispatched / Complete
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              {completedPatients.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {completedPatients.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No completed referrals yet.</div>
            ) : (
              completedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white p-3.5 rounded-lg border border-emerald-200 shadow-sm hover:shadow transition space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {patient.first_name} {patient.last_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{patient.email}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      ALL CLEAR
                    </span>
                  </div>

                  {patient.matched_clinic && (
                    <div className="text-[11px] text-emerald-950 bg-emerald-50/70 p-2 rounded border border-emerald-100 space-y-1">
                      <p className="font-bold text-emerald-900">{patient.matched_clinic.name}</p>
                      <p className="text-[10px] text-slate-600">
                        📞 {patient.matched_clinic.phone} &bull; ✉️ {patient.matched_clinic.email}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium">
                        Dispatched: {patient.dispatched_at ? new Date(patient.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Confirmed'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleOpenEmailPreview(patient)}
                    className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] rounded transition flex items-center justify-center gap-1 border border-slate-200"
                  >
                    <Eye className="w-3 h-3" />
                    Inspect Clinical Transmission
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Email Inspector Modal */}
      <EmailPreviewModal
        patient={selectedPatientForEmail}
        clinic={selectedClinicForEmail}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </div>
  );
}
