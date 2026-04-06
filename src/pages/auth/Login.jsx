import React, { useMemo, useState } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import { startMsg91Otp } from '../../utils/msg91Otp';
import './AuthModal.css';

const isValidPhone = (value) => /^\d{10}$/.test(value.trim());

export default function Login() {
  const { login, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
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
      const normalizedPhone = phone.trim();
      const response = await userService.checkPhone({ phone: normalizedPhone });
      const exists = response.data?.data?.exists;
      const otpToken = await startMsg91Otp({ identifier: normalizedPhone });

      if (exists) {
        await userService.loginWithPhone({ phone: normalizedPhone, otpToken });
        await refreshProfile();
        navigate(closeTarget, { replace: true });
        return;
      }

      navigate(`/signup?phone=${normalizedPhone}`, {
        replace: true,
        state: {
          backgroundLocation: backgroundLocation || closeTarget,
          otpToken,
        },
      });
    } catch (error) {
      setFormMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={closeModal} className="auth-modal-shell">
      <h1 className="auth-modal-title">Login / Register</h1>
      <p className="auth-modal-subtitle">Please enter your Phone Number</p>

      <div className="auth-modal-stack">
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
          {loading ? 'Please wait...' : 'Continue'}
        </button>

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
