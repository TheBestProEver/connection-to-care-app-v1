'use client';

import React, { useState } from 'react';
import { UserPlus, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UrgencyLevel } from '@/lib/types';

interface ManualIntakeFormProps {
  onIntakeSuccess: () => void;
}

export default function ManualIntakeForm({ onIntakeSuccess }: ManualIntakeFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    zip: '',
    search_radius_miles: '25',
    insurance_carrier: 'Blue Cross Blue Shield',
    insurance_plan: 'Standard PPO',
    urgency_level: 'URGENT_RED' as UrgencyLevel,
    screening_notes: 'Urgent pigmented lesion detected during screening. Immediate specialist evaluation needed within 2-3 weeks.',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to triage patient.');

      setSuccess(`Patient ${formData.first_name} ${formData.last_name} triaged successfully! Urgent alert email dispatched.`);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        zip: '',
        search_radius_miles: '25',
        insurance_carrier: 'Blue Cross Blue Shield',
        insurance_plan: 'Standard PPO',
        urgency_level: 'URGENT_RED',
        screening_notes: 'Urgent pigmented lesion detected during screening. Immediate specialist evaluation needed within 2-3 weeks.',
      });
      onIntakeSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting intake';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="pb-4 border-b border-slate-100 mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-teal-600" />
          Individual Screening Intake
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Triage an individual patient from in-person screening. Urgent (Red) flags trigger automated notification.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Urgency Selector Banner */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <label className="block text-xs font-bold text-red-900 mb-1">
            Clinical Urgency Priority Flag:
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, urgency_level: 'URGENT_RED' }))}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                formData.urgency_level === 'URGENT_RED'
                  ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                  : 'bg-white text-red-700 border border-red-300 hover:bg-red-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              URGENT (Red Flag)
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, urgency_level: 'PRIORITY_YELLOW' }))}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold transition ${
                formData.urgency_level === 'PRIORITY_YELLOW'
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                  : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
              }`}
            >
              Priority (Yellow)
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, urgency_level: 'ROUTINE_GREEN' }))}
              className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold transition ${
                formData.urgency_level === 'ROUTINE_GREEN'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                  : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              Routine (Green)
            </button>
          </div>
          <p className="text-[11px] text-red-700 mt-1.5">
            ⚠️ Urgent Red automatically dispatches an immediate email alert notifying the patient of priority matching within 2–3 weeks.
          </p>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">First Name *</label>
            <input
              type="text"
              name="first_name"
              required
              placeholder="e.g. Sarah"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="last_name"
              required
              placeholder="e.g. Jenkins"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. sarah.jenkins@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Location & Radius */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Patient ZIP Code *</label>
            <input
              type="text"
              name="zip"
              required
              placeholder="e.g. 10017 or 90210"
              value={formData.zip}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Search Radius (Miles)</label>
            <select
              name="search_radius_miles"
              value={formData.search_radius_miles}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles (Recommended)</option>
              <option value="50">Within 50 miles</option>
              <option value="75">Within 75 miles</option>
            </select>
          </div>
        </div>

        {/* Insurance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Insurance Carrier *</label>
            <select
              name="insurance_carrier"
              value={formData.insurance_carrier}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
              <option value="Aetna">Aetna</option>
              <option value="UnitedHealthcare">UnitedHealthcare</option>
              <option value="Cigna">Cigna</option>
              <option value="Medicare">Medicare</option>
              <option value="Humana">Humana</option>
              <option value="Kaiser Permanente">Kaiser Permanente</option>
              <option value="Florida Blue">Florida Blue</option>
              <option value="Premera Blue Cross">Premera Blue Cross</option>
              <option value="Other Commercial Insurance">Other Commercial Insurance</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Plan / Group Details</label>
            <input
              type="text"
              name="insurance_plan"
              placeholder="e.g. Choice POS II / Gold PPO"
              value={formData.insurance_plan}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Screening notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Screening Notes &amp; Lesion Description</label>
          <textarea
            name="screening_notes"
            rows={2}
            value={formData.screening_notes}
            onChange={handleChange}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            'Triage & Dispatching Alert...'
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Triage &amp; Dispatch Urgent Alert Email</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
