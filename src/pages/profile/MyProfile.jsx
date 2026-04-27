import React, { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, User2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MobileVerificationCard from '../../components/auth/MobileVerificationCard';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import './MyProfile.css';

export default function MyProfile() {
  const { user, profile, refreshProfile, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', bio: '', avatar: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const verificationNext = location.state?.next || '';

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile]);

  if (!profile) return <Loader label="Loading profile..." />;

  const displayName = form.name || user?.name || 'User';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U';

  const save = async () => {
    setLoading(true);
    try {
      await updateProfile(form);
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-hero-card">
        <div className="profile-hero-main">
          <div className="profile-hero-avatar">{avatarInitial}</div>
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Keep your seller details polished and ready for serious buyers.</p>
            <div className="profile-contact-pills">
              <span className="profile-contact-pill"><User2 className="w-4 h-4" /> {displayName}</span>
              <span className="profile-contact-pill"><Mail className="w-4 h-4" /> {form.email || 'No email added'}</span>
              <span className="profile-contact-pill"><Phone className="w-4 h-4" /> {form.phone || 'No phone added'} {user?.isMobileVerified ? '- Verified' : '- Not verified'}</span>
              <span className="profile-contact-pill"><MapPin className="w-4 h-4" /> {form.location || 'Location not set'}</span>
            </div>
          </div>
        </div>

        <div className="profile-header-actions">
          <Link to="/post-property" className="profile-cta profile-cta-secondary">Post New Property</Link>
          <button className={`profile-cta ${isEditing ? 'profile-cta-primary' : 'profile-cta-secondary'}`} onClick={isEditing ? save : () => setIsEditing(true)}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="profile-form-card">
        {!user?.isMobileVerified ? (
          <div style={{ marginBottom: 24 }}>
            <MobileVerificationCard
              title="Verify your seller mobile number"
              description="Google Sign-In works without a phone number, but seller contact features require OTP-verified mobile details."
              onVerified={async () => {
                setMessage('Mobile number verified successfully.');
              }}
            />
            {verificationNext ? (
              <p className="profile-form-message" style={{ marginTop: 16 }}>
                Complete mobile verification to continue to your seller workflow.
              </p>
            ) : null}
          </div>
        ) : null}

        {user?.isMobileVerified && verificationNext ? (
          <div style={{ marginBottom: 24 }}>
            <button
              type="button"
              className="profile-cta profile-cta-primary"
              onClick={() => navigate(verificationNext)}
            >
              Continue to your seller workflow
            </button>
          </div>
        ) : null}

        <div className="form-grid">
          <div className="form-group"><label>Full Name</label><input className="styled-input" disabled={!isEditing} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label>Email Address</label><input className="styled-input" disabled value={form.email} /></div>
          <div className="form-group"><label>Phone Number</label><input className="styled-input" disabled value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="form-group"><label>Location</label><input className="styled-input" disabled={!isEditing} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="form-group full-width"><label>Avatar URL</label><input className="styled-input" disabled={!isEditing} value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} /></div>
          <div className="form-group full-width"><label>Bio</label><textarea className="styled-textarea" rows={4} disabled={!isEditing} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
        </div>
        {message ? <p className="profile-form-message">{message}</p> : null}
      </div>
    </div>
  );
}

