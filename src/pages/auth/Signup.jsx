import React, { useMemo, useState } from 'react';
import { ChevronDown, Info, Lock, Phone, XCircle } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import { startMsg91Otp } from '../../utils/msg91Otp';
import './AuthModal.css';

const isValidPhone = (value) => /^\d{10}$/.test(value.trim());

export default function Signup() {
  const { refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState('owner');
  const [fullName, setFullName] = useState('');
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') || '');
  const [agreed, setAgreed] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [formError, setFormError] = useState('');
  const [otpToken, setOtpToken] = useState(location.state?.otpToken || '');
  const [loading, setLoading] = useState(false);
  const phone = searchParams.get('phone') || '';
  const hasLockedPhone = isValidPhone(phone);
  const backgroundLocation = location.state?.backgroundLocation;
  const closeTarget = useMemo(() => '/', []);
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

  const changeNumber = () => {
    navigate(`/login?phone=${phone}`, {
      replace: true,
      state: { backgroundLocation: backgroundLocation || closeTarget },
    });
  };

  const continueWithPhone = async () => {
    setPhoneError('');
    setFormError('');

    if (!isValidPhone(phoneInput)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = phoneInput.trim();
      const response = await userService.checkPhone({ phone: normalizedPhone });
      const exists = response.data?.data?.exists;
      const nextToken = await startMsg91Otp({ identifier: normalizedPhone });
      setOtpToken(nextToken);

      if (exists) {
        navigate(`/login?phone=${normalizedPhone}`, {
          replace: true,
          state: { backgroundLocation: backgroundLocation || closeTarget, otpToken: nextToken },
        });
        return;
      }

      navigate(`/signup?phone=${normalizedPhone}`, {
        replace: true,
        state: { backgroundLocation: backgroundLocation || closeTarget, otpToken: nextToken },
      });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
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

    if (!agreed) {
      setTermsError('This is required for creating an account');
      return;
    }

    setLoading(true);
    try {
      const nextToken = otpToken || await startMsg91Otp({ identifier: phone });

      await userService.registerWithPhone({
        name: fullName.trim(),
        phone,
        role: role === 'broker' ? 'agent' : 'user',
        otpToken: nextToken,
      });

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
                onChange={(event) => setPhoneInput(event.target.value.replace(/\D/g, ''))}
              />
            </div>
            {phoneError ? <div className="auth-error"><span className="auth-error-dot">●</span><span>{phoneError}</span></div> : null}
          </div>

          <button type="button" className="auth-primary-btn" onClick={continueWithPhone} disabled={loading}>
            {loading ? 'Please wait...' : 'Continue'}
          </button>

          {formError ? <div className="auth-info"><Phone size={16} /><span>{formError}</span></div> : null}
        </div>
      ) : (
        <form className="auth-modal-stack" onSubmit={submit}>
          <div className="auth-role-toggle" role="tablist" aria-label="Select account type">
            <button type="button" className={`auth-role-option ${role === 'owner' ? 'active' : ''}`} onClick={() => setRole('owner')}>
              Owner
            </button>
            <button type="button" className={`auth-role-option ${role === 'broker' ? 'active' : ''}`} onClick={() => setRole('broker')}>
              Broker
            </button>
          </div>

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
            {nameError ? <div className="auth-error"><span className="auth-error-dot">●</span><span>{nameError}</span></div> : null}
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

          {formError ? <div className="auth-error"><span className="auth-error-dot">●</span><span>{formError}</span></div> : null}

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}
    </Modal>
  );
}
