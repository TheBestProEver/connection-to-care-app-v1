'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  FileCheck, 
  Lock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Clinic, Patient } from '@/lib/types';

function ConsentContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId') || searchParams.get('id');
  const token = searchParams.get('token');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [signature, setSignature] = useState('');
  const [agreedHipaa, setAgreedHipaa] = useState(true);
  const [agreedOutreach, setAgreedOutreach] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatient();
  }, [patientId, token]);

  const fetchPatient = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/patients?';
      if (token) url += `token=${encodeURIComponent(token)}`;
      else if (patientId) url += `id=${encodeURIComponent(patientId)}`;
      else {
        // Fallback demo: fetch first patient with a match if no params provided
        const allRes = await fetch('/api/patients');
        const allData = await allRes.json();
        const demoPat = (allData.patients || []).find((p: Patient) => p.matched_clinic_id) || allData.patients?.[0];
        if (demoPat) {
          setPatient(demoPat);
          setClinic(demoPat.matched_clinic || null);
          setSignature(`${demoPat.first_name} ${demoPat.last_name}`);
          if (demoPat.status === 'COMPLETED') setSubmitted(true);
        }
        setLoading(false);
        return;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.patient) throw new Error(data.error || 'Referral authorization record not found.');

      setPatient(data.patient);
      setClinic(data.patient.matched_clinic || null);
      setSignature(`${data.patient.first_name} ${data.patient.last_name}`);
      if (data.patient.status === 'COMPLETED' || data.patient.status === 'DISPATCHED') {
        setSubmitted(true);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error retrieving referral';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedHipaa || !agreedOutreach) {
      setError('Please check all authorization acknowledgments to proceed.');
      return;
    }
    if (!signature.trim()) {
      setError('Please enter your full digital signature.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient?.id,
          token: patient?.consent_token || token,
          signature: signature.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authorize and dispatch records.');

      setSubmitted(true);
      setPatient(data.patient);

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit authorization';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-slate-500 text-sm">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading secure patient authorization portal...
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h2 className="font-bold text-lg">Unable to Load Referral Authorization</h2>
          <p className="text-xs text-red-700">{error}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 px-4">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 mb-2">
          <Lock className="w-3.5 h-3.5" />
          HIPAA Compliant Patient Authorization
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Connection to Care Record Release
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Review your matched dermatology provider and authorize transmission of your screening notes.
        </p>
      </div>

      {submitted ? (
        /* Confirmed / All Clear Success State */
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Referral Dispatched &bull; All Clear
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Your Screening Records Have Been Transmitted!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              A completion notice has been sent to <strong>{patient?.email}</strong>. The specialist care team at <strong>{clinic?.name || 'the matched clinic'}</strong> will contact you within 24–48 hours.
            </p>
          </div>

          {clinic && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Direct Provider Contact Info
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  In-Network ({patient?.insurance_carrier})
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <h3 className="font-bold text-slate-900 text-sm">{clinic.name}</h3>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {clinic.address}, {clinic.city}, {clinic.state} {clinic.zip}
                </p>
                <p className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {clinic.phone}
                </p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {clinic.email}
                </p>
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800">Next Steps &amp; Scheduling Advice:</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Keep your phone handy over the next 1–2 business days.</li>
              <li>If you prefer to book immediately, call the clinic at <strong>{clinic?.phone}</strong> and state that you are calling regarding a Connection to Care Urgent Dermatology Referral.</li>
              <li>Bring your photo ID and insurance card ({patient?.insurance_carrier}) to your appointment.</li>
            </ul>
          </div>

          <div className="text-center pt-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow"
            >
              <span>Return to Main Pipeline Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        /* Authorization Form State */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          {/* Matched Practice Summary Card */}
          <div className="bg-gradient-to-br from-teal-50/80 to-slate-50 border-2 border-teal-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-600 text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
                {patient?.match_tier === 'TIER_1' ? 'Tier 1 Partner Practice' : 'Tier 2 Area Dermatology Search'}
              </span>
              <span className="text-xs font-semibold text-teal-800">
                In-Network with {patient?.insurance_carrier}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">{clinic?.name || 'Matched Dermatology Clinic'}</h2>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {clinic ? `${clinic.address}, ${clinic.city}, ${clinic.state} ${clinic.zip}` : 'Provider address on file'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-200/50 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-teal-100">
                <span className="text-[10px] text-slate-500 font-medium">Distance from your ZIP:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  🚗 {patient?.match_distance_miles || 2.4} miles
                </p>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-teal-100">
                <span className="text-[10px] text-slate-500 font-medium">Estimated Appointment Wait:</span>
                <p className="font-bold text-teal-700 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{clinic?.avg_wait_days || 7} business days
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Findings Review */}
          <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 text-xs space-y-1.5 text-red-900">
            <span className="font-bold flex items-center gap-1 text-red-700">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              Reason for Urgent Referral:
            </span>
            <p className="text-slate-700 italic">
              &quot;{patient?.screening_notes || 'High risk skin lesion evaluation needed within 2-3 weeks.'}&quot;
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Consent Form */}
          <form onSubmit={handleAuthorize} className="space-y-4 pt-2">
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedHipaa}
                  onChange={(e) => setAgreedHipaa(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700">
                  <strong>HIPAA Authorization:</strong> I hereby authorize Connection to Care to release my dermatology screening notes, photos, and demographic records directly to <strong>{clinic?.name || 'the matched clinic'}</strong> for referral evaluation.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedOutreach}
                  onChange={(e) => setAgreedOutreach(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-700">
                  <strong>Provider Outreach Permission:</strong> I grant permission for the clinic scheduling team to contact me via phone ({patient?.phone}) and email ({patient?.email}) to arrange my appointment within the guaranteed 2–3 week availability window.
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Digital Signature (Type your full legal name) *
              </label>
              <input
                type="text"
                required
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-serif italic text-slate-900"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Legally binding digital signature timestamped upon submission.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                'Transmitting Records...'
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Authorize &amp; Send Screening Records to Clinic</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-xs text-slate-400">Loading portal...</div>}>
      <ConsentContent />
    </Suspense>
  );
}
