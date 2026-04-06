import React, { useMemo, useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import env from '../../config/env';
import {
  buildIdentifier,
  extractAccessToken,
  initWidget,
  loadMsg91Script,
  sendOtpWithWidget,
  verifyOtpWithWidget,
} from '../../utils/msg91Widget';
import './AuthModal.css';

const isValidPhone = (value) => /^\d{10}$/.test(value.trim());
const normalizePhone = (value) => `+91${String(value).replace(/\D/g, '').slice(-10)}`;

export default function Login() {
  const { login, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [otp, setOtp] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [step, setStep] = useState('phone');
  const [reqId, setReqId] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const backgroundLocation = location.state?.backgroundLocation;
  const closeTarget = useMemo(() => location.state?.from || '/', [location.state]);
  const resolveBackgroundPath = () => {
    if (!backgroundLocation) {
      return closeTarget;
    }

    if (typeof backgroundLocation === 'string') {
      return backgroundLocation;
    }

    return `${backgroundLocation.pathname || ''}${backgroundLocation.search || ''}${backgroundLocation.hash || ''}` || '/';
  };

  const closeModal = () => {
    navigate(resolveBackgroundPath(), { replace: true });
  };

  const continueWithPhone = async () => {
    setPhoneError('');
    setFormMessage('');

    if (!isValidPhone(phone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = normalizePhone(phone);
      if (!env.msg91WidgetId || !env.msg91WidgetToken) {
        throw new Error('OTP widget is not configured.');
      }

      await userService.validateForOtp({ phone: formattedPhone, intent: 'login' });

      await loadMsg91Script();
      initWidget({
        widgetId: env.msg91WidgetId,
        tokenAuth: env.msg91WidgetToken,
        authToken: env.msg91WidgetToken,
        identifier: buildIdentifier(formattedPhone),
        exposeMethods: true,
        success: async (data) => {
          const accessToken = extractAccessToken(data);
          window.__msg91LastOtpResponse = data;
          console.log('MSG91 OTP response:', data);
          if (!accessToken) {
            setFormMessage('OTP verified but token was missing.');
            return;
          }
          try {
            const loginResponse = await userService.verifyMsg91Token({
              phone: formattedPhone,
              accessToken,
              intent: 'login',
            });
            console.log('Login response:', loginResponse?.data || loginResponse);
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

      sendOtpWithWidget(
        buildIdentifier(formattedPhone),
        (data) => {
          setReqId(data?.reqId || data?.request_id || '');
        },
        (error) => {
          const msg = typeof error === 'string' ? error : (error?.message || error?.reason || 'Failed to send OTP');
          setFormMessage(msg);
        },
      );

      setNormalizedPhone(formattedPhone);
      setStep('otp');
      setFormMessage('OTP sent to your phone.');
    } catch (error) {
      setFormMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setFormMessage('');
    if (!otp.trim()) {
      setFormMessage('Please enter the OTP.');
      return;
    }

    setLoading(true);
    try {
      verifyOtpWithWidget(
        otp.trim(),
        async (data) => {
          const accessToken = extractAccessToken(data);
          window.__msg91LastOtpResponse = data;
          console.log('MSG91 OTP response:', data);
          if (!accessToken) {
            setFormMessage('OTP verified but token was missing.');
            setLoading(false);
            return;
          }
          try {
            const loginResponse = await userService.verifyMsg91Token({
              phone: normalizedPhone,
              accessToken,
              intent: 'login',
            });
            console.log('Login response:', loginResponse?.data || loginResponse);
            await refreshProfile();
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
        reqId,
      );
    } catch (error) {
      setFormMessage(error.message);
    } finally {
      // handled in callbacks
    }
  };

  return (
    <Modal onClose={closeModal} className="auth-modal-shell">
      <h1 className="auth-modal-title">Login / Register</h1>
      <p className="auth-modal-subtitle">Please enter your Phone Number</p>

      <div className="auth-modal-stack">
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
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
                />
              </div>
              {phoneError ? <div className="auth-error"><span className="auth-error-dot">●</span><span>{phoneError}</span></div> : null}
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
              {loading ? 'Verifying...' : isExistingUser ? 'Verify & Login' : 'Verify'}
            </button>

            <button type="button" className="auth-secondary-btn" onClick={() => { setStep('phone'); setOtp(''); }} disabled={loading}>
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
