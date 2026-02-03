import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Cloud,
    AlertTriangle,
    TrendingUp,
    MessageSquare,
    Star,
    ArrowRight,
    Zap,
    Shield,
    Globe,
    Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
    const { t } = useLanguage();
    const { user, signOut } = useAuth();

    const features = [
        {
            icon: MessageSquare,
            title: 'AI Farming Advisor',
            description: 'Get personalized crop advice, pest management tips, and farming best practices in your language.',
            color: 'from-violet-500 to-purple-600',
        },
        {
            icon: AlertTriangle,
            title: 'Flood Risk Alerts',
            description: 'Real-time flood warnings based on rainfall data. Protect your crops before disaster strikes.',
            color: 'from-rose-500 to-red-600',
        },
        {
            icon: Cloud,
            title: 'Weather Intelligence',
            description: '5-day forecasts, rainfall predictions, and temperature data for your exact location.',
            color: 'from-sky-500 to-blue-600',
        },
        {
            icon: TrendingUp,
            title: 'Mandi Prices',
            description: 'Latest commodity prices from local markets. Know the best time to sell your produce.',
            color: 'from-emerald-500 to-green-600',
        },
    ];

    const testimonials = [
        {
            text: "AgriPulse helped me save my entire rice crop during last month's floods. The early warning gave me time to harvest!",
            author: 'Rajan Kumar',
            location: 'Thanjavur, Tamil Nadu',
        },
        {
            text: "The mandi prices feature helps me get the best rates. I've increased my income by 20% this season.",
            author: 'Priya Devi',
            location: 'Vijayawada, Andhra Pradesh',
        },
        {
            text: "Finally an app in Tamil! The AI understands my questions and gives practical advice I can use.",
            author: 'Selvam',
            location: 'Madurai, Tamil Nadu',
        },
    ];

    const benefits = [
        '4 Languages Supported',
        'Free to Use',
        'Works Offline',
        'No Technical Skills Needed',
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
                </div>

                {/* Navigation Removed - Using Global Header */}
                <div className="pt-6"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8"
                        >
                            <Zap className="w-4 h-4" />
                            <span>AI-Powered Farming Assistant</span>
                        </motion.div>

                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                            Protect Your Crops.
                            <br />
                            <span className="text-emerald-200">Farm Smarter.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
                            AgriPulse helps Indian farmers get flood alerts, weather insights, mandi prices, and AI-powered farming advice — all in your language.
                        </p>

                        {/* Benefits */}
                        <div className="flex flex-wrap justify-center gap-4 mb-10">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm">
                                    <Check className="w-4 h-4 text-emerald-300" />
                                    <span>{benefit}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                <>
                                    <Link to="/dashboard">
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="bg-emerald-500 text-white hover:bg-emerald-600 min-w-[220px] shadow-xl shadow-emerald-500/20"
                                        >
                                            Go to Dashboard
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        onClick={() => {
                                            // IMMEDIATE logout: Don't wait for API
                                            const lang = localStorage.getItem('agripulse_language');
                                            localStorage.clear();
                                            sessionStorage.clear();
                                            if (lang) {
                                                localStorage.setItem('agripulse_language', lang);
                                            }
                                            signOut().catch(e => console.error("Background signOut:", e));
                                            window.location.href = '/login';
                                        }}
                                        className="text-white border-2 border-white/30 hover:bg-white/10 min-w-[220px]"
                                    >
                                        Log Out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/signup">
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            className="bg-white text-emerald-600 hover:bg-white/90 min-w-[220px] shadow-xl shadow-black/10"
                                        >
                                            Create Free Account
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="text-white border-2 border-white/30 hover:bg-white/10 min-w-[220px]"
                                        >
                                            I already have an account
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" className="w-full">
                        <path
                            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                            fill="white"
                        />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-28 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                            Everything You Need to Farm Better
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Four powerful features designed specifically for Indian farmers
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg`}
                                    >
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 md:py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                            Get Started in 3 Simple Steps
                        </h2>
                        <p className="text-lg text-slate-600">
                            No technical knowledge required
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                title: 'Create Account',
                                description: 'Sign up with your email. Select your district and preferred language.',
                                icon: Globe,
                            },
                            {
                                step: '2',
                                title: 'View Your Dashboard',
                                description: 'See real-time weather, flood risk alerts, and local mandi prices instantly.',
                                icon: Shield,
                            },
                            {
                                step: '3',
                                title: 'Ask the AI',
                                description: 'Chat with our AI assistant in your language for personalized farming advice.',
                                icon: MessageSquare,
                            },
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className="relative text-center bg-white rounded-2xl p-8 shadow-lg"
                                >
                                    {/* Step Number */}
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                                        <span className="text-2xl font-bold text-white">{item.step}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-28 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Protect Your Farm?
                        </h2>
                        <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
                            Join thousands of farmers who are already using AgriPulse to protect their crops and increase their income.
                        </p>
                        <Link to="/signup">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="bg-white text-emerald-600 hover:bg-white/90 shadow-xl"
                            >
                                Create Free Account
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <span className="text-xl">🌾</span>
                            </div>
                            <span className="font-bold text-xl text-white">AgriPulse</span>
                        </div>
                        <p className="text-sm">
                            © 2026 AgriPulse. Built with ❤️ for Indian Farmers.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
