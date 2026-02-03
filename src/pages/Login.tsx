import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Login() {
    const { t, availableLanguages, language, setLanguage, languageNames } = useLanguage();
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for message from navigation state (e.g. after signup)
    const successMessage = location.state?.message;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Add a timeout to prevent indefinite loading - increased to 15 seconds for slower networks
            const timeoutPromise = new Promise<{ error: Error }>((resolve) =>
                setTimeout(() => resolve({ error: new Error('Sign-in timed out. Please check your internet connection and try again.') }), 15000)
            );

            const signInPromise = signIn(email, password);

            // Race between signIn and timeout
            const result = await Promise.race([signInPromise, timeoutPromise]);

            if (result.error) {
                setError(result.error.message);
                setIsLoading(false);
            } else {
                // Navigate immediately - don't wait for auth state
                window.location.href = '/dashboard';
            }
        } catch (err: any) {
            setError(err?.message || 'An unexpected error occurred');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-end items-center z-20">
                {/* Logo/Brand (Optional, currently just empty space on left to push nav right if using justify-between, 
                    but let's group them on the right as requested 'bring near') 
                    Actually, let's keep them 'near' each other. 
                */}
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
                        <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back!</CardTitle>
                        <p className="text-slate-500 mt-2">Sign in to your AgriPulse account</p>
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

                            {successMessage && !error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-start gap-2"
                                >
                                    <span className="text-emerald-500">✅</span>
                                    {successMessage}
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <Input
                                    type="email"
                                    label="Email Address"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon={<Mail className="w-5 h-5" />}
                                    required
                                />

                                <Input
                                    type="password"
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon={<Lock className="w-5 h-5" />}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-3.5 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        Sign In
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-slate-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                                >
                                    Create one now
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
