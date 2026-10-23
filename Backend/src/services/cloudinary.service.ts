import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  publicId: string;
}

const SIGNED_URL_TTL_SEC = 60 * 60;

export async function uploadScanImage(
  buffer: Buffer,
  userId: string,
  scanId: string,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `aisscan/scans/${userId}`,
        public_id: scanId,
        resource_type: 'image',
        type: 'authenticated',
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }

        resolve({
          publicId: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
}

export async function deleteScanImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    type: 'authenticated',
  });
}

/** Best-effort delete of all authenticated scan assets for a user folder. */
export async function deleteUserScanFolder(userId: string): Promise<void> {
  const prefix = `aisscan/scans/${userId}`;

  try {
    await cloudinary.api.delete_resources_by_prefix(prefix, {
      resource_type: 'image',
      type: 'authenticated',
    });
  } catch {
    // Folder may already be empty
  }

  try {
    await cloudinary.api.delete_folder(prefix);
  } catch {
    // Folder may not exist
  }
}

export function getSignedImageUrl(publicId: string, expiresInSec = SIGNED_URL_TTL_SEC): string {
  return cloudinary.url(publicId, {
    type: 'authenticated',
    sign_url: true,
    secure: true,
    resource_type: 'image',
    expires_at: Math.floor(Date.now() / 1000) + expiresInSec,
  });
}

export function getThumbnailUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    type: 'authenticated',
    sign_url: true,
    secure: true,
    resource_type: 'image',
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
    expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SEC,
  });
}
