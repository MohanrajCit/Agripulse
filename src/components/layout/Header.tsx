import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    Home,
    LayoutDashboard,
    MessageSquare,
    LogOut,
    User,
    Globe,
    Bug
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';

export function Header() {
    const { user, signOut } = useAuth();
    const { t, language, setLanguage, availableLanguages, languageNames } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    const navLinks = user
        ? [
            { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
            { to: '/chat', label: t('nav.chat'), icon: MessageSquare },
            { to: '/disease-detection', label: 'Disease Detection', icon: Bug },
        ]
        : [
            { to: '/', label: t('nav.home'), icon: Home },
        ];

    const handleSignOut = () => {
        // IMMEDIATE logout: Don't wait for API - clear storage and redirect instantly

        // 1. Preserve language preference
        const lang = localStorage.getItem('agripulse_language');

        // 2. Clear ALL storage immediately
        localStorage.clear();
        sessionStorage.clear();

        // 3. Restore language preference
        if (lang) {
            localStorage.setItem('agripulse_language', lang);
        }

        // 4. Call signOut in background (don't await - user is already redirecting)
        signOut().catch(e => console.error("Background signOut error:", e));

        // 5. Force immediate hard browser reload to /login
        window.location.href = '/login';
    };

    return (
        <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">🌾</span>
                        </div>
                        <span className="font-bold text-xl text-slate-800 hidden sm:block">
                            {t('app.name')}
                        </span>
                    </Link>

                    {/* Desktop Navigation + Actions - All grouped on the right */}
                    <div className="flex items-center gap-3">
                        {/* Nav Links */}
                        <nav className="hidden md:flex items-center gap-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = location.pathname === link.to;

                                // Define glow styles based on route
                                let glowClass = '';
                                let activeBgClass = '';
                                let activeTextClass = '';

                                if (isActive) {
                                    if (link.to === '/dashboard') {
                                        // Calm Green/Teal glow
                                        glowClass = 'shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-200';
                                        activeBgClass = 'bg-emerald-50';
                                        activeTextClass = 'text-emerald-700';
                                    } else if (link.to === '/chat') {
                                        // Blue/Purple glow
                                        glowClass = 'shadow-[0_0_20px_rgba(139,92,246,0.3)] border-purple-200';
                                        activeBgClass = 'bg-purple-50';
                                        activeTextClass = 'text-purple-700';
                                    } else if (link.to === '/disease-detection') {
                                        // Amber/Orange glow
                                        glowClass = 'shadow-[0_0_20px_rgba(245,158,11,0.3)] border-amber-200';
                                        activeBgClass = 'bg-amber-50';
                                        activeTextClass = 'text-amber-700';
                                    } else if (link.to === '/') {
                                        // Home - Teal glow
                                        glowClass = 'shadow-[0_0_20px_rgba(20,184,166,0.3)] border-teal-200';
                                        activeBgClass = 'bg-teal-50';
                                        activeTextClass = 'text-teal-700';
                                    }
                                }

                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className={`relative group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out border border-transparent ${isActive
                                            ? `${glowClass} ${activeBgClass} ${activeTextClass} scale-[1.02] -translate-y-0.5 font-semibold`
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent hover:border-slate-100'
                                            }`}
                                    >
                                        <Icon size={18} className={`pointer-events-none transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                                        <span className="pointer-events-none">{link.label}</span>

                                        {/* Active Indicator Line (Optional subtle bottom gradient) */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-current opacity-20"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Auth Buttons */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                                    <User size={18} className="text-slate-500" />
                                    <span className="text-sm text-slate-600 max-w-[120px] truncate">
                                        {user.email}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSignOut();
                                    }}
                                >
                                    <LogOut size={18} className="mr-2 pointer-events-none" />
                                    {t('nav.logout')}
                                </Button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">
                                        {t('nav.login')}
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                                    >
                                        {t('nav.signup')}
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-100"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50"
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{link.label}</span>
                                    </Link>
                                );
                            })}

                            {user ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsMenuOpen(false);
                                        handleSignOut();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full"
                                >
                                    <LogOut size={20} className="pointer-events-none" />
                                    <span className="font-medium">{t('nav.logout')}</span>
                                </button>
                            ) : (
                                <div className="pt-2 space-y-2">
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="secondary" className="w-full">
                                            {t('nav.login')}
                                        </Button>
                                    </Link>
                                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="primary" className="w-full">
                                            {t('nav.signup')}
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
