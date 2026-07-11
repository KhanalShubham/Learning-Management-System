import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImageBuffer = (buffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

// 'auto' lets Cloudinary route images to its image pipeline and PDFs to its
// raw/document pipeline, so this one function covers both.
export const uploadDocumentBuffer = (buffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

// Cloudinary's `image` delivery type blocks unauthenticated PDF/ZIP delivery by
// default (a 401 on the returned URL) since these can carry executable content.
// Generated certificate PDFs must use `raw` explicitly so they stay publicly
// downloadable/printable without a signed URL.
export const uploadPdfBuffer = (buffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'raw', format: 'pdf' },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};
