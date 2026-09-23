import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Globe,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { ApplicationSubmissionResponse } from '../types.ts';

interface CandidateFormProps {
  onSuccess: (data: ApplicationSubmissionResponse) => void;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    // Personal Details
    full_name: '',
    father_name: '',
    date_of_birth: '',
    gender: 'Male',
    cnic_passport: '',
    whatsapp: '',
    email: '',
    city: '',
    country: 'Pakistan',
    address: '',

    // Qualifications & Background
    qualification: "Bachelor's Degree",
    degree_diploma: '',
    total_experience: '3-5 Years',
    relevant_experience: '3 Years',
    previous_company: '',
    job_title: '',
    skills: '',

    // Job Preferences
    preferred_position: '',
    preferred_country: 'Saudi Arabia',
    preferred_city: '',
    expected_salary: '',
    international_experience: 'No',
    additional_information: '',
  });

  // Files State
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleFileChange = (field: 'cv' | 'passport' | 'photo', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setErrorMsg(`File ${file.name} is too large. Maximum size permitted is 12MB.`);
      return;
    }

    if (field === 'cv') {
      setCvFile(file);
    } else if (field === 'passport') {
      setPassportFile(file);
    } else if (field === 'photo') {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (errorMsg) setErrorMsg(null);
  };

  const removeFile = (field: 'cv' | 'passport' | 'photo') => {
    if (field === 'cv') setCvFile(null);
    if (field === 'passport') setPassportFile(null);
    if (field === 'photo') {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.full_name.trim()) {
        setErrorMsg('Please enter your Full Name.');
        return false;
      }
      if (!formData.father_name.trim()) {
        setErrorMsg("Please enter your Father's Name.");
        return false;
      }
      if (!formData.date_of_birth) {
        setErrorMsg('Please select your Date of Birth.');
        return false;
      }
      if (!formData.cnic_passport.trim()) {
        setErrorMsg('Please provide your CNIC or Passport number.');
        return false;
      }
      if (!formData.whatsapp.trim()) {
        setErrorMsg('Please enter your WhatsApp contact number.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return false;
      }
      if (!formData.city.trim()) {
        setErrorMsg('Please provide your current city.');
        return false;
      }
      if (!formData.address.trim()) {
        setErrorMsg('Please enter your residential address.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.degree_diploma.trim()) {
        setErrorMsg('Please state your Degree, Diploma or Certification title.');
        return false;
      }
      if (!formData.previous_company.trim()) {
        setErrorMsg('Please specify your current or previous company name.');
        return false;
      }
      if (!formData.job_title.trim()) {
        setErrorMsg('Please enter your current or last job designation.');
        return false;
      }
      if (!formData.skills.trim()) {
        setErrorMsg('Please list your primary skills (e.g. AutoCAD, ICU Care, Welding, Python).');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!formData.preferred_position.trim()) {
        setErrorMsg('Please specify your Preferred Job Position.');
        return false;
      }
      if (!formData.preferred_city.trim()) {
        setErrorMsg('Please indicate preferred destination city (e.g., Riyadh, Dubai, Any).');
        return false;
      }
      if (!formData.expected_salary.trim()) {
        setErrorMsg('Please enter your expected salary with currency (e.g. 10,000 SAR or $3,500).');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const dataPayload = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        dataPayload.append(key, value);
      });

      // Append files
      if (cvFile) dataPayload.append('cv_file', cvFile);
      if (passportFile) dataPayload.append('passport_file', passportFile);
      if (photoFile) dataPayload.append('photo_file', photoFile);

      const response = await fetch('/api/candidate/apply', {
        method: 'POST',
        body: dataPayload,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit application. Please check your data.');
      }

      onSuccess(result);
    } catch (err: unknown) {
      console.error('Submission failed:', err);
      setErrorMsg(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Personal Details', icon: User },
    { num: 2, title: 'Qualifications', icon: GraduationCap },
    { num: 3, title: 'Job Preferences', icon: Briefcase },
    { num: 4, title: 'Documents & Finish', icon: Upload },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accredited International Recruitment Agency</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Official Candidate Application Form
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Apply directly for domestic, Gulf (KSA, UAE, Qatar, Oman) and international vacancies. All submitted details are strictly encrypted.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10 text-xs sm:text-right shrink-0">
            <span className="text-blue-200 font-medium block">Applicant Reference</span>
            <span className="text-slate-100 font-bold block text-sm">2026 Recruitment Drive</span>
            <span className="text-emerald-400 text-[11px] block mt-0.5">● Submissions Active</span>
          </div>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.num;
          const isDone = currentStep > step.num;
          return (
            <button
              key={step.num}
              type="button"
              onClick={() => {
                if (step.num < currentStep) {
                  setCurrentStep(step.num);
                } else if (validateStep(currentStep)) {
                  setCurrentStep(step.num);
                }
              }}
              className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                isActive
                  ? 'bg-blue-50/80 border-blue-600 shadow-xs'
                  : isDone
                  ? 'bg-white border-emerald-200 text-slate-700'
                  : 'bg-white/50 border-slate-200 text-slate-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Step 0{step.num}
                </span>
                <span
                  className={`text-xs font-semibold truncate block ${
                    isActive ? 'text-blue-900' : 'text-slate-700'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Error Notification Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Attention Required</span>
            <span className="text-xs text-rose-700">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* STEP 1: PERSONAL & CONTACT INFORMATION */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Information & Identification
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ensure names and identification details match exactly with your official National ID or Passport.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Tariq Mehmood"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Father's Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Abdul Rehman"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  CNIC / Passport Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="cnic_passport"
                  value={formData.cnic_passport}
                  onChange={handleInputChange}
                  placeholder="e.g. 35201-1234567-1 or Pass # PK982341"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  WhatsApp Contact Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="e.g. +92 300 1234567"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Shortlisting and interview links will be sent to this WhatsApp.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. candidate@example.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Lahore, Islamabad, Karachi"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Country of Residence <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g. Pakistan"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Complete Residential Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House/Street number, Sector, District, Postal Code"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EDUCATION & PROFESSIONAL QUALIFICATIONS */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Education, Qualifications & Work Background
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide accurate academic credentials and your current professional employment record.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Education / Qualification Level <span className="text-rose-500">*</span>
                </label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-white"
                >
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                  <option value="Master's Degree">Master's Degree (M.S / M.Sc / MBA)</option>
                  <option value="Bachelor's Degree">Bachelor's Degree (B.S / B.Sc / B.Eng)</option>
                  <option value="Diploma / Technical Certification">Diploma / Associate Degree / DAE</option>
                  <option value="Higher Secondary / Intermediate">Higher Secondary / F.Sc / A-Levels</option>
                  <option value="Secondary / Matriculation">Secondary / Matric / O-Levels</option>
                  <option value="Vocational / Trade Certificate">Vocational / Trade Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Degree / Diploma Title & Institute <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="degree_diploma"
                  value={formData.degree_diploma}
                  onChange={handleInputChange}
                  placeholder="e.g. B.Sc. Mechanical Engineering (UET)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total Overall Experience <span className="text-rose-500">*</span>
                </label>
                <select
                  name="total_experience"
                  value={formData.total_experience}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-white"
                >
                  <option value="Fresh / Less than 1 Year">Fresh / Less than 1 Year</option>
                  <option value="1-2 Years">1 - 2 Years</option>
                  <option value="3-5 Years">3 - 5 Years</option>
                  <option value="6-9 Years">6 - 9 Years</option>
                  <option value="10-14 Years">10 - 14 Years</option>
                  <option value="15+ Years">15+ Years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Relevant Experience in Applied Field <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="relevant_experience"
                  value={formData.relevant_experience}
                  onChange={handleInputChange}
                  placeholder="e.g. 4 Years in Piping Design"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current / Previous Company <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="previous_company"
                  value={formData.previous_company}
                  onChange={handleInputChange}
                  placeholder="e.g. Descon Engineering, Shifa Hospital"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current / Last Job Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Piping Engineer, ICU Staff Nurse"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Key Skills & Technical Competencies <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g. AutoCAD, QA/QC, ASME Codes, Python, ICU Patient Care, Welding 6G, SAP"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Separate multiple skills with commas. These help recruiters match you with client requirements.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PREFERENCES & INTERNATIONAL MOBILITY */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Job Preferences & Relocation Details
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tell us where you wish to work and your compensation expectations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Job Position <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="preferred_position"
                  value={formData.preferred_position}
                  onChange={handleInputChange}
                  placeholder="e.g. Mechanical Project Engineer"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Country <span className="text-rose-500">*</span>
                </label>
                <select
                  name="preferred_country"
                  value={formData.preferred_country}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-white"
                >
                  <option value="Saudi Arabia">Saudi Arabia (KSA)</option>
                  <option value="United Arab Emirates">United Arab Emirates (Dubai / Abu Dhabi)</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Oman">Oman</option>
                  <option value="Kuwait">Kuwait</option>
                  <option value="Bahrain">Bahrain</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Pakistan (Domestic)">Pakistan (Domestic)</option>
                  <option value="Any Overseas Location">Any Overseas Location</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred City / Region <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="preferred_city"
                  value={formData.preferred_city}
                  onChange={handleInputChange}
                  placeholder="e.g. Riyadh, Dubai, Doha, Any"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Expected Salary (with Currency) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="expected_salary"
                  value={formData.expected_salary}
                  onChange={handleInputChange}
                  placeholder="e.g. 12,000 SAR / month or 8,500 AED"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gulf / International Work Experience Details
                </label>
                <input
                  type="text"
                  name="international_experience"
                  value={formData.international_experience}
                  onChange={handleInputChange}
                  placeholder="e.g. Yes - 3 years Aramco Project KSA, or None (First time overseas)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Mention if you previously held an Iqama or foreign resident work visa.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Additional Information / Notice Period / Remarks
                </label>
                <textarea
                  name="additional_information"
                  rows={3}
                  value={formData.additional_information}
                  onChange={handleInputChange}
                  placeholder="e.g. Available for immediate mobilization with 2 weeks notice; holds valid passport until 2030; Prometric passed."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENT UPLOADS & FINAL SUBMIT */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Documents & Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload your updated CV, identification copy, and a passport-sized photograph. Files are securely stored on encrypted servers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* CV Upload */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-blue-400 transition bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Upload CV / Resume</h3>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX up to 12MB</p>
                </div>

                <div className="mt-4">
                  {cvFile ? (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-left">
                      <div className="truncate pr-2">
                        <p className="text-xs font-semibold text-blue-900 truncate">
                          {cvFile.name}
                        </p>
                        <p className="text-[10px] text-blue-600">
                          {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('cv')}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition w-full shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse CV File</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange('cv', e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Passport / CNIC Upload */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-blue-400 transition bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Passport / CNIC</h3>
                  <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 12MB</p>
                </div>

                <div className="mt-4">
                  {passportFile ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-left">
                      <div className="truncate pr-2">
                        <p className="text-xs font-semibold text-emerald-900 truncate">
                          {passportFile.name}
                        </p>
                        <p className="text-[10px] text-emerald-600">
                          {(passportFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('passport')}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition w-full shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Document</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('passport', e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Photograph Upload */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-blue-400 transition bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 mx-auto rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Photograph</h3>
                  <p className="text-xs text-slate-500 mt-1">Blue/White background image</p>
                </div>

                <div className="mt-4">
                  {photoFile ? (
                    <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-left">
                      <div className="truncate pr-2">
                        <p className="text-xs font-semibold text-purple-900 truncate">
                          {photoFile.name}
                        </p>
                        <p className="text-[10px] text-purple-600">
                          {(photoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('photo')}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition w-full shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Browse Photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleFileChange('photo', e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Application Summary Box */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">Submission Confirmation Checklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>
                  <strong>Candidate:</strong> {formData.full_name || 'Not filled'}
                </div>
                <div>
                  <strong>Position:</strong> {formData.preferred_position || 'Not filled'}
                </div>
                <div>
                  <strong>Destination:</strong> {formData.preferred_country} ({formData.preferred_city || 'City'})
                </div>
                <div>
                  <strong>Contact:</strong> {formData.whatsapp || 'WhatsApp'} · {formData.email || 'Email'}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200">
                By clicking "Submit Application", you certify that the provided credentials are true and accurate. Once submitted, your unique Application ID will be generated immediately.
              </p>
            </div>
          </div>
        )}

        {/* Form Bottom Navigation Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Step 1 of 4: Personal Info</span>
            </div>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 active:scale-98 transition shadow-sm"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 active:scale-98 transition shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Encrypting & Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
