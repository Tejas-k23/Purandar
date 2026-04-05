import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Property from '../models/Property.js';
import { env } from '../config/env.js';
import { getImageUrl } from '../utils/media.js';

dotenv.config();

const normalizeLegacyPath = (value = '') => {
  if (!value) return '';
  let next = String(value).trim();
  next = next.replace(/propertys\/properties\//g, 'properties/');
  next = next.replace(/propertys\//g, 'properties/');
  return next;
};

const stripBaseUrl = (value = '') => {
  if (!value) return '';
  const base = env.R2_PUBLIC_URL?.replace(/\/$/, '');
  if (!base) return value;
  if (value.startsWith(base)) {
    return value.slice(base.length + 1);
  }
  return value;
};

const normalizeKey = (key = '') => {
  const stripped = stripBaseUrl(String(key).trim());
  return normalizeLegacyPath(stripped);
};

const normalizeUrl = (url = '') => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) {
    const cleaned = normalizeLegacyPath(url);
    return cleaned;
  }
  const cleaned = normalizeLegacyPath(url);
  return getImageUrl(cleaned);
};

const run = async () => {
  const uri = env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI in environment.');
    process.exit(1);
  }

  await mongoose.connect(uri, { autoIndex: false });

  const cursor = Property.find({}).cursor();
  let updated = 0;
  let scanned = 0;

  for await (const property of cursor) {
    scanned += 1;
    let changed = false;

    if (Array.isArray(property.images)) {
      const nextImages = property.images.map((img) => {
        const nextKey = normalizeKey(img.key || '');
        const nextUrl = getImageUrl(nextKey);
        if (nextKey !== img.key || nextUrl !== img.url) {
          changed = true;
          return { ...img, key: nextKey, url: nextUrl };
        }
        return img;
      });
      property.images = nextImages;
    }

    if (Array.isArray(property.photos)) {
      const nextPhotos = property.photos
        .map((photo) => normalizeUrl(photo))
        .filter(Boolean);
      if (JSON.stringify(nextPhotos) !== JSON.stringify(property.photos)) {
        changed = true;
        property.photos = nextPhotos;
      }
    }

    if (changed) {
      updated += 1;
      await property.save({ validateBeforeSave: false });
    }
  }

  console.log(`Scanned: ${scanned}, Updated: ${updated}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

