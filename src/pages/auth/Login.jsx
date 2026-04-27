import React, { useMemo, useRef, useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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

export default function Login() {
  const { refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialPhone = normalizePhoneInput(searchParams.get('phone'));
  const otpSentFromSignup = Boolean(location.state?.otpSent);
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState(
    otpSentFromSignup && initialPhone ? normalizePhone(initialPhone) : '',
  );
  const [step, setStep] = useState(otpSentFromSignup ? 'otp' : 'phone');
  const [reqId, setReqId] = useState(
    otpSentFromSignup && initialPhone ? readReqId(normalizePhone(initialPhone)) : '',
  );
  const [phoneError, setPhoneError] = useState('');
  const [formMessage, setFormMessage] = useState(
    otpSentFromSignup ? 'OTP already sent to your phone.' : '',
  );
  const [loading, setLoading] = useState(false);
  const otpSendInFlightRef = useRef(false);

  const backgroundLocation = location.state?.backgroundLocation;
  const closeTarget = useMemo(() => location.state?.from || '/', [location.state]);
  const resolveBackgroundPath = () => {
    if (!backgroundLocation) return closeTarget;
    if (typeof backgroundLocation === 'string') return backgroundLocation;
    return `${backgroundLocation.pathname || ''}${backgroundLocation.search || ''}${backgroundLocation.hash || ''}` || '/';
  };

  const closeModal = () => {
    navigate(resolveBackgroundPath(), { replace: true });
  };

  const ensureWidgetReady = async () => {
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
          setFormMessage('OTP verified but token was missing.');
          return;
        }
        try {
          const loginResponse = await userService.verifyMsg91Token({
            phone: normalizedPhone || normalizePhone(phone),
            accessToken,
            intent: 'login',
          });
          const responseData = loginResponse?.data || loginResponse;
          await refreshProfile();
          navigate(closeTarget, { replace: true });
        } catch (error) {
          setFormMessage(error.message);
        }
      },
      failure: (error) => {
        const msg = typeof error === 'string' ? error : (error?.message || error?.reason || 'OTP verification failed.');
        setFormMessage(msg);
      },
    });
  };

  const continueWithPhone = async () => {
    if (otpSendInFlightRef.current) return;
    setPhoneError('');
    setFormMessage('');
    setReqId('');
    setOtp('');

    if (!isValidPhone(phone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    otpSendInFlightRef.current = true;
    try {
      const formattedPhone = normalizePhone(phone);
      await userService.validateForOtp({ phone: formattedPhone, intent: 'login' });
      await ensureWidgetReady();

      clearReqId(formattedPhone);
      setNormalizedPhone(formattedPhone);
      await sendOtpWithWidget(
        buildIdentifier(formattedPhone),
        (data) => {
          window.__msg91LastSendOtpResponse = data;
          window.__msg91LastSendOtpResponse = data;
          const nextReqId = extractReqId(data);
          setReqId(nextReqId);
          storeReqId(formattedPhone, nextReqId);
          setStep('otp');
          setFormMessage('OTP sent to your phone.');
          setLoading(false);
          otpSendInFlightRef.current = false;
        },
        (error) => {
          const errorResponse = error;
          const msg = typeof error === 'string' ? error : (error?.message || error?.reason || 'Failed to send OTP');
          setFormMessage(msg);
          setLoading(false);
          otpSendInFlightRef.current = false;
        },
      );
    } catch (error) {
      setFormMessage(error.message);
      setLoading(false);
      otpSendInFlightRef.current = false;
    }
  };

  const verifyOtp = async () => {
    setFormMessage('');
    if (!otp.trim()) {
      setFormMessage('Please enter the OTP.');
      return;
    }
    const effectivePhone = normalizedPhone || normalizePhone(phone);
    const storedReqId = reqId || readReqId(effectivePhone);
    if (!reqId && storedReqId) {
      setReqId(storedReqId);
    }
    if (!storedReqId) {
      setFormMessage('OTP request id missing. Please resend the OTP.');
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
            setFormMessage('OTP verified but token was missing.');
            setLoading(false);
            return;
          }
          try {
            const loginResponse = await userService.verifyMsg91Token({
              phone: effectivePhone,
              accessToken,
              intent: 'login',
            });
            const responseData = loginResponse?.data || loginResponse;
            await refreshProfile();
            clearReqId(effectivePhone);
            navigate(closeTarget, { replace: true });
          } catch (error) {
            setFormMessage(error.message);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          const msg = typeof error === 'string' ? error : (error?.message || error?.reason || 'Invalid or expired OTP.');
          setFormMessage(msg);
          setLoading(false);
        },
        storedReqId,
      );
    } catch (error) {
      setFormMessage(error.message);
    }
  };

  return (
    <Modal onClose={closeModal} className="auth-modal-shell">
      <h1 className="auth-modal-title">Login / Register</h1>
      <p className="auth-modal-subtitle">Please enter your Phone Number</p>

      <div className="auth-modal-stack">
        <GoogleAuthButton
          mode="signin"
          onSuccess={() => navigate(closeTarget, { replace: true })}
          onError={(message) => setFormMessage(message)}
        />

        <div className="auth-divider">or continue with phone</div>

        {step === 'phone' ? (
          <>
            <div className="auth-input-group">
              <div className="auth-phone-row">
                <div className="auth-country-code">
                  <span>+91</span>
                  <ChevronDown size={14} />
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className="auth-phone-input"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(event) => setPhone(normalizePhoneInput(event.target.value))}
                />
              </div>
              {phoneError ? <div className="auth-error"><span className="auth-error-dot">?</span><span>{phoneError}</span></div> : null}
            </div>

            <button type="button" className="auth-primary-btn" onClick={continueWithPhone} disabled={loading}>
              {loading ? 'Please wait...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="login-otp">Enter OTP</label>
              <div className="auth-input-row">
                <input
                  id="login-otp"
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  className="auth-input"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <button type="button" className="auth-primary-btn" onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button
              type="button"
              className="auth-secondary-btn"
              onClick={() => {
                const effectivePhone = normalizedPhone || normalizePhone(phone);
                clearReqId(effectivePhone);
                setReqId('');
                setStep('phone');
                setOtp('');
              }}
              disabled={loading}
            >
              Change number
            </button>
          </>
        )}

        {formMessage ? <div className="auth-info"><Phone size={16} /><span>{formMessage}</span></div> : null}
      </div>

      <p className="auth-footer">
        By clicking you agree to <a href="#" className="auth-link">Terms and Conditions</a>
      </p>
      <p className="auth-footer" style={{ marginTop: 10 }}>
        New here? <Link to="/signup" state={{ backgroundLocation: backgroundLocation || closeTarget }} className="auth-link">Create Account</Link>
      </p>
    </Modal>
  );
}
