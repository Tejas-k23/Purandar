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
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '14d',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Purandar Admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@purandar.local',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  COMPANY_CONTACT_NAME: process.env.COMPANY_CONTACT_NAME || 'Purandar Properties',
  COMPANY_CONTACT_PHONE: process.env.COMPANY_CONTACT_PHONE || '',
  COMPANY_CONTACT_EMAIL: process.env.COMPANY_CONTACT_EMAIL || '',
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'info@purandarprimepropertys.live',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'Purandar Prime Propertys',
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || '',
  CONTACT_AUTO_RESPONSE_ENABLED: process.env.CONTACT_AUTO_RESPONSE_ENABLED === 'true',
  MSG91_AUTHKEY: process.env.MSG91_AUTHKEY || process.env.MSG91_AUTH_KEY || '',
  MSG91_TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID || '',
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
  R2_ENDPOINT: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  MEDIA_IMAGE_MAX_MB: Number(process.env.MEDIA_IMAGE_MAX_MB || 5),
  MEDIA_VIDEO_MAX_MB: Number(process.env.MEDIA_VIDEO_MAX_MB || 50),
};

