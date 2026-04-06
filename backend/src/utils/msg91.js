import https from 'https';
import ApiError from './ApiError.js';
import { env } from '../config/env.js';

const VERIFY_URL = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';

const postForm = (url, body) => new Promise((resolve, reject) => {
  const target = new URL(url);
  const options = {
    method: 'POST',
    hostname: target.hostname,
    path: `${target.pathname}${target.search}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
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
  });

  req.on('error', reject);
  req.write(body);
  req.end();
});

export const verifyMsg91AccessToken = async (accessToken) => {
  if (!env.MSG91_AUTHKEY) {
    throw new ApiError(500, 'MSG91 auth key is not configured');
  }

  if (!accessToken) {
    throw new ApiError(400, 'OTP access token is required');
  }

  const payload = new URLSearchParams({
    authkey: env.MSG91_AUTHKEY,
    'access-token': accessToken,
  }).toString();

  const response = await postForm(VERIFY_URL, payload);
  const data = response.json;

  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new ApiError(401, data?.message || 'OTP verification failed');
  }

  const status = String(data?.type || data?.status || '').toLowerCase();
  const message = String(data?.message || '');
  if (status && status !== 'success') {
    throw new ApiError(401, data?.message || 'OTP verification failed');
  }
  if (!status && message && !/success|verified/i.test(message)) {
    throw new ApiError(401, data?.message || 'OTP verification failed');
  }

  return data;
};

export default verifyMsg91AccessToken;
