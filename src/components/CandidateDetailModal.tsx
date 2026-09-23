import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Globe,
  FileText,
  Download,
  ExternalLink,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  Save,
  Loader2,
  Shield,
  Eye,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types.ts';

interface CandidateDetailModalProps {
  application: JobApplication;
  token?: string;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => Promise<void>;
  onNotesSave: (id: string, notes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  application,
  token,
  onClose,
  onStatusChange,
  onNotesSave,
  onDelete,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>(application.status);
  const [notes, setNotes] = useState(application.hr_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStatusSelect = async (newStatus: ApplicationStatus) => {
    setCurrentStatus(newStatus);
    setStatusUpdating(true);
    try {
      await onStatusChange(application.id, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await onNotesSave(application.id, notes);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(application.id);
      onClose();
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = application.whatsapp.replace(/[^0-9]/g, '');

  // Helper for authenticated document download
  const downloadDocument = (fileId: string, filename: string, inline = false) => {
    const url = `/api/admin/files/${fileId}?download=${!inline}`;
    window.open(url, '_blank');
  };

  const statusColors: Record<ApplicationStatus, string> = {
    New: 'text-blue-700 bg-blue-50 border-blue-200',
    Reviewing: 'text-amber-700 bg-amber-50 border-amber-200',
    Shortlisted: 'text-purple-700 bg-purple-50 border-purple-200',
    Interview: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    Hired: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    Rejected: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-start gap-4">
            {/* Candidate Photo or Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border border-slate-300">
              {application.photo_file?.fileId ? (
                <img
                  src={`/api/admin/files/${application.photo_file.fileId}?inline=true`}
                  alt={application.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span>{application.full_name.charAt(0)}</span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {application.full_name}
                </h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusColors[currentStatus]}`}>
                  {currentStatus}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 font-mono">
                <span className="text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  {application.application_id}
                </span>
                <span>• Applied on {new Date(application.created_at).toLocaleDateString()}</span>
                <span>• {application.city}, {application.country}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print Dossier"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quick Actions Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Change Status:</span>
              <select
                value={currentStatus}
                onChange={(e) => handleStatusSelect(e.target.value as ApplicationStatus)}
                disabled={statusUpdating}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="New">New</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
              {statusUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Message</span>
              </a>

              <a
                href={`mailto:${application.email}?subject=Regarding Application ${application.application_id} - Apex Recruitment`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            </div>
          </div>

          {/* Section 1: Candidate Overview Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal & Contact Profile</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Father's Name</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.father_name}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">CNIC / Passport</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
                  {application.cnic_passport}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Date of Birth & Gender</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.date_of_birth} ({application.gender})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">WhatsApp Number</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block font-mono">
                  {application.whatsapp}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Email Address</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block truncate">
                  {application.email}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Current Residence</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.city}, {application.country}
                </span>
              </div>

              <div className="sm:col-span-2 md:col-span-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Complete Residential Address</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.address}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Qualifications & Employment */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Academic Credentials & Employment</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Qualification Level</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.qualification}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 font-medium block">Degree / Diploma & Institute</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.degree_diploma}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Total Experience</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.total_experience}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Relevant Field Experience</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.relevant_experience}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Current / Previous Company</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.previous_company}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-3">
                <span className="text-slate-400 font-medium block">Current / Last Job Title</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.job_title}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-3">
                <span className="text-slate-400 font-medium block">Core Skills & Certifications</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {application.skills
                    .split(',')
                    .map((s, idx) => s.trim())
                    .filter(Boolean)
                    .map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700 font-medium text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Job Preferences */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Target Role & International Mobility</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Preferred Position</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {application.preferred_position}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Preferred Country</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {application.preferred_country}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Preferred City</span>
                <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                  {application.preferred_city}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-medium block">Expected Salary</span>
                <span className="font-semibold text-emerald-700 text-sm mt-0.5 block font-mono">
                  {application.expected_salary}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-4">
                <span className="text-slate-400 font-medium block">Gulf / International Experience</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {application.international_experience || 'None'}
                </span>
              </div>

              {application.additional_information && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-4">
                  <span className="text-slate-400 font-medium block">Additional Candidate Remarks</span>
                  <p className="text-slate-700 text-xs mt-1 whitespace-pre-wrap">
                    {application.additional_information}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Uploaded Documents (PROTECTED HR ACCESS) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Candidate Documents (Secured HR Storage)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* CV File */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate flex-1">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {application.cv_file ? application.cv_file.originalName : 'CV Not Uploaded'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {application.cv_file ? `${(application.cv_file.size / 1024 / 1024).toFixed(2)} MB` : 'Optional'}
                    </span>
                  </div>
                </div>

                {application.cv_file && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadDocument(application.cv_file!.fileId, application.cv_file!.originalName, true)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadDocument(application.cv_file!.fileId, application.cv_file!.originalName, false)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Passport / CNIC File */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="truncate flex-1">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {application.passport_file ? application.passport_file.originalName : 'Passport / CNIC Not Uploaded'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {application.passport_file ? `${(application.passport_file.size / 1024 / 1024).toFixed(2)} MB` : 'Optional'}
                    </span>
                  </div>
                </div>

                {application.passport_file && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadDocument(application.passport_file!.fileId, application.passport_file!.originalName, true)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadDocument(application.passport_file!.fileId, application.passport_file!.originalName, false)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Photo File */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="truncate flex-1">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {application.photo_file ? application.photo_file.originalName : 'Photo Not Uploaded'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {application.photo_file ? `${(application.photo_file.size / 1024 / 1024).toFixed(2)} MB` : 'Optional'}
                    </span>
                  </div>
                </div>

                {application.photo_file && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadDocument(application.photo_file!.fileId, application.photo_file!.originalName, true)}
                      className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Photograph</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Internal HR Notes */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Confidential HR Notes & Interview Evaluation</span>
              </label>
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record candidate assessment, background check findings, interview remarks, client feedback, or required visa documents..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white transition resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-50"
              >
                {savingNotes ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save HR Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          {deleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-semibold">
                Are you sure you want to permanently delete this application?
              </span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold p-2 rounded-lg hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Application</span>
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
