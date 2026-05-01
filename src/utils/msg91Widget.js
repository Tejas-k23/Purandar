const SCRIPT_URLS = [
  'https://verify.msg91.com/otp-provider.js',
  'https://verify.phone91.com/otp-provider.js',
];

let scriptPromise = null;
let widgetInitPromise = null;
const SEND_OTP_DEDUP_MS = 4000;
const activeOtpSends = new Map();

const allGlobalsReady = () =>
  typeof window.initSendOTP === 'function' &&
  typeof window.sendOtp === 'function' &&
  typeof window.verifyOtp === 'function';

/**
 * Loads the MSG91 script AND waits until all three widget globals are defined.
 * otp-provider.js uses Zone.js which sets globals asynchronously *after* the
 * script onload fires — so we poll for up to 20 s before giving up.
 * Returns the same promise on every call (singleton).
 */
export const loadMsg91Script = () => {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (allGlobalsReady()) { resolve(); return; }

    let index = 0;

    const waitForGlobals = () => {
      const deadline = Date.now() + 20000;
      const timer = setInterval(() => {
        if (allGlobalsReady()) {
          clearInterval(timer);
          resolve();
        } else if (Date.now() >= deadline) {
          clearInterval(timer);
          reject(new Error('MSG91 widget globals did not become available.'));
        }
      }, 100);
    };

    const attempt = () => {
      const script = document.createElement('script');
      script.src = SCRIPT_URLS[index];
      script.async = true;
      script.onload = waitForGlobals;
      script.onerror = () => {
        index += 1;
        if (index < SCRIPT_URLS.length) attempt();
        else reject(new Error('Unable to load MSG91 widget script.'));
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
  if (!reqId || typeof window === 'undefined' || !window.sessionStorage) return;
  const id = buildIdentifier(phone);
  if (!id) return;
  try { window.sessionStorage.setItem(`${REQ_ID_KEY_PREFIX}${id}`, reqId); } catch (_) {}
};

export const readReqId = (phone) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return '';
  const id = buildIdentifier(phone);
  if (!id) return '';
  try { return window.sessionStorage.getItem(`${REQ_ID_KEY_PREFIX}${id}`) || ''; } catch (_) { return ''; }
};

export const clearReqId = (phone) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  const id = buildIdentifier(phone);
  if (!id) return;
  try { window.sessionStorage.removeItem(`${REQ_ID_KEY_PREFIX}${id}`); } catch (_) {}
};

export const extractAccessToken = (data) => (
  data?.token || data?.accessToken || data?.access_token || data?.otp_token || data?.message || data
);

export const extractReqId = (data) => (
  data?.reqId || data?.requestId || data?.request_id || data?.req_id
  || data?.otpId || data?.otp_id || data?.message || data?.messageId || data?.message_id
  || data?.data?.reqId || data?.data?.requestId || data?.data?.request_id || data?.data?.req_id
  || data?.data?.otpId || data?.data?.otp_id || data?.data?.message || data?.data?.messageId
  || data?.data?.message_id || data?.details?.request_id || data?.details?.reqId
  || data?.details?.requestId || data?.details?.req_id
  || (typeof data === 'string' ? data : '')
);

/**
 * Initialises the MSG91 widget with the given config.
 *
 * Callers MUST `await` this before calling sendOtpWithWidget.
 *
 * window.initSendOTP returns synchronously but MSG91 does its real internal
 * setup (iframe init, token handshake) asynchronously after returning.
 * The 300 ms delay gives that setup time to complete.
 */
export const initWidget = (config) => {
  widgetInitPromise = (async () => {
    // Globals are guaranteed ready by the time loadMsg91Script resolves.
    window.initSendOTP(config);
    // Give MSG91's internal async setup time to settle before sendOtp is called.
    await new Promise((resolve) => setTimeout(resolve, 300));
  })();
  return widgetInitPromise;
};

export const sendOtpWithWidget = async (identifier, onSuccess, onFailure) => {
  // Wait for initWidget's settle delay — key guard against "widget not found".
  if (widgetInitPromise) {
    await widgetInitPromise.catch(() => {});
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
        if (latest?.startedAt === currentTime) activeOtpSends.delete(normalizedIdentifier);
      }, SEND_OTP_DEDUP_MS);
    };
    window.sendOtp(
      normalizedIdentifier,
      (data) => { onSuccess?.(data); release(); resolve(data); },
      (error) => { onFailure?.(error); release(); reject(error); },
    );
  });

  const promise = rawPromise.catch(() => undefined);
  activeOtpSends.set(normalizedIdentifier, { startedAt: currentTime, promise });
  return promise;
};

export const verifyOtpWithWidget = async (otp, onSuccess, onFailure, reqId) => {
  if (widgetInitPromise) await widgetInitPromise.catch(() => {});
  window.verifyOtp(otp, onSuccess, onFailure, reqId);
};
