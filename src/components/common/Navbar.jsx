import React, { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Home, Building2, KeyRound, Phone, PlusCircle, User, Heart, List, LogOut, BarChart3, Shield } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import CitySearch from './CitySearch';
import useAuth from '../../hooks/useAuth';
import { syncNotificationRegistration } from '../../services/notificationService';

const navItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Buy', to: '/buy', icon: Building2 },
  { label: 'Rent', to: '/rent', icon: KeyRound },
  { label: 'Projects', to: '/projects', icon: Building2 },
  { label: 'Contact Us', to: '/contact', icon: Phone },
];

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = user?.name || 'Guest';
  const displayEmail = user?.email || 'Welcome to Purandar Prime Propertys';
  const avatarInitial = (displayName || 'G').trim().charAt(0).toUpperCase();
  const authRouteState = { backgroundLocation: location };
  const [notifyStatus, setNotifyStatus] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const doLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/');
  };

  const enableNotifications = async () => {
    setNotifyStatus('');
    try {
      const result = await syncNotificationRegistration({
        role: isAuthenticated ? (user?.role || 'user') : 'guest',
        requestPermission: true,
      });
      if (!result.ok) {
        setNotifyStatus('Notifications not enabled.');
        return;
      }
      setNotifyStatus('Notifications enabled.');
    } catch (_error) {
      setNotifyStatus('Unable to enable notifications.');
    }
  };

  const mobileTabs = [
    { label: 'Home', to: '/', icon: Home, end: true },
    { label: 'Buy', to: '/buy', icon: Building2 },
    { label: 'Add', to: '/post-property', icon: PlusCircle, action: true },
    { label: 'Rent', to: '/rent', icon: KeyRound },
    { label: isAuthenticated ? 'Profile' : 'Login', to: isAuthenticated ? '/profile' : '/login', icon: User, state: isAuthenticated ? undefined : authRouteState },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span style={{ fontFamily: "'Caveat', cursive" }} className="logo-urban">Purandar Prime</span>
            <span className="logo-premier">Propertys</span>
          </div>

          <CitySearch />

          <div className="desktop-nav">
            {navItems.map(({ label, to }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-controls">
            <NavLink to="/post-property" className="btn-sell"><PlusCircle className="w-4 h-4" />Add Property</NavLink>
            <button className="icon-button" onClick={() => navigate(isAuthenticated ? '/profile/saved' : '/login', isAuthenticated ? undefined : { state: authRouteState })} aria-label="Favorite properties">
              <Heart className="w-[22px] h-[22px]" />
            </button>
            <button className="icon-button" onClick={enableNotifications} aria-label="Enable notifications">
              <Bell className="w-[22px] h-[22px]" />
            </button>

            {!isAuthenticated ? (
              <div className="auth-actions">
                <NavLink to="/login" state={authRouteState} className="auth-btn auth-btn-secondary">Login</NavLink>
                <NavLink to="/signup" state={authRouteState} className="auth-btn auth-btn-primary">Sign Up</NavLink>
              </div>
            ) : null}

            {isAuthenticated ? (
              <div className="user-profile-wrapper" ref={profileRef}>
                <div className={`user-profile ${profileOpen ? 'active' : ''}`} onClick={() => setProfileOpen(!profileOpen)}>
                  <div className="avatar avatar-initial" aria-label={`${displayName} avatar`}>
                    {avatarInitial}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{displayName}</span>
                    <span className="user-email">{displayEmail}</span>
                  </div>
                  <ChevronDown className={`chevron-icon ${profileOpen ? 'rotate' : ''}`} />
                </div>
                {profileOpen ? (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-user-name">{displayName}</p>
                      <p className="dropdown-user-email">{displayEmail}</p>
                    </div>
                    <div className="dropdown-links">
                      <NavLink to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}><User className="w-4 h-4" />Profile</NavLink>
                      <NavLink to="/profile/saved" className="dropdown-item" onClick={() => setProfileOpen(false)}><Heart className="w-4 h-4" />Favourites</NavLink>
                      <NavLink to="/profile/properties" className="dropdown-item" onClick={() => setProfileOpen(false)}><List className="w-4 h-4" />My Properties</NavLink>
                      <NavLink to="/post-property" className="dropdown-item" onClick={() => setProfileOpen(false)}><PlusCircle className="w-4 h-4" />Add Property</NavLink>
                      <NavLink to="/profile/dashboard" className="dropdown-item" onClick={() => setProfileOpen(false)}><BarChart3 className="w-4 h-4" />Dashboard</NavLink>
                      {user?.role === 'admin' ? <NavLink to="/admin" className="dropdown-item" onClick={() => setProfileOpen(false)}><Shield className="w-4 h-4" />Admin Dashboard</NavLink> : null}
                    </div>
                    <button className="dropdown-item logout-item" onClick={doLogout}><LogOut className="w-4 h-4" />Logout</button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        {notifyStatus ? <p className="navbar-notice">{notifyStatus}</p> : null}
      </nav>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {mobileTabs.map(({ label, to, icon: Icon, end, state, action }) => (
          <NavLink key={label} to={to} state={state} end={end} className={({ isActive }) => `mobile-tab-link ${action ? 'mobile-tab-link--action' : ''} ${isActive ? 'active' : ''}`}>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
