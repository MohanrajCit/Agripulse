import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Globe, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';

// Language configuration with native names
const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', greeting: 'Welcome' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', greeting: 'வணக்கம்' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', greeting: 'नमस्ते' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', greeting: 'నమస్కారం' },
];

export function LanguageSelection() {
    const { setLanguage, language } = useLanguage();
    const navigate = useNavigate();
    const [selected, setSelected] = React.useState<string>(language || 'en');

    const handleContinue = () => {
        // Force cast to valid language type since we limit options
        setLanguage(selected as any); // This context method updates 'agripulse_language' in localStorage
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Choose Language</h1>
                    <p className="text-emerald-50">Select your preferred language to continue</p>
                </div>

                {/* Language Grid */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => setSelected(lang.code)}
                                className={`relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 group ${selected === lang.code
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${selected === lang.code
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                                    }`}>
                                    {lang.native[0]}
                                </div>
                                <div className="ml-4 text-left flex-1">
                                    <div className={`font-bold ${selected === lang.code ? 'text-emerald-900' : 'text-slate-700'}`}>
                                        {lang.native}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {lang.name}
                                    </div>
                                </div>
                                {selected === lang.code && (
                                    <div className="absolute right-4 text-emerald-500">
                                        <Check className="w-6 h-6" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Continue Button */}
                    <motion.div
                        className="pt-4"
                        initial={false}
                        animate={{ opacity: 1 }}
                    >
                        <Button
                            onClick={handleContinue}
                            className="w-full py-4 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                        >
                            <span>Continue</span>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            <p className="mt-8 text-slate-400 text-sm">
                AgriPulse • Farming Assistant
            </p>
        </div>
    );
}
