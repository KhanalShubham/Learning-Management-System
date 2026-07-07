import multer from 'multer';
import { AppError } from '@/middleware/error.middleware';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Only JPEG, PNG, WEBP, or SVG images are allowed', 400));
    }
    cb(null, true);
  },
});
