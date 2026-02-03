import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CloudRain, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';

interface Alert {
    id: string;
    type: 'flood' | 'weather' | 'price' | 'general';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AlertBannerProps {
    alerts: Alert[];
    onDismiss: (id: string) => void;
}

const severityConfig = {
    low: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-500',
    },
    medium: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: 'text-amber-500',
    },
    high: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        icon: 'text-orange-500',
    },
    critical: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-500',
    },
};

const typeIcons = {
    flood: AlertTriangle,
    weather: CloudRain,
    price: AlertTriangle,
    general: AlertTriangle,
};

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
    const { t } = useLanguage();

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-2 mb-4">
            <AnimatePresence>
                {alerts.map((alert) => {
                    const config = severityConfig[alert.severity];
                    const Icon = typeIcons[alert.type];

                    return (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className={cn(
                                'rounded-xl border p-4 flex items-start gap-3',
                                config.bg,
                                config.border
                            )}
                        >
                            <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.icon)} />

                            <div className="flex-1 min-w-0">
                                <h4 className={cn('font-semibold text-sm', config.text)}>
                                    {alert.title}
                                </h4>
                                <p className={cn('text-sm mt-1', config.text, 'opacity-80')}>
                                    {alert.message}
                                </p>
                            </div>

                            <button
                                onClick={() => onDismiss(alert.id)}
                                className={cn(
                                    'p-1 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0',
                                    config.text
                                )}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
