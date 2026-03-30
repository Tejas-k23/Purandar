import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Heart, List, Home } from 'lucide-react';
import './ProfileLayout.css';

const sidebarItems = [
    { label: 'My Profile', to: '/profile', icon: User, end: true },
    { label: 'Saved Properties', to: '/profile/saved', icon: Heart },
    { label: 'My Properties', to: '/profile/properties', icon: List },
];

export default function ProfileLayout() {
    return (
        <div className="profile-layout">
            <div className="profile-container">
                {/* Sidebar */}
                <aside className="profile-sidebar">
                    <div className="sidebar-header">
                        <div className="sidebar-avatar-container">
                            <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                alt="User"
                                className="sidebar-avatar"
                            />
                        </div>
                        <div className="sidebar-user-details">
                            <h3 className="sidebar-user-name">Jane Doe</h3>
                            <p className="sidebar-user-email">janedoe@example.com</p>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        {sidebarItems.map(({ label, to, icon: Icon, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="sidebar-footer">
                        <NavLink to="/" className="back-home-link">
                            <Home className="w-4 h-4" />
                            Back to Home
                        </NavLink>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="profile-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
