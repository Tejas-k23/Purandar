import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Heart, Home, List, Mail, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import './ProfileLayout.css';

const sidebarItems = [
  { label: 'My Profile', to: '/profile', icon: User, end: true },
  { label: 'Saved Properties', to: '/profile/saved', icon: Heart },
  { label: 'My Properties', to: '/profile/properties', icon: List },
  { label: 'My Enquiries', to: '/profile/enquiries', icon: Mail },
  { label: 'Dashboard', to: '/profile/dashboard', icon: BarChart3 },
];

export default function ProfileLayout() {
  const { user, profile } = useAuth();
  const displayName = user?.name || profile?.name || 'User';
  const displayEmail = user?.email || profile?.email || '';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="profile-layout">
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-avatar-container">
              <div className="sidebar-avatar" aria-label={`${displayName} avatar`}>
                {avatarInitial}
              </div>
            </div>
            <div className="sidebar-user-details">
              <h3 className="sidebar-user-name">{displayName}</h3>
              <p className="sidebar-user-email">{displayEmail}</p>
            </div>
          </div>
          <nav className="sidebar-nav">
            {sidebarItems.map(({ label, to, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <NavLink to="/" className="back-home-link"><Home className="w-4 h-4" />Back to Home</NavLink>
          </div>
        </aside>
        <main className="profile-content"><Outlet /></main>
      </div>
    </div>
  );
}

