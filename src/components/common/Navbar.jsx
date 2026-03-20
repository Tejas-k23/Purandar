import React, { useState } from 'react';
import { Bell, Bookmark, ChevronDown, Home, Search, User, Phone, TrendingUp, Menu, X, PlusCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Buy / Rent', to: '/buy-rent', icon: Search },
    { label: 'Profile', to: '/profile', icon: User },
    { label: 'Contact Us', to: '/contact', icon: Phone },
    { label: 'Why Invest in Purandar', to: '/why-invest', icon: TrendingUp },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="w-full bg-white border-b border-gray-100 shrink-0 z-10 rounded-t-3xl">
            {/* Main Bar */}
            <div className="h-[72px] flex items-center justify-between px-4 lg:px-6">
                {/* Logo */}
                <div className="flex flex-col select-none cursor-pointer">
                    <span
                        style={{ fontFamily: "'Caveat', cursive" }}
                        className="text-[22px] leading-none text-indigo-600 -mb-[2px] transform -rotate-3"
                    >
                        Urban
                    </span>
                    <span className="font-bold text-gray-900 text-[20px] tracking-tight uppercase">Premier</span>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center space-x-1 text-[14px] font-medium text-gray-500">
                    {navItems.map(({ label, to }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `relative px-3 py-2 rounded-lg transition-colors ${isActive
                                    ? 'text-gray-900 font-semibold'
                                    : 'hover:text-gray-900 hover:bg-gray-50'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {label}
                                    {isActive && (
                                        <div className="absolute -bottom-[26px] left-0 right-0 h-[2px] bg-indigo-600 rounded-t-sm" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Right Controls */}
                <div className="flex items-center space-x-5 lg:space-x-6">
                    <button className="text-gray-400 hover:text-gray-700 transition-colors relative">
                        <Bell className="w-[22px] h-[22px]" />
                        <span className="absolute top-[2px] right-[2px] w-[8px] h-[8px] bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <button className="hidden sm:block text-gray-400 hover:text-gray-700 transition-colors">
                        <Bookmark className="w-[22px] h-[22px]" />
                    </button>

                    {/* Sell Property CTA */}
                    <NavLink
                        to="/sell"
                        className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[13px] font-semibold shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 active:scale-95"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Sell Property
                    </NavLink>

                    <div className="flex items-center space-x-3 cursor-pointer group pl-2 border-l border-gray-100">
                        <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full object-cover shadow-sm bg-gray-50"
                        />
                        <div className="hidden lg:flex flex-col justify-center">
                            <span className="text-[14px] font-semibold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">Jane Doe</span>
                            <span className="text-[12px] text-gray-400 leading-tight">janedoe@example.com</span>
                        </div>
                        <ChevronDown className="w-[18px] h-[18px] text-gray-400 group-hover:text-gray-600 transition-colors ml-1" />
                    </div>

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden text-gray-500 hover:text-gray-800 transition-colors"
                        onClick={() => setMobileOpen(o => !o)}
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
                    {navItems.map(({ label, to, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </NavLink>
                    ))}
                </div>
            )}
        </nav>
    );
}
