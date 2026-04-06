import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!email.trim() || !password.trim()) {
      setMessage('Please enter admin email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });
      if (result?.user?.role !== 'admin') {
        await logout();
        setMessage('Admin access only.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (error) {
      setMessage(error.message || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-head">
          <span className="admin-login-icon"><ShieldCheck size={22} /></span>
          <div>
            <h1>Admin Login</h1>
            <p>Restricted access for administrators.</p>
          </div>
        </div>

        <form className="admin-login-form" onSubmit={submit}>
          <label className="admin-login-label">Email</label>
          <input
            type="email"
            className="admin-login-input"
            placeholder="admin@domain.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className="admin-login-label">Password</label>
          <input
            type="password"
            className="admin-login-input"
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit" className="admin-primary-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
          {message ? <p className="admin-login-message">{message}</p> : null}
        </form>
      </div>
    </div>
  );
}
