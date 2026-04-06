const SCRIPT_URLS = [
  'https://verify.msg91.com/otp-provider.js',
  'https://verify.phone91.com/otp-provider.js',
];

let scriptPromise = null;

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

export const extractAccessToken = (data) => (
  data?.token
  || data?.accessToken
  || data?.access_token
  || data?.otp_token
  || data?.message
  || data
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
  window.sendOtp(identifier, onSuccess, onFailure);
};

export const verifyOtpWithWidget = (otp, onSuccess, onFailure, reqId) => {
  if (typeof window.verifyOtp !== 'function') {
    throw new Error('MSG91 widget verifyOtp is not available.');
  }
  window.verifyOtp(otp, onSuccess, onFailure, reqId);
};
