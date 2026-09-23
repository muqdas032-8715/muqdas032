import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { JobApplication, HRUser, DashboardStats, ApplicationStatus } from '../types.ts';

interface DBUser extends HRUser {
  password_hash: string;
}

interface DatabaseSchema {
  users: DBUser[];
  applications: JobApplication[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'recruitment_store.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function loadDB(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = getInitialSeedData();
    saveDB(initialData);
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, reinitializing:', err);
    const initialData = getInitialSeedData();
    saveDB(initialData);
    return initialData;
  }
}

function saveDB(data: DatabaseSchema): void {
  const tmpFile = `${DB_FILE}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

function getInitialSeedData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@2026Password!', salt);
  const hrHash = bcrypt.hashSync('HR@2026Password!', salt);

  const defaultUsers: DBUser[] = [
    {
      id: 'usr_admin_01',
      username: 'admin',
      email: 'admin@apexrecruitment.com',
      full_name: 'Sarah Jenkins (Chief Talent Officer)',
      role: 'admin',
      password_hash: adminHash,
      created_at: '2026-01-10T08:00:00.000Z',
    },
    {
      id: 'usr_hr_02',
      username: 'hr.manager',
      email: 'hr@apexrecruitment.com',
      full_name: 'David Thorne (Lead Recruiter)',
      role: 'hr_manager',
      password_hash: hrHash,
      created_at: '2026-01-15T09:30:00.000Z',
    },
  ];

  const defaultApplications: JobApplication[] = [
    {
      id: 'app_seed_001',
      application_id: 'APX-2026-10492',
      full_name: 'Tariq Mehmood',
      father_name: 'Abdul Rehman',
      date_of_birth: '1992-05-14',
      gender: 'Male',
      cnic_passport: '35201-8492019-3',
      whatsapp: '+92 300 1234567',
      email: 'tariq.mehmood@example.com',
      city: 'Lahore',
      country: 'Pakistan',
      address: 'House 42, Sector C, Bahria Town, Lahore',
      qualification: "Bachelor's Degree",
      degree_diploma: 'B.Sc. Mechanical Engineering (UET Lahore)',
      total_experience: '8 Years',
      relevant_experience: '6 Years',
      previous_company: 'Descon Engineering Ltd.',
      job_title: 'Senior Mechanical Piping Engineer',
      skills: 'AutoCAD, HVAC, Piping Design, Pressure Vessels, QA/QC Inspection, ASME Standards',
      preferred_position: 'Mechanical Engineer',
      preferred_country: 'Saudi Arabia',
      preferred_city: 'Riyadh / Jubail',
      expected_salary: '14,000 SAR / month',
      international_experience: 'Yes - 3 years Aramco Refinery Project in Yanbu',
      cv_file: {
        fileId: 'mock_cv_01',
        originalName: 'Tariq_Mehmood_CV.pdf',
        mimeType: 'application/pdf',
        size: 1420500,
        uploadedAt: '2026-09-18T10:14:22.000Z',
      },
      passport_file: {
        fileId: 'mock_pass_01',
        originalName: 'Passport_Copy.pdf',
        mimeType: 'application/pdf',
        size: 890400,
        uploadedAt: '2026-09-18T10:14:22.000Z',
      },
      photo_file: {
        fileId: 'mock_photo_01',
        originalName: 'Passport_Photo.jpg',
        mimeType: 'image/jpeg',
        size: 240100,
        uploadedAt: '2026-09-18T10:14:22.000Z',
      },
      additional_information: 'Ready to relocate immediately with 2 weeks notice period. Valid passport until 2031.',
      status: 'Shortlisted',
      hr_notes: 'Strong refinery background and valid Saudi Council of Engineers membership. Recommended for client interview.',
      created_at: '2026-09-18T10:15:00.000Z',
      updated_at: '2026-09-20T14:30:00.000Z',
    },
    {
      id: 'app_seed_002',
      application_id: 'APX-2026-10493',
      full_name: 'Fatima Al-Zahra',
      father_name: 'Mohammad Rashid',
      date_of_birth: '1996-08-21',
      gender: 'Female',
      cnic_passport: '61101-7291048-4',
      whatsapp: '+92 321 9876543',
      email: 'fatima.zahra.nurse@example.com',
      city: 'Islamabad',
      country: 'Pakistan',
      address: 'Flat 12, Gulberg Greens, Islamabad',
      qualification: "Bachelor's Degree",
      degree_diploma: 'B.Sc. Nursing (Shifa College of Nursing)',
      total_experience: '5 Years',
      relevant_experience: '5 Years',
      previous_company: 'Shifa International Hospital',
      job_title: 'ICU Staff Nurse',
      skills: 'ICU Care, BLS/ACLS Certified, Ventilator Management, Patient Monitoring, Infection Control',
      preferred_position: 'Registered Nurse (ICU/Critical Care)',
      preferred_country: 'United Arab Emirates',
      preferred_city: 'Dubai',
      expected_salary: '9,500 AED / month',
      international_experience: 'No - First time international applicant. DHA license in processing.',
      cv_file: {
        fileId: 'mock_cv_02',
        originalName: 'Fatima_Zahra_Nursing_Resume.pdf',
        mimeType: 'application/pdf',
        size: 984000,
        uploadedAt: '2026-09-19T09:20:00.000Z',
      },
      passport_file: {
        fileId: 'mock_pass_02',
        originalName: 'Passport_Scan.pdf',
        mimeType: 'application/pdf',
        size: 670200,
        uploadedAt: '2026-09-19T09:20:00.000Z',
      },
      photo_file: {
        fileId: 'mock_photo_02',
        originalName: 'Fatima_Photo.png',
        mimeType: 'image/png',
        size: 310500,
        uploadedAt: '2026-09-19T09:20:00.000Z',
      },
      additional_information: 'Cleared Prometric Exam with 84%. Eager to join emergency or critical care department in UAE hospitals.',
      status: 'Interview',
      hr_notes: 'DHA prometric passed. Initial HR screening completed on Sep 21. Video interview scheduled with NMC Healthcare Dubai.',
      created_at: '2026-09-19T09:25:00.000Z',
      updated_at: '2026-09-21T11:00:00.000Z',
    },
    {
      id: 'app_seed_003',
      application_id: 'APX-2026-10494',
      full_name: 'Zubair Ahmed Khan',
      father_name: 'Nawaz Ahmed Khan',
      date_of_birth: '1990-11-03',
      gender: 'Male',
      cnic_passport: '42101-3940192-1',
      whatsapp: '+92 333 4567890',
      email: 'zubair.ahmed.tech@example.com',
      city: 'Karachi',
      country: 'Pakistan',
      address: 'House B-14, Block 7, Clifton, Karachi',
      qualification: "Master's Degree",
      degree_diploma: 'M.S. Computer Science (FAST-NUCES)',
      total_experience: '10 Years',
      relevant_experience: '9 Years',
      previous_company: 'Systems Limited',
      job_title: 'Lead Full Stack Architect',
      skills: 'TypeScript, React, Node.js, PostgreSQL, AWS Cloud, Docker, Microservices, Kubernetes',
      preferred_position: 'Senior Software Engineer / Tech Lead',
      preferred_country: 'Qatar',
      preferred_city: 'Doha',
      expected_salary: '22,000 QAR / month',
      international_experience: 'Yes - 2 years in Bahrain for Fintech banking client.',
      cv_file: {
        fileId: 'mock_cv_03',
        originalName: 'Zubair_Khan_Architect.pdf',
        mimeType: 'application/pdf',
        size: 1120000,
        uploadedAt: '2026-09-20T14:10:00.000Z',
      },
      additional_information: 'AWS Solutions Architect Certified. Holds active Qatar tourist visa ready for technical visit.',
      status: 'Hired',
      hr_notes: 'Offer letter accepted by candidate for Doha Islamic Bank digital banking team. Visa issuance underway.',
      created_at: '2026-09-20T14:15:00.000Z',
      updated_at: '2026-09-22T16:45:00.000Z',
    },
    {
      id: 'app_seed_004',
      application_id: 'APX-2026-10495',
      full_name: 'Kamran Ali',
      father_name: 'Ashraf Ali',
      date_of_birth: '1998-03-12',
      gender: 'Male',
      cnic_passport: '37405-1948201-7',
      whatsapp: '+92 312 3456789',
      email: 'kamran.hse@example.com',
      city: 'Rawalpindi',
      country: 'Pakistan',
      address: 'Street 4, Satellite Town, Rawalpindi',
      qualification: 'Diploma / Technical Certification',
      degree_diploma: 'NEBOSH IGC & IOSH Safety Management',
      total_experience: '4 Years',
      relevant_experience: '4 Years',
      previous_company: 'Habib Construction Services',
      job_title: 'Safety Inspector',
      skills: 'NEBOSH IGC, Hazard Identification, Risk Assessment, OSHA Regulations, Fire Safety, First Aid',
      preferred_position: 'HSE Officer / Safety Officer',
      preferred_country: 'Oman',
      preferred_city: 'Muscat',
      expected_salary: '650 OMR / month',
      international_experience: 'No',
      additional_information: 'Certified in NEBOSH IGC 1, 2, 3 with distinction. Willing to work in harsh field/onshore environments.',
      status: 'New',
      hr_notes: '',
      created_at: '2026-09-21T08:30:00.000Z',
      updated_at: '2026-09-21T08:30:00.000Z',
    },
    {
      id: 'app_seed_005',
      application_id: 'APX-2026-10496',
      full_name: 'Amina Noor',
      father_name: 'Tariq Noor',
      date_of_birth: '1995-12-30',
      gender: 'Female',
      cnic_passport: '33100-8402914-2',
      whatsapp: '+92 345 5678901',
      email: 'amina.finance@example.com',
      city: 'Faisalabad',
      country: 'Pakistan',
      address: 'Civil Lines, Faisalabad',
      qualification: "Master's Degree",
      degree_diploma: 'ACCA Member / M.Com',
      total_experience: '6 Years',
      relevant_experience: '6 Years',
      previous_company: 'Interloop Limited',
      job_title: 'Senior Financial Analyst',
      skills: 'ACCA, IFRS, SAP ERP, Financial Modeling, Tax Audit, Cost Accounting, Variance Analysis',
      preferred_position: 'Senior Accountant / Financial Analyst',
      preferred_country: 'Kuwait',
      preferred_city: 'Kuwait City',
      expected_salary: '850 KWD / month',
      international_experience: 'No',
      status: 'Reviewing',
      hr_notes: 'Under review by Gulf accounting partner. Need verification of ACCA membership status.',
      created_at: '2026-09-22T11:45:00.000Z',
      updated_at: '2026-09-22T15:20:00.000Z',
    },
  ];

  return {
    users: defaultUsers,
    applications: defaultApplications,
  };
}

export const db = {
  getApplications(filters?: {
    search?: string;
    position?: string;
    country?: string;
    experience?: string;
    qualification?: string;
    status?: string;
    sort?: 'newest' | 'oldest';
  }): JobApplication[] {
    const data = loadDB();
    let apps = [...data.applications];

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      apps = apps.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.application_id.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.whatsapp.toLowerCase().includes(q) ||
          a.preferred_position.toLowerCase().includes(q) ||
          a.skills.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q)
      );
    }

    if (filters?.position && filters.position !== 'all') {
      const pos = filters.position.toLowerCase();
      apps = apps.filter((a) => a.preferred_position.toLowerCase().includes(pos));
    }

    if (filters?.country && filters.country !== 'all') {
      const c = filters.country.toLowerCase();
      apps = apps.filter((a) => a.preferred_country.toLowerCase().includes(c));
    }

    if (filters?.qualification && filters.qualification !== 'all') {
      const q = filters.qualification.toLowerCase();
      apps = apps.filter((a) => a.qualification.toLowerCase().includes(q));
    }

    if (filters?.status && filters.status !== 'all') {
      apps = apps.filter((a) => a.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.experience && filters.experience !== 'all') {
      // Experience bucket matching
      const exp = filters.experience.toLowerCase();
      apps = apps.filter((a) => {
        const total = a.total_experience.toLowerCase();
        if (exp === '0-2') return total.includes('fresh') || total.includes('1') || total.includes('2');
        if (exp === '3-5') return total.includes('3') || total.includes('4') || total.includes('5');
        if (exp === '6-9') return total.includes('6') || total.includes('7') || total.includes('8') || total.includes('9');
        if (exp === '10+') return total.includes('10') || total.includes('11') || total.includes('12') || total.includes('15') || total.includes('20');
        return true;
      });
    }

    // Sorting
    apps.sort((a, b) => {
      const tA = new Date(a.created_at).getTime();
      const tB = new Date(b.created_at).getTime();
      return filters?.sort === 'oldest' ? tA - tB : tB - tA;
    });

    return apps;
  },

  getApplicationById(id: string): JobApplication | undefined {
    const data = loadDB();
    return data.applications.find((a) => a.id === id || a.application_id === id);
  },

  createApplication(
    input: Omit<JobApplication, 'id' | 'application_id' | 'created_at' | 'updated_at' | 'status'>
  ): JobApplication {
    const data = loadDB();
    const id = `app_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `APX-${new Date().getFullYear()}-${randomNum}`;
    const now = new Date().toISOString();

    const newApp: JobApplication = {
      ...input,
      id,
      application_id: applicationId,
      status: 'New',
      hr_notes: '',
      created_at: now,
      updated_at: now,
    };

    data.applications.unshift(newApp);
    saveDB(data);
    return newApp;
  },

  updateApplicationStatus(id: string, status: ApplicationStatus): JobApplication | null {
    const data = loadDB();
    const idx = data.applications.findIndex((a) => a.id === id || a.application_id === id);
    if (idx === -1) return null;

    data.applications[idx].status = status;
    data.applications[idx].updated_at = new Date().toISOString();
    saveDB(data);
    return data.applications[idx];
  },

  updateApplicationNotes(id: string, notes: string): JobApplication | null {
    const data = loadDB();
    const idx = data.applications.findIndex((a) => a.id === id || a.application_id === id);
    if (idx === -1) return null;

    data.applications[idx].hr_notes = notes;
    data.applications[idx].updated_at = new Date().toISOString();
    saveDB(data);
    return data.applications[idx];
  },

  deleteApplication(id: string): boolean {
    const data = loadDB();
    const idx = data.applications.findIndex((a) => a.id === id || a.application_id === id);
    if (idx === -1) return false;

    const [deleted] = data.applications.splice(idx, 1);
    saveDB(data);

    // Clean up uploaded files
    [deleted.cv_file, deleted.passport_file, deleted.photo_file].forEach((file) => {
      if (file?.fileId) {
        const filePath = path.join(UPLOADS_DIR, file.fileId);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error('Failed to unlink file:', filePath, e);
          }
        }
      }
    });

    return true;
  },

  getStats(): DashboardStats {
    const data = loadDB();
    const apps = data.applications;

    return {
      total: apps.length,
      new: apps.filter((a) => a.status === 'New').length,
      reviewing: apps.filter((a) => a.status === 'Reviewing').length,
      shortlisted: apps.filter((a) => a.status === 'Shortlisted').length,
      interview: apps.filter((a) => a.status === 'Interview').length,
      hired: apps.filter((a) => a.status === 'Hired').length,
      rejected: apps.filter((a) => a.status === 'Rejected').length,
    };
  },

  getUserByEmailOrUsername(identifier: string): DBUser | undefined {
    const data = loadDB();
    const clean = identifier.toLowerCase().trim();
    return data.users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );
  },

  getUserById(id: string): HRUser | undefined {
    const data = loadDB();
    const user = data.users.find((u) => u.id === id);
    if (!user) return undefined;
    const { password_hash, ...safe } = user;
    return safe;
  },

  verifyPassword(plain: string, hash: string): boolean {
    return bcrypt.compareSync(plain, hash);
  },
};
