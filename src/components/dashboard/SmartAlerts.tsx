import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Droplets, Info, ThermometerSun, X, Leaf, Bug, Waves, Bell } from 'lucide-react';
import { SmartAlert } from '../../lib/alerts-engine';
import { cn } from '../../lib/utils';

interface SmartAlertsProps {
    alerts: SmartAlert[];
    onDismiss: (id: string) => void;
    weatherUnavailable?: boolean;
}

export function SmartAlerts({ alerts, onDismiss, weatherUnavailable }: SmartAlertsProps) {
    // Show fallback message if weather data is unavailable
    if (weatherUnavailable) {
        return (
            <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Alerts for Today
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm">
                    <Info className="w-5 h-5 inline-block mr-2 text-slate-400" />
                    Alerts unavailable due to missing weather data
                </div>
            </div>
        );
    }

    if (alerts.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'WEATHER': return ThermometerSun;
            case 'HARVEST': return Leaf;
            case 'IRRIGATE': return Droplets;
            case 'DISEASE': return Bug;
            case 'FLOOD': return Waves;
            default: return AlertTriangle;
        }
    };

    const getColors = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-50 border-red-200 text-red-800';
            case 'medium': return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'low': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    return (
        <div className="mb-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                🔔 Alerts for Today
            </h3>

            <AnimatePresence>
                {alerts.map((alert) => {
                    const Icon = getIcon(alert.type);
                    const colorClass = getColors(alert.severity);

                    return (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                                "relative overflow-hidden rounded-xl border p-4 shadow-sm",
                                colorClass
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-2 rounded-lg bg-white/40",
                                    alert.severity === 'high' && "animate-pulse"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-base">{alert.title}</h4>
                                            {alert.isGeneralAdvisory && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 font-medium">
                                                    General advisory
                                                </span>
                                            )}
                                        </div>
                                        {alert.dismissible && (
                                            <button
                                                onClick={() => onDismiss(alert.id)}
                                                className="p-1 -mt-1 -mr-1 opacity-60 hover:opacity-100 hover:bg-black/5 rounded-full transition-all"
                                                aria-label="Dismiss alert"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm opacity-90 leading-relaxed max-w-[90%] mt-1">
                                        {alert.message}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        {alert.action && (
                                            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider bg-white/40 px-2 py-1 rounded">
                                                Rec: {alert.action}
                                            </span>
                                        )}
                                        <span className="text-xs opacity-60 italic">
                                            Weather-based advisory
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
