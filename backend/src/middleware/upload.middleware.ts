import multer from 'multer';
import { AppError } from '@/middleware/error.middleware';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const ALLOWED_DOCUMENT_MIME_TYPES = [...ALLOWED_IMAGE_MIME_TYPES, 'application/pdf'];

// Branding assets (logos, signatures) stay image-only.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Only JPEG, PNG, WEBP, or SVG images are allowed', 400));
    }
    cb(null, true);
  },
});

// Student documents (certificates, etc.) also accept scanned PDFs.
export const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Only JPEG, PNG, WEBP, or PDF files are allowed', 400));
    }
    cb(null, true);
  },
});
