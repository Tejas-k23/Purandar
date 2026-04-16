const SCRIPT_URLS = [
  'https://verify.msg91.com/otp-provider.js',
  'https://verify.phone91.com/otp-provider.js',
];

let scriptPromise = null;
const SEND_OTP_DEDUP_MS = 4000;
const activeOtpSends = new Map();

export const loadMsg91Script = () => {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    let index = 0;

    const attempt = () => {
      const script = document.createElement('script');
      script.src = SCRIPT_URLS[index];
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        index += 1;
        if (index < SCRIPT_URLS.length) {
          attempt();
        } else {
          reject(new Error('Unable to load MSG91 widget script.'));
        }
      };
      document.head.appendChild(script);
    };

    attempt();
  });

  return scriptPromise;
};

export const buildIdentifier = (phone) => {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith('91')) return digits;
  return digits;
};

const REQ_ID_KEY_PREFIX = 'msg91:reqId:';

export const storeReqId = (phone, reqId) => {
  if (!reqId) return;
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  const identifier = buildIdentifier(phone);
  if (!identifier) return;
  try {
    window.sessionStorage.setItem(`${REQ_ID_KEY_PREFIX}${identifier}`, reqId);
  } catch (_error) {
    // ignore storage failures (private mode, quota, etc.)
  }
};

export const readReqId = (phone) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return '';
  const identifier = buildIdentifier(phone);
  if (!identifier) return '';
  try {
    return window.sessionStorage.getItem(`${REQ_ID_KEY_PREFIX}${identifier}`) || '';
  } catch (_error) {
    return '';
  }
};

export const clearReqId = (phone) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  const identifier = buildIdentifier(phone);
  if (!identifier) return;
  try {
    window.sessionStorage.removeItem(`${REQ_ID_KEY_PREFIX}${identifier}`);
  } catch (_error) {
    // ignore
  }
};

export const extractAccessToken = (data) => (
  data?.token
  || data?.accessToken
  || data?.access_token
  || data?.otp_token
  || data?.message
  || data
);

export const extractReqId = (data) => (
  data?.reqId
  || data?.requestId
  || data?.request_id
  || data?.req_id
  || data?.otpId
  || data?.otp_id
  || data?.message
  || data?.messageId
  || data?.message_id
  || data?.data?.reqId
  || data?.data?.requestId
  || data?.data?.request_id
  || data?.data?.req_id
  || data?.data?.otpId
  || data?.data?.otp_id
  || data?.data?.message
  || data?.data?.messageId
  || data?.data?.message_id
  || data?.details?.request_id
  || data?.details?.reqId
  || data?.details?.requestId
  || data?.details?.req_id
  || (typeof data === 'string' ? data : '')
);

export const initWidget = (config) => {
  if (typeof window.initSendOTP !== 'function') {
    throw new Error('MSG91 widget is not available.');
  }
  window.initSendOTP(config);
};

export const sendOtpWithWidget = (identifier, onSuccess, onFailure) => {
  if (typeof window.sendOtp !== 'function') {
    throw new Error('MSG91 widget sendOtp is not available.');
  }

  const normalizedIdentifier = buildIdentifier(identifier);
  const currentTime = Date.now();
  const existing = activeOtpSends.get(normalizedIdentifier);

  if (existing && (currentTime - existing.startedAt) < SEND_OTP_DEDUP_MS) {
    return existing.promise;
  }

  const rawPromise = new Promise((resolve, reject) => {
    const release = () => {
      window.setTimeout(() => {
        const latest = activeOtpSends.get(normalizedIdentifier);
        if (latest?.startedAt === currentTime) {
          activeOtpSends.delete(normalizedIdentifier);
        }
      }, SEND_OTP_DEDUP_MS);
    };

    window.sendOtp(
      normalizedIdentifier,
      (data) => {
        onSuccess?.(data);
        release();
        resolve(data);
      },
      (error) => {
        onFailure?.(error);
        release();
        reject(error);
      },
    );
  });

  const promise = rawPromise.catch(() => undefined);
  activeOtpSends.set(normalizedIdentifier, { startedAt: currentTime, promise });
  return promise;
};

export const verifyOtpWithWidget = (otp, onSuccess, onFailure, reqId) => {
  if (typeof window.verifyOtp !== 'function') {
    throw new Error('MSG91 widget verifyOtp is not available.');
  }
  window.verifyOtp(otp, onSuccess, onFailure, reqId);
};
