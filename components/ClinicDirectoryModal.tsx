'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, ShieldCheck, MapPin, Clock, Star, Search } from 'lucide-react';
import { Clinic } from '@/lib/types';

interface ClinicDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClinicDirectoryModal({ isOpen, onClose }: ClinicDirectoryModalProps) {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTier, setFilterTier] = useState<'ALL' | 'PARTNER' | 'FALLBACK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClinics();
    }
  }, [isOpen]);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clinics');
      const data = await res.json();
      setClinics(data.clinics || []);
    } catch (e) {
      console.error('Error fetching clinics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = clinics.filter((c) => {
    if (filterTier === 'PARTNER' && !c.is_partner) return false;
    if (filterTier === 'FALLBACK' && c.is_partner) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.zip.includes(q) ||
        c.accepted_insurances.some((ins) => ins.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                2-Tier Dermatology Practice Network Database (~220 Clinics)
              </h3>
              <p className="text-xs text-slate-500">
                Tier 1 Verified In-Network Partners &amp; Tier 2 Fallback Area Directories
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

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by clinic name, city, state, ZIP, or insurance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
            <button
              onClick={() => setFilterTier('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterTier === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({clinics.length})
            </button>
            <button
              onClick={() => setFilterTier('PARTNER')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterTier === 'PARTNER'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
              }`}
            >
              Tier 1 Partners ({clinics.filter((c) => c.is_partner).length})
            </button>
            <button
              onClick={() => setFilterTier('FALLBACK')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterTier === 'FALLBACK'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Tier 2 Area Fallback ({clinics.filter((c) => !c.is_partner).length})
            </button>
          </div>
        </div>

        {/* Directory List */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading practice directory...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">No clinics matched your filter.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((clinic) => (
                <div
                  key={clinic.id}
                  className={`bg-white rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
                    clinic.is_partner
                      ? 'border-teal-200 hover:border-teal-400'
                      : 'border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          clinic.is_partner
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {clinic.is_partner ? 'Tier 1 Partner Practice' : 'Tier 2 Area Directory'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{clinic.name}</h4>
                      <p className="text-[11px] text-slate-500">{clinic.clinic_group}</p>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {clinic.rating}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 my-3">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {clinic.address}, {clinic.city}, {clinic.state} {clinic.zip}
                    </p>
                    <p className="flex items-center gap-1.5 text-teal-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      Guaranteed slot: ~{clinic.avg_wait_days} business days ({clinic.guaranteed_availability_weeks} wks)
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      In-Network Insurances:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {clinic.accepted_insurances.map((ins, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                        >
                          {ins}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {clinics.length} total clinics</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
