import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Signup() {
    const { signUp, signOut } = useAuth();
    const { availableLanguages, language, setLanguage, languageNames } = useLanguage();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const { error: signUpError } = await signUp(
                formData.email,
                formData.password,
                'chennai', // Default district, user will set on dashboard
                localStorage.getItem('agripulse_language') || 'en' // Use selected language
            );

            if (signUpError) {
                setError(signUpError.message);
            } else {
                // STRICT AUTH: No auto-login.
                // 1. Force Supabase Logout
                await signOut();

                // 2. NUCLEAR: Manually clear storage to prevent any auto-restore race conditions
                // We keep language preference if possible
                const lang = localStorage.getItem('agripulse_language');
                localStorage.clear();
                if (lang) localStorage.setItem('agripulse_language', lang);

                // Navigate to login with success message
                navigate('/login', {
                    state: {
                        message: 'Account created successfully! Please sign in to continue.'
                    }
                });
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4 py-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                <div className="flex-1"></div> {/* Spacer */}

                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Home</span>
                    </Link>

                    <div className="flex gap-2">
                        {availableLanguages.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${language === lang
                                    ? 'bg-white text-emerald-600 shadow-lg'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {languageNames[lang]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10 mt-12"
            >

                <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
                    <CardHeader className="text-center pb-2">
                        {/* Logo */}
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30"
                        >
                            <span className="text-4xl">🌾</span>
                        </motion.div>
                        <CardTitle className="text-2xl font-bold text-slate-800">Create Account</CardTitle>
                        <p className="text-slate-500 mt-2">Join AgriPulse and farm smarter</p>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2"
                                >
                                    <span className="text-red-500">⚠️</span>
                                    {error}
                                </motion.div>
                            )}

                            <Input
                                type="email"
                                name="email"
                                label="Email Address"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                icon={<Mail className="w-5 h-5" />}
                                required
                            />

                            <Input
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="At least 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                icon={<Lock className="w-5 h-5" />}
                                required
                            />

                            <Input
                                type="password"
                                name="confirmPassword"
                                label="Confirm Password"
                                placeholder="Re-enter your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                icon={<Lock className="w-5 h-5" />}
                                required
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-3.5 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating account...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <UserPlus className="w-5 h-5" />
                                        Create Account
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-slate-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-white/60 text-sm mt-6">
                    🔒 Your data is secure with us
                </p>
            </motion.div>
        </div>
    );
}
