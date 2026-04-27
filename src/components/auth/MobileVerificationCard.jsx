import React, { useCallback, useMemo, useRef, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import env from '../../config/env';
import userService from '../../services/userService';
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
import '../../pages/auth/AuthModal.css';
import './MobileVerificationCard.css';

const normalizePhoneInput = (value) => String(value || '').replace(/\D/g, '').slice(-10);
const normalizePhone = (value) => `+91${normalizePhoneInput(value)}`;
const isValidPhone = (value) => /^\d{10}$/.test(normalizePhoneInput(value));

export default function MobileVerificationCard({
  title = 'Verify your mobile number',
  description = 'Mobile verification is required before we can use your seller contact details on the platform.',
  showSkip = false,
  onSkip,
  onVerified,
}) {
  const { user, refreshProfile } = useAuth();
  const [phone, setPhone] = useState(normalizePhoneInput(user?.phone || ''));
  const [otp, setOtp] = useState('');
  const [reqId, setReqId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const verifyInFlightRef = useRef(false);

  const normalizedPhone = useMemo(() => normalizePhone(phone), [phone]);

  const completeVerification = useCallback(async (accessToken) => {
    if (verifyInFlightRef.current) return;
    verifyInFlightRef.current = true;
    setLoading(true);

    try {
      await userService.verifyMobileWithMsg91Token({
        phone: normalizedPhone,
        accessToken,
      });
      await refreshProfile();
      clearReqId(normalizedPhone);
      setReqId('');
      setOtp('');
      setOtpSent(false);
      setStatus({ type: 'success', message: 'Mobile number verified successfully.' });
      await onVerified?.();
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to verify your mobile number.' });
    } finally {
      verifyInFlightRef.current = false;
      setLoading(false);
    }
  }, [normalizedPhone, onVerified, refreshProfile]);

  const ensureWidgetReady = useCallback(async () => {
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
        if (!accessToken) {
          setStatus({ type: 'error', message: 'OTP verified but token was missing.' });
          return;
        }
        await completeVerification(accessToken);
      },
      failure: (error) => {
        const message = typeof error === 'string' ? error : (error?.message || error?.reason || 'OTP verification failed.');
        setStatus({ type: 'error', message });
      },
    });
  }, [completeVerification]);

  const sendOtp = async () => {
    setStatus({ type: '', message: '' });

    if (!isValidPhone(phone)) {
      setStatus({ type: 'error', message: 'Please enter a valid 10-digit phone number.' });
      return;
    }

    setLoading(true);
    try {
      await userService.validateMobileVerification({ phone: normalizedPhone });
      await ensureWidgetReady();

      clearReqId(normalizedPhone);
      await sendOtpWithWidget(
        buildIdentifier(normalizedPhone),
        (data) => {
          const nextReqId = extractReqId(data);
          setReqId(nextReqId);
          storeReqId(normalizedPhone, nextReqId);
          setOtpSent(true);
          setStatus({ type: 'success', message: 'OTP sent to your mobile number.' });
          setLoading(false);
        },
        (error) => {
          const message = typeof error === 'string' ? error : (error?.message || error?.reason || 'Failed to send OTP.');
          setStatus({ type: 'error', message });
          setLoading(false);
        },
      );
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to send OTP.' });
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setStatus({ type: '', message: '' });

    if (!otp.trim()) {
      setStatus({ type: 'error', message: 'Please enter the OTP.' });
      return;
    }

    const storedReqId = reqId || readReqId(normalizedPhone);
    if (!storedReqId) {
      setStatus({ type: 'error', message: 'OTP request id missing. Please resend the OTP.' });
      return;
    }

    setLoading(true);

    try {
      verifyOtpWithWidget(
        otp.trim(),
        async (data) => {
          const accessToken = extractAccessToken(data);
          if (!accessToken) {
            setStatus({ type: 'error', message: 'OTP verified but token was missing.' });
            setLoading(false);
            return;
          }
          await completeVerification(accessToken);
        },
        (error) => {
          const message = typeof error === 'string' ? error : (error?.message || error?.reason || 'Invalid or expired OTP.');
          setStatus({ type: 'error', message });
          setLoading(false);
        },
        storedReqId,
      );
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to verify OTP.' });
      setLoading(false);
    }
  };

  return (
    <section className="mobile-verify-card">
      <h3 className="mobile-verify-card__title">{title}</h3>
      <p className="mobile-verify-card__desc">{description}</p>

      <div className="mobile-verify-card__form">
        <div className="mobile-verify-card__row">
          <label className="mobile-verify-card__label" htmlFor="mobile-verify-phone">Mobile number</label>
          <input
            id="mobile-verify-phone"
            className="styled-input"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter 10-digit mobile number"
            value={phone}
            onChange={(event) => setPhone(normalizePhoneInput(event.target.value))}
            disabled={loading}
          />
        </div>

        {otpSent ? (
          <div className="mobile-verify-card__row">
            <label className="mobile-verify-card__label" htmlFor="mobile-verify-otp">OTP</label>
            <input
              id="mobile-verify-otp"
              className="styled-input"
              type="tel"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
              disabled={loading}
            />
          </div>
        ) : null}

        <div className="mobile-verify-card__actions">
          {!otpSent ? (
            <button type="button" className="auth-primary-btn" onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          ) : (
            <button type="button" className="auth-primary-btn" onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Mobile'}
            </button>
          )}

          {otpSent ? (
            <button type="button" className="auth-secondary-btn" onClick={sendOtp} disabled={loading}>
              Resend OTP
            </button>
          ) : null}

          {showSkip ? (
            <button type="button" className="auth-secondary-btn" onClick={onSkip} disabled={loading}>
              Skip for now
            </button>
          ) : null}
        </div>

        {status.message ? (
          <p className={`mobile-verify-card__status ${status.type === 'error' ? 'is-error' : 'is-success'}`}>
            {status.message}
          </p>
        ) : null}

        <p className="mobile-verify-card__hint">
          We use OTP verification to protect seller contact details and prevent misuse.
        </p>
      </div>
    </section>
  );
}
