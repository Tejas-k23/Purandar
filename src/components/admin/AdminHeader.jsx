import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export default function AdminHeader({ title, subtitle = '', actions = null }) {
  const { user } = useAuth();
  const displayName = user?.name || 'Admin';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className="admin-header">
      <div className="admin-header-copy">
        <p className="admin-header-eyebrow">Control Center</p>
        <h1 className="admin-header-title">{title}</h1>
        {subtitle ? <p className="admin-header-subtitle">{subtitle}</p> : null}
      </div>

      <div className="admin-header-right">
        <Link to="/" className="admin-secondary-btn admin-secondary-btn-inline" style={{ background: 'white' }}>
          <Eye size={16} /> Visit Site
        </Link>
        {actions ? <div className="admin-header-actions">{actions}</div> : null}
        <div className="admin-profile-chip">
          <div className="admin-profile-avatar">{avatarInitial}</div>
          <div>
            <div className="admin-profile-name">{displayName}</div>
            <div className="admin-profile-email">{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
