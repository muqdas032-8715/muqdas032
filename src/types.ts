export type ApplicationStatus = 'New' | 'Reviewing' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected';

export interface StoredFile {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface JobApplication {
  id: string;
  application_id: string;
  full_name: string;
  father_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  cnic_passport: string;
  whatsapp: string;
  email: string;
  city: string;
  country: string;
  address: string;
  qualification: string;
  degree_diploma: string;
  total_experience: string;
  relevant_experience: string;
  previous_company: string;
  job_title: string;
  skills: string;
  preferred_position: string;
  preferred_country: string;
  preferred_city: string;
  expected_salary: string;
  international_experience: string;
  cv_file?: StoredFile | null;
  passport_file?: StoredFile | null;
  photo_file?: StoredFile | null;
  additional_information?: string;
  status: ApplicationStatus;
  hr_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HRUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'hr_manager' | 'recruiter';
  created_at: string;
}

export interface DashboardStats {
  total: number;
  new: number;
  reviewing: number;
  shortlisted: number;
  interview: number;
  hired: number;
  rejected: number;
}

export interface ApplicationSubmissionResponse {
  success: boolean;
  applicationId: string;
  candidateName: string;
  position: string;
  submittedAt: string;
  message?: string;
}
