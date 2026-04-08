import https from 'https';
import ApiError from './ApiError.js';
import { env } from '../config/env.js';

const SEND_OTP_URL = 'https://control.msg91.com/api/v5/otp';
const VERIFY_OTP_URL = 'https://control.msg91.com/api/v5/otp/verify';

const requestJson = (url, options = {}) => new Promise((resolve, reject) => {
  const target = new URL(url);
  const req = https.request(
    {
      method: options.method || 'GET',
      hostname: target.hostname,
      path: `${target.pathname}${target.search}`,
      headers: options.headers || {},
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : null;
        } catch (_error) {
          json = null;
        }
        resolve({ statusCode: res.statusCode || 500, json, raw: data });
      });
    },
  );

  req.on('error', reject);
  if (options.body) {
    req.write(options.body);
  }
  req.end();
});

const normalizePhone = (value = '') => {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91')) return digits;
  return digits;
};

const assertConfigured = () => {
  if (!env.MSG91_AUTHKEY) {
    throw new ApiError(500, 'MSG91 auth key is not configured');
  }
  if (!env.MSG91_TEMPLATE_ID) {
    throw new ApiError(500, 'MSG91 template id is not configured');
  }
};

export const sendOtpViaMsg91 = async (phone) => {
  assertConfigured();
  const mobile = normalizePhone(phone);
  if (!mobile) {
    throw new ApiError(400, 'Phone number is required');
  }

  const url = new URL(SEND_OTP_URL);
  url.searchParams.set('template_id', env.MSG91_TEMPLATE_ID);
  url.searchParams.set('mobile', mobile);
  url.searchParams.set('authkey', env.MSG91_AUTHKEY);

  const response = await requestJson(url.toString(), { method: 'POST' });
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new ApiError(502, response.json?.message || 'Failed to send OTP');
  }

  if (response.json?.type && String(response.json.type).toLowerCase() !== 'success') {
    throw new ApiError(502, response.json?.message || 'Failed to send OTP');
  }

  return {
    mobile,
    raw: response.json,
  };
};

export const verifyOtpViaMsg91 = async ({ phone, otp }) => {
  assertConfigured();
  const mobile = normalizePhone(phone);
  if (!mobile) {
    throw new ApiError(400, 'Phone number is required');
  }
  if (!otp) {
    throw new ApiError(400, 'OTP is required');
  }

  const url = new URL(VERIFY_OTP_URL);
  url.searchParams.set('mobile', mobile);
  url.searchParams.set('otp', otp);

  const response = await requestJson(url.toString(), {
    method: 'GET',
    headers: {
      authkey: env.MSG91_AUTHKEY,
    },
  });

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new ApiError(401, response.json?.message || 'Invalid OTP');
  }

  const status = String(response.json?.type || response.json?.status || '').toLowerCase();
  if (status && status !== 'success') {
    throw new ApiError(401, response.json?.message || 'Invalid OTP');
  }

  return {
    mobile,
    raw: response.json,
  };
};

export default { sendOtpViaMsg91, verifyOtpViaMsg91 };
