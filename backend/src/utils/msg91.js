import ApiError from './ApiError.js';
import { env } from '../config/env.js';

const VERIFY_URL = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return null;
  }
};

export const verifyMsg91AccessToken = async (accessToken) => {
  if (!env.MSG91_AUTHKEY) {
    throw new ApiError(500, 'MSG91 auth key is not configured');
  }

  if (!accessToken) {
    throw new ApiError(400, 'OTP access token is required');
  }

  const response = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authkey: env.MSG91_AUTHKEY,
      'access-token': accessToken,
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new ApiError(401, data?.message || 'OTP verification failed');
  }

  const isValid = Boolean(
    data?.request_id
    || String(data?.type || '').toLowerCase() === 'success'
    || /token verified/i.test(String(data?.message || '')),
  );

  if (!isValid) {
    throw new ApiError(401, data?.message || 'OTP verification failed');
  }

  return data;
};

export default verifyMsg91AccessToken;
