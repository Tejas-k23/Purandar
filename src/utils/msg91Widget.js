const SCRIPT_URLS = [
  'https://verify.msg91.com/otp-provider.js',
  'https://verify.phone91.com/otp-provider.js',
];

let scriptPromise = null;
const SEND_OTP_DEDUP_MS = 4000;
const activeOtpSends = new Map();

/**
 * Tracks the last config used to initialize the widget so we can detect
 * when re-initialization is genuinely needed (e.g. widget/token change).
 * On each initWidget call we always re-run initSendOTP and wait for the
 * globals to settle, to prevent the "widget not found" race on first click.
 */
let widgetInitPromise = null;
let lastWidgetConfig = null;

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

/**
 * Polls until ALL three MSG91 widget globals are defined:
 *   - window.initSendOTP  (widget initialisation)
 *   - window.sendOtp      (OTP send)
 *   - window.verifyOtp    (OTP verify)
 *
 * The MSG91 otp-provider.js sets these globals *after* its own internal async
 * setup, which runs even after the script tag fires `onload`. Checking any one
 * of them immediately (synchronously) after the script loads will fail on the
 * first attempt because they are not all set at the same time.
 */
const waitForWidgetGlobals = (timeoutMs = 5000, intervalMs = 50) =>
  new Promise((resolve, reject) => {
    const allReady = () =>
      typeof window.initSendOTP === 'function' &&
      typeof window.sendOtp === 'function' &&
      typeof window.verifyOtp === 'function';

    if (allReady()) {
      resolve();
      return;
    }
    const deadline = Date.now() + timeoutMs;
    const timer = setInterval(() => {
      if (allReady()) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() >= deadline) {
        clearInterval(timer);
        reject(new Error('MSG91 widget is not available.'));
      }
    }, intervalMs);
  });

/**
 * A small settling delay after initSendOTP so that any internal async
 * setup MSG91 does (re-registering window.sendOtp etc.) has time to finish
 * before we call sendOtpWithWidget.
 */
const waitForWidgetSettled = (settleMs = 120, timeoutMs = 5000, intervalMs = 50) =>
  new Promise((resolve, reject) => {
    const allReady = () =>
      typeof window.initSendOTP === 'function' &&
      typeof window.sendOtp === 'function' &&
      typeof window.verifyOtp === 'function';

    // Give MSG91 a moment to finish internal re-registration after initSendOTP.
    const settle = Date.now() + settleMs;
    const deadline = Date.now() + timeoutMs;

    const timer = setInterval(() => {
      if (allReady() && Date.now() >= settle) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() >= deadline) {
        clearInterval(timer);
        reject(new Error('MSG91 widget did not settle after initialisation.'));
      }
    }, intervalMs);
  });

export const initWidget = async (config) => {
  // Serialize concurrent initWidget calls so that only one runs at a time.
  // This avoids double-init races when both Login and MobileVerificationCard
  // happen to call ensureWidgetReady at the same time.
  const configKey = JSON.stringify({ widgetId: config.widgetId, tokenAuth: config.tokenAuth });

  widgetInitPromise = (async () => {
    await waitForWidgetGlobals();
    // Always call initSendOTP so the success/failure callbacks on `config`
    // are registered fresh for this component's context.
    window.initSendOTP(config);
    lastWidgetConfig = configKey;
    // Wait for MSG91's internal async re-registration to settle.
    await waitForWidgetSettled();
  })();

  return widgetInitPromise;
};

export const sendOtpWithWidget = async (identifier, onSuccess, onFailure) => {
  // If initWidget is currently in flight (i.e. initSendOTP is still settling),
  // wait for it to complete first so window.sendOtp is the fresh post-init version.
  if (widgetInitPromise) {
    await widgetInitPromise.catch(() => {});
  } else {
    // Fallback: just ensure the globals are present.
    await waitForWidgetGlobals();
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

export const verifyOtpWithWidget = async (otp, onSuccess, onFailure, reqId) => {
  // Wait for window.verifyOtp to be available (set asynchronously by MSG91 script).
  await waitForWidgetGlobals();
  window.verifyOtp(otp, onSuccess, onFailure, reqId);
};

