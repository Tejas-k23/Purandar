import crypto from 'crypto';
import path from 'path';
import { env } from '../config/env.js';

export const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm']);

export const MEGABYTE = 1024 * 1024;

export const toPublicUrl = (key) => {
  const base = env.R2_PUBLIC_URL?.replace(/\/$/, '');
  return `${base}/${key}`;
};

export const buildFileName = (originalName = '') => {
  const ext = path.extname(originalName);
  const suffix = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${suffix}${ext || ''}`;
};

export const validateImageFile = (file) => {
  if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
    return 'Invalid file type';
  }
  if (file.size > env.MEDIA_IMAGE_MAX_MB * MEGABYTE) {
    return 'File size exceeds 5MB';
  }
  return null;
};

export const validateVideoFile = (file) => {
  if (!VIDEO_MIME_TYPES.has(file.mimetype)) {
    return 'Invalid file type';
  }
  if (file.size > env.MEDIA_VIDEO_MAX_MB * MEGABYTE) {
    return `File size exceeds ${env.MEDIA_VIDEO_MAX_MB}MB`;
  }
  return null;
};
