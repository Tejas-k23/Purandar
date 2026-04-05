import crypto from 'crypto';
import path from 'path';
import { env } from '../config/env.js';

export const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm']);

export const MEGABYTE = 1024 * 1024;

export const R2_BASE_URL = env.R2_PUBLIC_URL?.replace(/\/$/, '') || '';

export const toPublicUrl = (key) => {
  const base = env.R2_PUBLIC_URL?.replace(/\/$/, '');
  return `${base}/${key}`;
};

const sanitizeFileName = (fileName = '') => {
  const trimmed = String(fileName).trim();
  if (!trimmed) return '';

  const ext = path.extname(trimmed).toLowerCase();
  const base = path.basename(trimmed, ext);
  const safeBase = base
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  return `${safeBase || 'file'}${ext}`;
};

export const getPropertyImagePath = (propertyId, fileName) => {
  if (!propertyId || !fileName) {
    throw new Error('Property id and file name are required to build image path.');
  }

  const safeName = sanitizeFileName(fileName);
  if (!safeName) {
    throw new Error('Invalid file name for image path.');
  }

  return `properties/${propertyId}/images/${safeName}`;
};

export const getImageUrl = (storedPath = '') => {
  if (!storedPath) return '';

  if (/^https?:\/\//i.test(storedPath)) {
    if (storedPath.includes('propertys/')) {
      // eslint-disable-next-line no-console
      console.warn('Using legacy image URL path:', storedPath);
    }
    return storedPath;
  }

  let normalized = String(storedPath).replace(/^\/+/, '');

  if (normalized.includes('propertys/')) {
    // eslint-disable-next-line no-console
    console.warn('Using legacy image path:', storedPath);
  }

  return R2_BASE_URL ? `${R2_BASE_URL}/${normalized}` : normalized;
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
