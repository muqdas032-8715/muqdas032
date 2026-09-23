import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './db.ts';
import { requireHRAuth, generateHRToken, AuthenticatedRequest } from './auth.ts';
import { upload } from './upload.ts';
import { ApplicationStatus, StoredFile } from '../types.ts';

const router = express.Router();
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// ==========================================
// 1. CANDIDATE APPLICATION SUBMISSION ROUTE
// ==========================================
// Strict write-only endpoint. Sanitizes and validates.
// Never leaks other candidates' data or internal database structures.
router.post(
  '/candidate/apply',
  upload.fields([
    { name: 'cv_file', maxCount: 1 },
    { name: 'passport_file', maxCount: 1 },
    { name: 'photo_file', maxCount: 1 },
  ]),
  (req: Request, res: Response) => {
    try {
      const b = req.body;

      // Basic validation for mandatory fields
      const requiredFields = [
        'full_name',
        'father_name',
        'date_of_birth',
        'gender',
        'cnic_passport',
        'whatsapp',
        'email',
        'city',
        'country',
        'address',
        'qualification',
        'degree_diploma',
        'total_experience',
        'relevant_experience',
        'previous_company',
        'job_title',
        'skills',
        'preferred_position',
        'preferred_country',
        'preferred_city',
        'expected_salary',
      ];

      for (const field of requiredFields) {
        if (!b[field] || String(b[field]).trim() === '') {
          res.status(400).json({
            success: false,
            error: `Missing required field: ${field.replace(/_/g, ' ').toUpperCase()}`,
          });
          return;
        }
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(b.email).trim())) {
        res.status(400).json({
          success: false,
          error: 'Please provide a valid email address.',
        });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const formatStoredFile = (fileArr?: Express.Multer.File[]): StoredFile | null => {
        if (!fileArr || fileArr.length === 0) return null;
        const f = fileArr[0];
        return {
          fileId: f.filename,
          originalName: f.originalname,
          mimeType: f.mimetype,
          size: f.size,
          uploadedAt: new Date().toISOString(),
        };
      };

      const cvStored = formatStoredFile(files?.['cv_file']);
      const passportStored = formatStoredFile(files?.['passport_file']);
      const photoStored = formatStoredFile(files?.['photo_file']);

      const sanitize = (val: unknown): string => {
        if (val === undefined || val === null) return '';
        return String(val).trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      };

      const newApp = db.createApplication({
        full_name: sanitize(b.full_name),
        father_name: sanitize(b.father_name),
        date_of_birth: sanitize(b.date_of_birth),
        gender: (sanitize(b.gender) as 'Male' | 'Female' | 'Other') || 'Male',
        cnic_passport: sanitize(b.cnic_passport),
        whatsapp: sanitize(b.whatsapp),
        email: sanitize(b.email).toLowerCase(),
        city: sanitize(b.city),
        country: sanitize(b.country),
        address: sanitize(b.address),
        qualification: sanitize(b.qualification),
        degree_diploma: sanitize(b.degree_diploma),
        total_experience: sanitize(b.total_experience),
        relevant_experience: sanitize(b.relevant_experience),
        previous_company: sanitize(b.previous_company),
        job_title: sanitize(b.job_title),
        skills: sanitize(b.skills),
        preferred_position: sanitize(b.preferred_position),
        preferred_country: sanitize(b.preferred_country),
        preferred_city: sanitize(b.preferred_city),
        expected_salary: sanitize(b.expected_salary),
        international_experience: sanitize(b.international_experience || 'None'),
        additional_information: sanitize(b.additional_information || ''),
        cv_file: cvStored,
        passport_file: passportStored,
        photo_file: photoStored,
        hr_notes: '',
      });

      // Return strictly safe candidate confirmation
      res.status(201).json({
        success: true,
        applicationId: newApp.application_id,
        candidateName: newApp.full_name,
        position: newApp.preferred_position,
        submittedAt: newApp.created_at,
        message: 'Your job application has been successfully submitted to Apex Recruitment Partners.',
      });
    } catch (err: unknown) {
      console.error('Candidate submission error:', err);
      res.status(500).json({
        success: false,
        error: 'An error occurred while processing your application. Please try again.',
      });
    }
  }
);

// ==========================================
// 2. HR AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        error: 'Username/Email and Password are required.',
      });
      return;
    }

    const user = db.getUserByEmailOrUsername(String(identifier).trim());
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials. User does not exist.',
      });
      return;
    }

    const isValid = db.verifyPassword(String(password), user.password_hash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials. Incorrect password.',
      });
      return;
    }

    const safeUser = db.getUserById(user.id);
    if (!safeUser) {
      res.status(500).json({ success: false, error: 'User lookup failure.' });
      return;
    }

    const token = generateHRToken(safeUser);

    // Set HTTP-only cookie for secure server-side session
    res.cookie('hr_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      success: true,
      token,
      user: safeUser,
      message: `Welcome back, ${safeUser.full_name}`,
    });
  } catch (err) {
    console.error('HR Login Error:', err);
    res.status(500).json({ success: false, error: 'Server authentication error' });
  }
});

router.get('/auth/me', requireHRAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.hrUser,
  });
});

router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('hr_auth_token');
  res.json({
    success: true,
    message: 'HR session terminated successfully.',
  });
});

// ==========================================
// 3. HR / ADMIN PROTECTED API ROUTES
// (All require requireHRAuth middleware!)
// ==========================================

// Dashboard KPI stats
router.get('/admin/stats', requireHRAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve stats' });
  }
});

// Applications list with search, filter, and sorting
router.get('/admin/applications', requireHRAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, position, country, experience, qualification, status, sort } = req.query;

    const applications = db.getApplications({
      search: search ? String(search) : undefined,
      position: position ? String(position) : undefined,
      country: country ? String(country) : undefined,
      experience: experience ? String(experience) : undefined,
      qualification: qualification ? String(qualification) : undefined,
      status: status ? String(status) : undefined,
      sort: sort === 'oldest' ? 'oldest' : 'newest',
    });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve applications' });
  }
});

// Single candidate detail view
router.get('/admin/applications/:id', requireHRAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const app = db.getApplicationById(req.params.id);
    if (!app) {
      res.status(404).json({ success: false, error: 'Candidate application not found' });
      return;
    }
    res.json({ success: true, application: app });
  } catch (err) {
    console.error('Error fetching application detail:', err);
    res.status(500).json({ success: false, error: 'Failed to load application' });
  }
});

// Update application status
router.patch('/admin/applications/:id/status', requireHRAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses: ApplicationStatus[] = ['New', 'Reviewing', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid application status value' });
      return;
    }

    const updated = db.updateApplicationStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    res.json({ success: true, application: updated });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// Update HR notes
router.patch('/admin/applications/:id/notes', requireHRAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { notes } = req.body;
    const updated = db.updateApplicationNotes(req.params.id, String(notes || ''));
    if (!updated) {
      res.status(404).json({ success: false, error: 'Application not found' });
      return;
    }

    res.json({ success: true, application: updated });
  } catch (err) {
    console.error('Error updating notes:', err);
    res.status(500).json({ success: false, error: 'Failed to save HR notes' });
  }
});

// Delete an application
router.delete('/admin/applications/:id', requireHRAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = db.deleteApplication(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Application not found to delete' });
      return;
    }
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Error deleting application:', err);
    res.status(500).json({ success: false, error: 'Failed to delete application' });
  }
});

// Export applications to CSV
router.get('/admin/export/csv', requireHRAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, position, country, experience, qualification, status, sort } = req.query;

    const apps = db.getApplications({
      search: search ? String(search) : undefined,
      position: position ? String(position) : undefined,
      country: country ? String(country) : undefined,
      experience: experience ? String(experience) : undefined,
      qualification: qualification ? String(qualification) : undefined,
      status: status ? String(status) : undefined,
      sort: sort === 'oldest' ? 'oldest' : 'newest',
    });

    const escapeCSV = (str: string | number | undefined | null): string => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const headers = [
      'Application ID',
      'Status',
      'Full Name',
      "Father's Name",
      'Date of Birth',
      'Gender',
      'CNIC / Passport',
      'WhatsApp',
      'Email',
      'Current City',
      'Country',
      'Complete Address',
      'Education Level',
      'Degree / Diploma',
      'Total Experience',
      'Relevant Experience',
      'Previous Company',
      'Job Title',
      'Skills',
      'Preferred Position',
      'Preferred Country',
      'Preferred City',
      'Expected Salary',
      'International Experience',
      'Additional Info',
      'HR Notes',
      'Submission Date',
      'Last Updated',
    ];

    const rows = apps.map((a) => [
      escapeCSV(a.application_id),
      escapeCSV(a.status),
      escapeCSV(a.full_name),
      escapeCSV(a.father_name),
      escapeCSV(a.date_of_birth),
      escapeCSV(a.gender),
      escapeCSV(a.cnic_passport),
      escapeCSV(a.whatsapp),
      escapeCSV(a.email),
      escapeCSV(a.city),
      escapeCSV(a.country),
      escapeCSV(a.address),
      escapeCSV(a.qualification),
      escapeCSV(a.degree_diploma),
      escapeCSV(a.total_experience),
      escapeCSV(a.relevant_experience),
      escapeCSV(a.previous_company),
      escapeCSV(a.job_title),
      escapeCSV(a.skills),
      escapeCSV(a.preferred_position),
      escapeCSV(a.preferred_country),
      escapeCSV(a.preferred_city),
      escapeCSV(a.expected_salary),
      escapeCSV(a.international_experience),
      escapeCSV(a.additional_information),
      escapeCSV(a.hr_notes),
      escapeCSV(a.created_at),
      escapeCSV(a.updated_at),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Apex_Recruitment_Candidates_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error exporting CSV:', err);
    res.status(500).json({ success: false, error: 'CSV export generation failed' });
  }
});

// Secure Document Access (PROTECTED by HR auth!)
// Never accessible publicly or by unauthenticated visitors
router.get('/admin/files/:fileId', requireHRAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const fileId = path.basename(req.params.fileId); // prevent path traversal
    const filePath = path.join(UPLOADS_DIR, fileId);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'Document not found or removed.' });
      return;
    }

    // Determine mime type or search candidate record
    const ext = path.extname(fileId).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.doc') contentType = 'application/msword';
    else if (ext === '.docx')
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const isDownload = req.query.download === 'true';
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `${isDownload ? 'attachment' : 'inline'}; filename="${fileId}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Error serving protected file:', err);
    res.status(500).json({ success: false, error: 'Unable to stream requested file' });
  }
});

export default router;
