import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Info, TrendingUp, TrendingDown, Minus, MapPin, CloudRain, Droplets } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import type { FloodRiskLevel } from '../../lib/flood-risk';

interface FloodRiskCardProps {
    level: FloodRiskLevel;
    score: number;
    advice: string;
    tips: string[];
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
    rainfall: number;
    consecutiveRainyDays: number;
    location?: string;
}

const riskConfig = {
    LOW: {
        icon: Shield,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        badgeVariant: 'success' as const,
        gradient: 'from-green-50 to-emerald-50',
        barColor: 'bg-green-500',
    },
    MEDIUM: {
        icon: Info,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        badgeVariant: 'warning' as const,
        gradient: 'from-amber-50 to-yellow-50',
        barColor: 'bg-amber-500',
    },
    HIGH: {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        badgeVariant: 'danger' as const,
        gradient: 'from-red-50 to-orange-50',
        barColor: 'bg-red-500',
    },
};

const trendConfig = {
    INCREASING: { icon: TrendingUp, text: 'Rising', color: 'text-red-500' },
    STABLE: { icon: Minus, text: 'Stable', color: 'text-slate-500' },
    DECREASING: { icon: TrendingDown, text: 'Falling', color: 'text-green-500' },
};

export function FloodRiskCard({
    level,
    score,
    advice,
    tips,
    trend,
    rainfall,
    consecutiveRainyDays,
    location,
}: FloodRiskCardProps) {
    const { t } = useLanguage();
    const config = riskConfig[level];
    const trendInfo = trendConfig[trend];
    const Icon = config.icon;
    const TrendIcon = trendInfo.icon;

    const levelText = {
        LOW: t('dashboard.flood.low'),
        MEDIUM: t('dashboard.flood.medium'),
        HIGH: t('dashboard.flood.high'),
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <Card className={`bg-gradient-to-br ${config.gradient} border-0 shadow-lg`}>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center shadow-md`}>
                                <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div>
                                <span className="text-slate-800">{t('dashboard.flood.title')}</span>
                                {location && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3" />
                                        {location}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Badge variant={config.badgeVariant} size="lg" className="shadow-sm">
                            <Icon className="w-4 h-4 mr-1" />
                            {levelText[level]}
                        </Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Risk Score Meter */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-slate-600 mb-2">
                            <span className="font-medium">Risk Score</span>
                            <span className={`flex items-center gap-1 ${trendInfo.color}`}>
                                <TrendIcon className="w-4 h-4" />
                                <span>{trendInfo.text}</span>
                            </span>
                        </div>
                        <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={`h-full rounded-full ${config.barColor} relative`}
                            >
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white font-bold">
                                    {score}%
                                </span>
                            </motion.div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>Safe</span>
                            <span>Moderate</span>
                            <span>Critical</span>
                        </div>
                    </div>

                    {/* Current Weather Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="p-4 bg-white/70 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <CloudRain className="w-4 h-4 text-blue-500" />
                                <span>Current Rainfall</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                                {rainfall} <span className="text-sm font-normal text-slate-400">mm</span>
                            </div>
                        </div>
                        <div className="p-4 bg-white/70 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <Droplets className="w-4 h-4 text-cyan-500" />
                                <span>Consecutive Rain</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                                {consecutiveRainyDays} <span className="text-sm font-normal text-slate-400">days</span>
                            </div>
                        </div>
                    </div>

                    {/* Alert/Advice Box */}
                    <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor} mb-4`}>
                        <div className="flex items-start gap-3">
                            <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                            <p className={`text-sm ${config.color} font-medium`}>{advice}</p>
                        </div>
                    </div>

                    {/* Safety Tips */}
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            {t('dashboard.flood.tips')}
                        </h4>
                        <ul className="space-y-2">
                            {tips.slice(0, 3).map((tip, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 text-sm text-slate-600 bg-white/50 p-3 rounded-lg"
                                >
                                    <span className={`w-6 h-6 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0 text-xs font-bold ${config.color}`}>
                                        {index + 1}
                                    </span>
                                    <span className="leading-relaxed">{tip}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
