import dotenv from 'dotenv';

dotenv.config();

const required = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DEMO_OTP: process.env.DEMO_OTP || '123456',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Purandar Admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@purandar.local',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  COMPANY_CONTACT_NAME: process.env.COMPANY_CONTACT_NAME || 'Purandar Properties',
  COMPANY_CONTACT_PHONE: process.env.COMPANY_CONTACT_PHONE || '',
  COMPANY_CONTACT_EMAIL: process.env.COMPANY_CONTACT_EMAIL || '',
  MSG91_AUTHKEY: process.env.MSG91_AUTHKEY || '',
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
  R2_ENDPOINT: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  MEDIA_IMAGE_MAX_MB: Number(process.env.MEDIA_IMAGE_MAX_MB || 5),
  MEDIA_VIDEO_MAX_MB: Number(process.env.MEDIA_VIDEO_MAX_MB || 50),
};

