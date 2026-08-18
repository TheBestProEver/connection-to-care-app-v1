'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, RefreshCw, ArrowRight } from 'lucide-react';
import { BatchPatientRow } from '@/lib/types';

interface BatchUploadProps {
  onUploadSuccess: () => void;
}

export default function BatchUpload({ onUploadSuccess }: BatchUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<BatchPatientRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCsv(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCsv(e.dataTransfer.files[0]);
    }
  };

  const processCsv = (selectedFile: File) => {
    setFile(selectedFile);
    setErrors([]);
    setSuccessMessage(null);

    Papa.parse<BatchPatientRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validationErrors: string[] = [];
        const validRows: BatchPatientRow[] = [];

        results.data.forEach((row, index) => {
          const rowNum = index + 2; // Accounting for 1-based index and header
          if (!row.first_name || !row.last_name) {
            validationErrors.push(`Row ${rowNum}: Missing patient name.`);
          } else if (!row.email) {
            validationErrors.push(`Row ${rowNum} (${row.first_name} ${row.last_name}): Missing email address.`);
          } else if (!row.zip) {
            validationErrors.push(`Row ${rowNum} (${row.first_name} ${row.last_name}): Missing ZIP code.`);
          } else if (!row.insurance_carrier) {
            validationErrors.push(`Row ${rowNum} (${row.first_name} ${row.last_name}): Missing insurance carrier.`);
          } else {
            validRows.push({
              first_name: row.first_name,
              last_name: row.last_name,
              email: row.email,
              phone: row.phone || '(555) 000-0000',
              zip: row.zip,
              search_radius_miles: row.search_radius_miles || 25,
              insurance_carrier: row.insurance_carrier,
              insurance_plan: row.insurance_plan || 'Standard PPO',
              urgency_level: row.urgency_level || 'URGENT_RED',
              screening_notes: row.screening_notes || 'Batch mobile clinic screening intake.',
            });
          }
        });

        setErrors(validationErrors);
        setParsedRows(validRows);
      },
      error: (err) => {
        setErrors([`Failed to parse CSV file: ${err.message}`]);
      },
    });
  };

  const handleUploadAndTriage = async (autoMatch: boolean = false) => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setSuccessMessage(null);

    try {
      // 1. Post batch patients to database
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchPatients: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to ingest batch patients.');

      const ingestedPatients = data.patients || [];

      // 2. If autoMatch is requested, trigger match API for all ingested patients
      if (autoMatch && ingestedPatients.length > 0) {
        setIsMatching(true);
        const matchRes = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientIds: ingestedPatients.map((p: { id: string }) => p.id) }),
        });
        const matchData = await matchRes.json();
        setIsMatching(false);

        setSuccessMessage(
          `Batch Complete: Ingested ${ingestedPatients.length} patients and matched ${matchData.matchedCount} with 2-Tier clinics. Consent emails dispatched!`
        );
      } else {
        setSuccessMessage(`Successfully triaged ${ingestedPatients.length} urgent patients into the pipeline.`);
      }

      // Reset file input
      setFile(null);
      setParsedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing batch upload';
      setErrors([msg]);
    } finally {
      setIsProcessing(false);
      setIsMatching(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            Flexible Batch Intake (CSV Parser)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload screening event rosters (ZIP, Radius, Insurance Carrier/Plan) for immediate triage and matching.
          </p>
        </div>

        <a
          href="/sample_dermatology_patients.csv"
          download="sample_dermatology_patients.csv"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Download Sample CSV
        </a>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="mt-4 border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/40 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,text/csv"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          {file ? `Selected: ${file.name}` : 'Click to upload or drag & drop patient CSV spreadsheet'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supports standard mobile screening exports (Headers: first_name, last_name, email, phone, zip, insurance_carrier)
        </p>
      </div>

      {/* Errors display */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
          <div className="font-semibold flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Validation Notices ({errors.length}):
          </div>
          <ul className="list-disc pl-4 space-y-0.5 max-h-28 overflow-y-auto">
            {errors.map((e, idx) => (
              <li key={idx}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Parsed Rows Preview */}
      {parsedRows.length > 0 && (
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">
              Previewing {parsedRows.length} Valid Patient Records
            </span>
            <span className="text-slate-400">All flagged as Urgent (Red) triage priority</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="py-2 px-3">Patient</th>
                  <th className="py-2 px-3">Contact</th>
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Insurance</th>
                  <th className="py-2 px-3">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-900">
                      {row.first_name} {row.last_name}
                    </td>
                    <td className="py-2 px-3 text-slate-600">{row.email}</td>
                    <td className="py-2 px-3 text-slate-600">
                      ZIP {row.zip} ({row.search_radius_miles} mi)
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-medium">
                      {row.insurance_carrier}
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                        URGENT RED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
            <button
              onClick={() => handleUploadAndTriage(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition disabled:opacity-50"
            >
              {isProcessing ? 'Ingesting...' : '1. Ingest to Triage Pool'}
            </button>

            <button
              onClick={() => handleUploadAndTriage(true)}
              disabled={isProcessing}
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isProcessing || isMatching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {isMatching ? 'Running 2-Tier Matcher...' : 'Processing Batch...'}
                </>
              ) : (
                <>
                  <span>Ingest &amp; Auto-Match Entire Batch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
