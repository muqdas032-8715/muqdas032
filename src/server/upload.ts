import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure mock seed files exist so HR can preview/download right away
function seedMockFiles() {
  const seedFiles = [
    {
      id: 'mock_cv_01',
      name: 'Tariq_Mehmood_CV.pdf',
      content: '%PDF-1.4\n1 0 obj\n<< /Title (Tariq Mehmood - Mechanical Engineer CV) /Author (Tariq Mehmood) /Subject (Job Application) >>\nendobj\n2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n5 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 16 Tf\n50 720 Td\n(Tariq Mehmood - Senior Mechanical Engineer CV) Tj\n0 -30 Td\n(Specialization: Piping Design, QA/QC, ASME Codes) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \ntrailer\n<< /Root 2 0 R >>\n%%EOF',
    },
    {
      id: 'mock_pass_01',
      name: 'Passport_Copy.pdf',
      content: '%PDF-1.4\n1 0 obj\n<< /Title (Passport Copy) >>\nendobj\n2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n5 0 obj\n<< /Length 95 >>\nstream\nBT\n/F1 14 Tf\n50 720 Td\n(Verified Passport Copy - National Database Authority) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \ntrailer\n<< /Root 2 0 R >>\n%%EOF',
    },
    {
      id: 'mock_photo_01',
      name: 'Passport_Photo.jpg',
      content: 'Apex-Recruitment-Secure-Photo-Placeholder-Binary-Asset',
    },
    {
      id: 'mock_cv_02',
      name: 'Fatima_Zahra_Nursing_Resume.pdf',
      content: '%PDF-1.4\n1 0 obj\n<< /Title (Fatima Al-Zahra - ICU Nurse Resume) >>\nendobj\n2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n5 0 obj\n<< /Length 110 >>\nstream\nBT\n/F1 16 Tf\n50 720 Td\n(Fatima Al-Zahra - Registered ICU Nurse Resume) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \ntrailer\n<< /Root 2 0 R >>\n%%EOF',
    },
    {
      id: 'mock_cv_03',
      name: 'Zubair_Khan_Architect.pdf',
      content: '%PDF-1.4\n1 0 obj\n<< /Title (Zubair Ahmed Khan - Solutions Architect CV) >>\nendobj\n2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n5 0 obj\n<< /Length 130 >>\nstream\nBT\n/F1 16 Tf\n50 720 Td\n(Zubair Ahmed Khan - Lead Solutions Architect Resume) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \ntrailer\n<< /Root 2 0 R >>\n%%EOF',
    },
  ];

  for (const item of seedFiles) {
    const p = path.join(UPLOADS_DIR, item.id);
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, item.content, 'utf-8');
    }
  }
}

seedMockFiles();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safePrefix = file.fieldname.replace(/[^a-z0-9]/gi, '_');
    const uniqueId = `doc_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}${ext}`;
    cb(null, `${safePrefix}_${uniqueId}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 12 * 1024 * 1024, // 12MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (allowedMime.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not permitted. Please upload PDF, Word or Image files.`));
    }
  },
});
