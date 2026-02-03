import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, AlertTriangle, Droplets, ThermometerSun, Info, CheckCircle2, XCircle } from 'lucide-react';
import { HarvestAdvisoryResult } from '../../lib/api';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface HarvestRecommendationCardProps {
    advisory: HarvestAdvisoryResult | null;
    isLoading: boolean;
}

export function HarvestRecommendationCard({ advisory, isLoading }: HarvestRecommendationCardProps) {
    if (!advisory && !isLoading) return null;

    // Define themes based on status
    const statusThemes = {
        HARVEST: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-900',
            subtext: 'text-emerald-700',
            icon: CheckCircle2,
            iconColor: 'text-emerald-600',
            glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
            gradient: 'from-emerald-50 to-white'
        },
        CAUTION: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-900',
            subtext: 'text-amber-700',
            icon: AlertTriangle,
            iconColor: 'text-amber-600',
            glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
            gradient: 'from-amber-50 to-white'
        },
        DELAY: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-900',
            subtext: 'text-red-700',
            icon: XCircle,
            iconColor: 'text-red-600',
            glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
            gradient: 'from-red-50 to-white'
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6 border-slate-100 shadow-sm animate-pulse bg-white/50 backdrop-blur-sm">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
            </Card>
        );
    }

    if (!advisory) return null;

    const theme = statusThemes[advisory.status];
    const StatusIcon = theme.icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-full"
        >
            <div className={cn(
                "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300",
                theme.bg,
                theme.border,
                theme.glow
            )}>
                {/* Background Gradient */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", theme.gradient)} />

                {/* Content */}
                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                    {/* Left: Status & Main Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn("p-2 rounded-xl bg-white shadow-sm", theme.iconColor)}>
                                <StatusIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={cn("text-lg font-bold flex items-center gap-2", theme.text)}>
                                    {advisory.label}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    Weather-based advisory • {advisory.details.season}
                                </p>
                            </div>
                        </div>

                        {/* Reasoning */}
                        <div className="mb-6">
                            <p className={cn("text-base leading-relaxed", theme.subtext)}>
                                {advisory.aiAdvice.reasoning}
                            </p>
                        </div>

                        {/* Weather factors badges */}
                        <div className="flex flex-wrap gap-2">
                            {advisory.details.rainfall !== 'none' && (
                                <div className="px-3 py-1 bg-white/60 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-1 border border-blue-100">
                                    <Droplets className="w-3 h-3" />
                                    Rain: {advisory.details.rainfall}
                                </div>
                            )}
                            {advisory.details.humidity === 'high' && (
                                <div className="px-3 py-1 bg-white/60 rounded-full text-xs font-semibold text-orange-700 flex items-center gap-1 border border-orange-100">
                                    <Droplets className="w-3 h-3" />
                                    High Humidity
                                </div>
                            )}
                            {advisory.details.temperature === 'extreme' && (
                                <div className="px-3 py-1 bg-white/60 rounded-full text-xs font-semibold text-red-700 flex items-center gap-1 border border-red-100">
                                    <ThermometerSun className="w-3 h-3" />
                                    Extreme Heat
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Recommendations */}
                    <div className="flex-1 md:border-l md:pl-6 border-slate-200/50 flex flex-col gap-4 justify-center">

                        {/* Best Crops */}
                        {advisory.status === 'HARVEST' && advisory.aiAdvice.bestCrops.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <Sprout className="w-4 h-4 text-emerald-600" />
                                    Best to Harvest Now
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {advisory.aiAdvice.bestCrops.map((crop, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white shadow-sm border border-emerald-100 rounded-lg text-sm font-medium text-emerald-800">
                                            {crop}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Precautions */}
                        {advisory.aiAdvice.precautions.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-amber-600" />
                                    Precautions
                                </h4>
                                <ul className="space-y-1">
                                    {advisory.aiAdvice.precautions.map((item, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
