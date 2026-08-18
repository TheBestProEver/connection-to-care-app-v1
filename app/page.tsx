'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertCircle, 
  Building2, 
  CheckCircle2, 
  FileSpreadsheet, 
  LayoutDashboard, 
  PlusCircle, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles, 
  Users 
} from 'lucide-react';
import { Patient } from '@/lib/types';
import ReferralPipelineDashboard from '@/components/ReferralPipelineDashboard';
import BatchUpload from '@/components/BatchUpload';
import ManualIntakeForm from '@/components/ManualIntakeForm';
import ClinicDirectoryModal from '@/components/ClinicDirectoryModal';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'batch' | 'intake'>('pipeline');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    urgentRed: 0,
    triaged: 0,
    matching: 0,
    consentPending: 0,
    consentGranted: 0,
    dispatchedOrCompleted: 0,
    tier1Count: 0,
    tier2Count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients');
      const data = await res.json();
      setPatients(data.patients || []);
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error('Failed to load patients:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleResetDatabase = async () => {
    if (confirm('Reset database to clean initial sample state?')) {
      try {
        await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'RESET_DATABASE' }),
        });
        fetchPatients();
      } catch (e) {
        console.error('Failed to reset DB:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero / Pipeline Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              Peak Season Triage Automation Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Connection to Care Referral &amp; Matching Pipeline
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Automates urgent screening triage, queries our <strong>~220 partner clinic database (Tier 1)</strong> for guaranteed 2–3 week availability within patient radius, auto-expands to <strong>Tier 2 area search</strong>, and dispatches electronic clinical intake records upon patient consent.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsClinicModalOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Partner Clinic Directory (~220)</span>
            </button>

            <button
              onClick={handleResetDatabase}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl border border-slate-600 transition flex items-center gap-1.5"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Total Screenings</span>
              <Users className="w-4 h-4 text-teal-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active referrals in system</p>
          </div>

          <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-3.5 border border-red-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-red-200 font-semibold">Urgent Red Flags</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-black text-red-300 mt-1">{stats.urgentRed}</p>
            <p className="text-[11px] text-red-300/80 mt-0.5">100% automated alerts sent</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">2-Tier Matches</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-300 mt-1">
              {stats.tier1Count + stats.tier2Count}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats.tier1Count} Tier 1 &bull; {stats.tier2Count} Tier 2
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Dispatched &amp; Clear</span>
              <CheckCircle2 className="w-4 h-4 text-teal-300" />
            </div>
            <p className="text-2xl font-black text-teal-200 mt-1">{stats.dispatchedOrCompleted}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Clinic packet transmitted</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'pipeline'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Referral Pipeline Board</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'batch'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Batch Intake</span>
          </button>

          <button
            onClick={() => setActiveTab('intake')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              activeTab === 'intake'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Individual Intake</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden md:block">
          Pipeline Mode: <span className="font-semibold text-teal-700">Automated 2-Tier Resend Engine</span>
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === 'pipeline' && (
        <ReferralPipelineDashboard patients={patients} onRefresh={fetchPatients} />
      )}

      {activeTab === 'batch' && (
        <BatchUpload
          onUploadSuccess={() => {
            fetchPatients();
            setActiveTab('pipeline');
          }}
        />
      )}

      {activeTab === 'intake' && (
        <ManualIntakeForm
          onIntakeSuccess={() => {
            fetchPatients();
            setActiveTab('pipeline');
          }}
        />
      )}

      {/* Clinic Directory Modal */}
      <ClinicDirectoryModal
        isOpen={isClinicModalOpen}
        onClose={() => setIsClinicModalOpen(false)}
      />
    </div>
  );
}
