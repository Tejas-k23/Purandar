import React from 'react';
import { BarChart3, CheckSquare, FileText, Mail, PlusSquare, ShieldCheck, Building2, FolderKanban, Home } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { label: 'Dashboard', to: '/admin', icon: BarChart3 },
  { label: 'Properties', to: '/admin/properties', icon: Home },
  { label: 'Add Property', to: '/admin/properties/form', icon: PlusSquare },
  { label: 'Projects', to: '/admin/projects', icon: FolderKanban },
  { label: 'Add Project', to: '/admin/add-project', icon: Building2 },
  { label: 'Enquiries', to: '/admin/enquiries', icon: Mail },
  { label: 'Blogs', to: '/admin/blogs', icon: FileText },
  { label: 'Property Approval', to: '/admin/properties/pending', icon: CheckSquare },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-badge"><ShieldCheck className="w-5 h-5" /></div>
        <div>
          <h2>Admin Panel</h2>
          <p>Purandar Estate ops</p>
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
    </aside>
  );
}
