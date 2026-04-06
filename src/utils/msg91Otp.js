import env from '../config/env';

const SCRIPT_URLS = [
  'https://verify.msg91.com/otp-provider.js',
  'https://verify.phone91.com/otp-provider.js',
];

let scriptPromise = null;

const loadMsg91Script = () => {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    let index = 0;

    const attempt = () => {
      const script = document.createElement('script');
      script.src = SCRIPT_URLS[index];
      script.async = true;
      script.onload = () => {
        if (typeof window.initSendOTP === 'function') {
          resolve();
        } else {
          reject(new Error('MSG91 OTP SDK failed to initialize.'));
        }
      };
      script.onerror = () => {
        index += 1;
        if (index < SCRIPT_URLS.length) {
          attempt();
        } else {
          reject(new Error('Unable to load MSG91 OTP SDK.'));
        }
      };
      document.head.appendChild(script);
    };

    attempt();
  });

  return scriptPromise;
};

const readAccessToken = (data) => (
  data?.accessToken
  || data?.access_token
  || data?.token
  || data?.tokenAuth
  || data?.authToken
  || data?.data?.accessToken
  || data?.data?.access_token
  || data?.data?.token
  || data?.data?.tokenAuth
);

const normalizeIdentifier = (value = '') => {
  const raw = String(value).replace(/\D/g, '');
  if (!raw) return '';
  if (raw.length === 10) return `+91${raw}`;
  if (raw.startsWith('91') && raw.length === 12) return `+${raw}`;
  return raw.startsWith('+') ? raw : `+${raw}`;
};

export const startMsg91Otp = async ({ identifier } = {}) => {
  if (!env.msg91WidgetId || !env.msg91TokenAuth) {
    throw new Error('MSG91 OTP is not configured.');
  }

  await loadMsg91Script();
  const normalizedIdentifier = normalizeIdentifier(identifier);

  return new Promise((resolve, reject) => {
    const configuration = {
      widgetId: env.msg91WidgetId,
      tokenAuth: env.msg91TokenAuth,
      identifier: normalizedIdentifier || undefined,
      exposeMethods: env.msg91ExposeMethods,
      success: (data) => {
        const accessToken = readAccessToken(data);
        window.__msg91LastOtpResponse = data;
        // Debug: keep raw response for inspection
        console.log('MSG91 OTP response:', data);
        if (!accessToken) {
          reject(new Error('OTP verified but access token was missing. Check MSG91 widget settings for access token.'));
          return;
        }
        resolve({ otpToken: accessToken, response: data });
      },
      failure: (error) => {
        reject(new Error(error?.message || 'OTP verification failed.'));
      },
    };

    window.initSendOTP(configuration);
  });
};

export default startMsg91Otp;
