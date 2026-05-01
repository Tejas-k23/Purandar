import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, Info, Lock, Phone, XCircle } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import env from '../../config/env';
import {
  buildIdentifier,
  clearReqId,
  extractAccessToken,
  extractReqId,
  initWidget,
  loadMsg91Script,
  readReqId,
  sendOtpWithWidget,
  storeReqId,
  verifyOtpWithWidget,
} from '../../utils/msg91Widget';
import './AuthModal.css';

const normalizePhoneInput = (value) => String(value || '').replace(/\D/g, '').slice(-10);
const isValidPhone = (value) => /^\d{10}$/.test(value.trim());
const normalizePhone = (value) => `+91${String(value).replace(/\D/g, '').slice(-10)}`;

export default function Signup() {
  const { refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const role = 'owner';
  const [fullName, setFullName] = useState('');
  const [phoneInput, setPhoneInput] = useState(normalizePhoneInput(searchParams.get('phone')));
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [reqId, setReqId] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpClicksLeft, setOtpClicksLeft] = useState(2);
  const otpSendInFlightRef = useRef(false);
  const phone = normalizePhoneInput(searchParams.get('phone'));
  const hasLockedPhone = isValidPhone(phone);
  const backgroundLocation = location.state?.backgroundLocation;
  const closeTarget = useMemo(() => '/', []);

  const resolveBackgroundPath = () => {
    if (!backgroundLocation) return closeTarget;
    if (typeof backgroundLocation === 'string') return backgroundLocation;
    return `${backgroundLocation.pathname || ''}${backgroundLocation.search || ''}${backgroundLocation.hash || ''}` || '/';
  };

  const closeModal = () => {
    navigate(resolveBackgroundPath(), { replace: true });
  };

  const changeNumber = () => {
    clearReqId(normalizePhone(phone));
    navigate(`/login?phone=${phone}`, {
      replace: true,
      state: { backgroundLocation: backgroundLocation || closeTarget },
    });
  };

  const ensureWidgetReady = async (normalizedPhone) => {
    if (!env.msg91WidgetId || !env.msg91WidgetToken) {
      throw new Error('OTP widget is not configured.');
    }

    await loadMsg91Script();
    initWidget({
      widgetId: env.msg91WidgetId,
      tokenAuth: env.msg91WidgetToken,
      authToken: env.msg91WidgetToken,
      exposeMethods: true,
      success: async (data) => {
        const accessToken = extractAccessToken(data);
        window.__msg91LastOtpResponse = data;
        window.__msg91LastOtpResponse = data;
        if (!accessToken) {
          setFormError('OTP verified but token was missing.');
          return;
        }
        if (!fullName.trim()) {
          setFormError('Please enter your full name before verifying OTP.');
          clearReqId(normalizedPhone);
          setReqId('');
          setOtp('');
          setOtpSent(false);
          return;
        }
        try {
          const res = await userService.verifyMsg91Token({
            phone: normalizedPhone,
            accessToken,
            intent: 'signup',
            name: fullName.trim(),
            role: role === 'broker' ? 'agent' : 'user',
          });
          const responseData = res?.data || res;
          setIsVerified(true);
          await refreshProfile();
          clearReqId(normalizedPhone);
          closeModal();
        } catch (error) {
          setFormError(error.message);
        }
      },
      failure: (error) => {
        const msg = typeof error === 'string' ? error : (error?.message || error?.reason || 'OTP verification failed.');
        setFormError(msg);
      },
    });
  };

  const requestOtp = async ({ rawPhone, navigateOnSuccess = false }) => {
    if (otpSendInFlightRef.current) return;
    otpSendInFlightRef.current = true;
    setLoading(true);
    setFormError('');
    setReqId('');
    setOtp('');
    setOtpSent(false);

    try {
      const normalizedPhone = normalizePhone(rawPhone);
      const phoneDigits = normalizePhoneInput(rawPhone);
      const response = await userService.checkPhone({ phone: normalizedPhone });
      const exists = response.data?.data?.exists;

      await userService.validateForOtp({ phone: normalizedPhone, intent: 'signup' });
      await ensureWidgetReady(normalizedPhone);

      clearReqId(normalizedPhone);
      await sendOtpWithWidget(
        buildIdentifier(normalizedPhone),
        (data) => {
          window.__msg91LastSendOtpResponse = data;
          window.__msg91LastSendOtpResponse = data;
          const nextReqId = extractReqId(data);
          setReqId(nextReqId);
          storeReqId(normalizedPhone, nextReqId);
          setOtpSent(true);

          if (navigateOnSuccess) {
            if (exists) {
              navigate(`/login?phone=${phoneDigits}`, {
                replace: true,
                state: { backgroundLocation: backgroundLocation || closeTarget, otpSent: true },
              });
            } else {
              navigate(`/signup?phone=${phoneDigits}`, {
                replace: true,
                state: { backgroundLocation: backgroundLocation || closeTarget, otpSent: true },
              });
            }
          } else {
            setFormError('OTP sent to your phone.');
          }

          setLoading(false);
          otpSendInFlightRef.current = false;
        },
        (error) => {
          const errorResponse = error;
          const msg = typeof error === 'string' ? error : (error?.message || error?.reason || 'Failed to send OTP');
          setFormError(msg);
          setLoading(false);
          otpSendInFlightRef.current = false;
        },
      );
    } catch (error) {
      if (otpClicksLeft === 2 && error.message.includes('not available')) {
        setOtpClicksLeft(1);
        setFormError('');
      } else {
        setFormError(error.message);
      }
      setLoading(false);
      otpSendInFlightRef.current = false;
    }
  };

  const continueWithPhone = async () => {
    setPhoneError('');
    setFormError('');

    if (!isValidPhone(phoneInput)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    await requestOtp({ rawPhone: phoneInput, navigateOnSuccess: true });
  };

  const verifyOtp = async () => {
    setFormError('');
    if (!otp.trim()) {
      setFormError('Please enter the OTP.');
      return;
    }
    if (!fullName.trim()) {
      setFormError('Please enter your full name before verifying OTP.');
      return;
    }
    const normalizedPhone = normalizePhone(phone);
    const storedReqId = reqId || readReqId(normalizedPhone);
    if (!reqId && storedReqId) {
      setReqId(storedReqId);
    }
    if (!storedReqId) {
      setFormError('OTP request id missing. Please resend the OTP.');
      return;
    }

    setLoading(true);
    try {
      verifyOtpWithWidget(
        otp.trim(),
        async (data) => {
          const accessToken = extractAccessToken(data);
          window.__msg91LastOtpResponse = data;
          window.__msg91LastOtpResponse = data;
          if (!accessToken) {
            setFormError('OTP verified but token was missing.');
            setLoading(false);
            return;
          }
          if (!fullName.trim()) {
            setFormError('Please enter your full name before verifying OTP.');
            setLoading(false);
            return;
          }
          try {
            const res = await userService.verifyMsg91Token({
              phone: normalizedPhone,
              accessToken,
              intent: 'signup',
              name: fullName.trim(),
              role: role === 'broker' ? 'agent' : 'user',
            });
            const responseData = res?.data || res;
            setIsVerified(true);
            await refreshProfile();
            clearReqId(normalizedPhone);
            closeModal();
          } catch (error) {
            setFormError(error.message);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          const msg = typeof error === 'string' ? error : (error?.message || error?.reason || 'Invalid or expired OTP.');
          setFormError(msg);
          setLoading(false);
        },
        storedReqId,
      );
    } catch (error) {
      setFormError(error.message);
    }
  };

  const sendOtpForLockedPhone = async () => {
    await requestOtp({ rawPhone: phone, navigateOnSuccess: false });
  };

  const submit = async (event) => {
    event.preventDefault();
    setNameError('');
    setTermsError('');
    setFormError('');

    if (!fullName.trim()) {
      setNameError('Please enter your full name');
      return;
    }

    if (!isValidPhone(phone)) {
      setFormError('Please go back and enter a valid phone number');
      return;
    }

    if (!isVerified) {
      setFormError('Please verify the OTP before creating your account.');
      return;
    }

    if (!agreed) {
      setTermsError('This is required for creating an account');
      return;
    }

    setLoading(true);
    try {
      await refreshProfile();
      closeModal();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={closeModal} className="auth-modal-shell">
      <h1 className="auth-modal-title">Create Account</h1>

      {!hasLockedPhone ? (
        <div className="auth-modal-stack">
          <GoogleAuthButton
            mode="signup"
            role="user"
            onSuccess={() => closeModal()}
            onError={(message) => setFormError(message)}
          />

          <div className="auth-divider">or continue with phone</div>

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="signup-phone-entry">Phone Number</label>
            <div className="auth-phone-row">
              <div className="auth-country-code">
                <span>+91</span>
                <ChevronDown size={14} />
              </div>
              <input
                id="signup-phone-entry"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className="auth-phone-input"
                placeholder="Enter phone number"
                value={phoneInput}
                onChange={(event) => setPhoneInput(normalizePhoneInput(event.target.value))}
              />
            </div>
            {phoneError ? <div className="auth-error"><span className="auth-error-dot">?</span><span>{phoneError}</span></div> : null}
          </div>

          <button type="button" className="auth-primary-btn" onClick={continueWithPhone} disabled={loading}>
            {loading ? 'Please wait...' : (otpClicksLeft === 1 ? 'Click Again' : 'Send OTP')}
          </button>

          {formError ? <div className="auth-info"><Phone size={16} /><span>{formError}</span></div> : null}
        </div>
      ) : (
        <form className="auth-modal-stack" onSubmit={submit}>
          <div className="auth-input-group">
            <label className="auth-label" htmlFor="signup-name">Full Name</label>
            <div className="auth-input-row">
              <input
                id="signup-name"
                type="text"
                className="auth-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            {nameError ? <div className="auth-error"><span className="auth-error-dot">?</span><span>{nameError}</span></div> : null}
          </div>

          <div className="auth-input-group">
            <label className="auth-label" htmlFor="signup-phone">Phone Number</label>
            <div className="auth-phone-row">
              <div className="auth-country-code">
                <span>+91</span>
                <ChevronDown size={14} />
              </div>
              <input id="signup-phone" type="text" className="auth-phone-input" value={phone} readOnly />
              <Lock size={16} className="auth-locked-icon" />
            </div>
            <button type="button" className="auth-inline-link" onClick={changeNumber}>
              <Info size={14} />
              <span>Change Number</span>
            </button>
          </div>

          {!isVerified ? (
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="signup-otp">Enter OTP</label>
              <div className="auth-input-row">
                <input
                  id="signup-otp"
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  className="auth-input"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                />
              </div>
              {!otpSent ? (
                  <button type="button" className="auth-secondary-btn" onClick={sendOtpForLockedPhone} disabled={loading}>
                    {loading ? 'Sending...' : (otpClicksLeft === 1 ? 'Click Again' : 'Send OTP')}
                  </button>
              ) : null}
              <button type="button" className="auth-secondary-btn" onClick={verifyOtp} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          ) : null}

          <label className="auth-checkbox-row">
            <input type="checkbox" className="auth-checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
            <span>
              I agree to the <a href="#" className="auth-link">Terms &amp; Conditions</a> and <a href="#" className="auth-link">Privacy Policy</a>
            </span>
          </label>

          {termsError ? (
            <div className="auth-error">
              <XCircle size={14} />
              <span>{termsError}</span>
            </div>
          ) : null}

          {formError ? <div className="auth-error"><span className="auth-error-dot">?</span><span>{formError}</span></div> : null}

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}
    </Modal>
  );
}
