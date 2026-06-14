import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary';

import { serverEnv } from '@/lib/env';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

cloudinary.config({
  cloud_name: serverEnv.CLOUDINARY_CLOUD_NAME,
  api_key: serverEnv.CLOUDINARY_API_KEY,
  api_secret: serverEnv.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadedImage = {
  url: string;
  publicId: string;
};

export async function uploadImage(
  file: File,
  options: Pick<UploadApiOptions, 'folder' | 'transformation'>
): Promise<UploadedImage> {
  validateImage(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...options,
        resource_type: 'image',
        unique_filename: true,
        overwrite: false,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error('Cloudinary did not return an upload result'));
          return;
        }
        resolve(uploadResult);
      }
    );

    stream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string | null | undefined) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}

function validateImage(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error('Use a JPG, PNG, WebP, or GIF image');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be 8 MB or smaller');
  }
  if (file.size === 0) {
    throw new Error('Choose a non-empty image');
  }
}
