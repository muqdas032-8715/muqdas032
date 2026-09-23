import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Printer, PlusCircle, Shield, FileCheck, PhoneCall, Mail } from 'lucide-react';
import { ApplicationSubmissionResponse } from '../types.ts';

interface ApplicationSuccessProps {
  data: ApplicationSubmissionResponse;
  onReset: () => void;
}

export const ApplicationSuccess: React.FC<ApplicationSuccessProps> = ({ data, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(data.submittedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Application Submitted Successfully!
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Thank you, <strong className="text-slate-800">{data.candidateName}</strong>. Your profile for{' '}
          <strong className="text-slate-800">{data.position}</strong> has been safely recorded in our recruitment database.
        </p>

        {/* Application ID Highlight Box */}
        <div className="mt-6 p-5 bg-slate-50 rounded-xl border border-slate-200 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Official Application Reference Number
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-wide mt-0.5">
                {data.applicationId}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 active:bg-slate-100 transition shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Application ID</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Submitted on: {formattedDate}</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Status: Under Initial Screening
            </span>
          </div>
        </div>

        {/* Security and Privacy Notice */}
        <div className="mt-5 p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-3 text-left">
          <Shield className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <p className="font-semibold text-blue-900">Privacy & Data Protection Assured</p>
            <p className="mt-0.5 text-slate-600">
              Your personal data, CNIC/Passport information, and CV are strictly confidential. They are only accessible by authorized HR officers and will never be shared publicly or displayed to other candidates.
            </p>
          </div>
        </div>

        {/* Next Steps Timeline */}
        <div className="mt-8 text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            What Happens Next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Document Verification</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Our recruiting officers will examine your qualification diplomas, CV, and professional background within 24 to 48 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">WhatsApp & Email Notification</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  If shortlisted, our HR manager will reach out directly on your WhatsApp and email with client interview dates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Visa & Relocation Support</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  For overseas placements, our visa clearance desk will guide you through medical tests, degree attestation, and flight bookings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-3 no-print">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Application Slip</span>
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Another Application</span>
          </button>
        </div>
      </div>
    </div>
  );
};
