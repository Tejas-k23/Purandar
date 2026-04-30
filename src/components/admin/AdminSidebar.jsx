import React from 'react';
import { ShieldCheck, Mail, Bell, MessageSquare, Package, Zap, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { label: 'Enquiries', to: '/admin/enquiries', icon: Mail },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
  { label: 'Feedback', to: '/admin/feedback', icon: MessageSquare },
  { label: 'Packages', to: '/admin/packages', icon: Package },
  { label: 'Subscriptions', to: '/admin/subscriptions', icon: Zap },
  { label: 'Payment History', to: '/admin/payments', icon: Mail },
  { label: 'Pricing Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-badge"><ShieldCheck className="w-5 h-5" /></div>
        <div>
          <h2>Admin Panel</h2>
          <p>Purandar Prime Propertys ops</p>
        </div>
      </div>

      <div className="admin-sidebar-nav">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="admin-sidebar-footer">
        <NavLink to="/" className="admin-sidebar-link admin-sidebar-link--home">
          <ShieldCheck className="w-5 h-5" />
          <span>Go to Website</span>
        </NavLink>
      </div>
    </aside>
  );
}
