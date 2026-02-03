import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, CloudRain, Droplets, Wind, FlaskConical, Tractor, Umbrella, AlertTriangle, Calendar, ChevronRight, Info, Check, Eye, CloudOff, ThermometerSun } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { Season, CropStage, DailyAction, determineSeason, generateDailyActions } from '../../lib/crop-calendar-logic';
import { WeatherData, getPersonalizedCropAdvisory } from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

export function CropCalendarCard({ weather, initialCrop, initialStage, onSave, onClear }: {
    weather: WeatherData | null;
    initialCrop?: string;
    initialStage?: CropStage;
    onSave: (crop: string, stage: CropStage) => void;
    onClear: () => void;
}) {
    const { t, language } = useLanguage();

    // Local state for input form
    const [inputCrop, setInputCrop] = useState('');
    const [selectedStage, setSelectedStage] = useState<CropStage | null>(null);
    const [isEditing, setIsEditing] = useState(!initialCrop);

    // Derived state for display
    const [activeCrop, setActiveCrop] = useState<string | null>(initialCrop || null);
    const [activeStage, setActiveStage] = useState<CropStage | null>(initialStage || null);

    const [season, setSeason] = useState<Season>('Unknown');
    const [actions, setActions] = useState<DailyAction[]>([]);
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    // Sync props with local state
    useEffect(() => {
        if (initialCrop && initialStage) {
            setActiveCrop(initialCrop);
            setActiveStage(initialStage);
            setInputCrop(initialCrop);
            setSelectedStage(initialStage);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    }, [initialCrop, initialStage]);

    // Calculate Logic when dependencies change
    useEffect(() => {
        if (!weather || !activeCrop || !activeStage) return;

        const currentMonth = new Date().getMonth();
        const detectedSeason = determineSeason(currentMonth);

        // Use the MANUALLY selected stage, do not auto-calculate
        const generatedActions = generateDailyActions(weather, activeCrop, activeStage);

        setSeason(detectedSeason);
        setActions(generatedActions);

        // Fetch AI Explanation
        const fetchExplanation = async () => {
            setIsLoadingAi(true);
            try {
                const result = await getPersonalizedCropAdvisory(
                    weather,
                    activeCrop,
                    activeStage,
                    detectedSeason,
                    generatedActions,
                    language
                );
                setAiExplanation(result.explanation);
            } catch (err) {
                console.error(err);
                setAiExplanation("Follow the actions listed below based on current weather.");
            } finally {
                setIsLoadingAi(false);
            }
        };

        fetchExplanation();

    }, [weather, activeCrop, activeStage, language]);

    const handleSave = () => {
        if (inputCrop && selectedStage) {
            setActiveCrop(inputCrop);
            setActiveStage(selectedStage);
            setIsEditing(false);
            onSave(inputCrop, selectedStage);
        }
    };

    const handleClear = () => {
        setInputCrop('');
        setSelectedStage(null);
        setActiveCrop(null);
        setActiveStage(null);
        setIsEditing(true);
        onClear();
    };

    const actionIcons = {
        SOW: Sprout,
        IRRIGATE: Droplets,
        FERTILIZE: FlaskConical,
        SPRAY: Wind,
        HARVEST: Tractor,
        GENERAL: Eye,
        ALERT: AlertTriangle,
    };

    const actionColors = {
        SOW: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        IRRIGATE: 'bg-blue-100 text-blue-800 border-blue-200',
        FERTILIZE: 'bg-purple-100 text-purple-800 border-purple-200',
        SPRAY: 'bg-orange-100 text-orange-800 border-orange-200',
        HARVEST: 'bg-amber-100 text-amber-800 border-amber-200',
        GENERAL: 'bg-slate-100 text-slate-800 border-slate-200',
        ALERT: 'bg-red-100 text-red-800 border-red-200',
    };

    if (!weather) return null;

    // Editing Mode / Initial Setup
    if (isEditing) {
        return (
            <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100 overflow-visible">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <Calendar className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-indigo-900">Crop Daily Planner</h3>
                        <p className="text-indigo-600/80 text-sm">Enter your crop details for today's specific advice.</p>
                    </div>

                    <div className="space-y-6">
                        {/* 1. Crop Name Input */}
                        <div>
                            <label className="block text-sm font-semibold text-indigo-900 mb-2">1. Crop Name</label>
                            <input
                                type="text"
                                value={inputCrop}
                                onChange={(e) => setInputCrop(e.target.value)}
                                placeholder="e.g. Paddy, Tomato, Cotton..."
                                className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        {/* 2. Stage Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-indigo-900 mb-2">2. Current Stage (Select one)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Sowing', 'Vegetative', 'Flowering', 'Maturity', 'Harvest', 'Preparation'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedStage(s as CropStage)}
                                        className={cn(
                                            "px-3 py-2 text-sm rounded-lg border transition-all font-medium",
                                            selectedStage === s
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                                                : "bg-white text-slate-600 border-indigo-100 hover:border-indigo-300"
                                        )}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={!inputCrop || !selectedStage}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 mt-2"
                        >
                            Generate Today's Plan
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    // View Mode (Results)
    return (
        <Card className="overflow-visible bg-white border-slate-100 shadow-xl shadow-indigo-100/50">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-t-2xl text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1 opacity-90 text-sm font-medium">
                            <Calendar className="w-4 h-4" />
                            <span>Today's Plan • {new Date().toLocaleDateString()}</span>
                        </div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 capitalize">
                            {activeCrop}
                            <Badge variant="default" className="bg-white/20 text-white border-white/20 backdrop-blur-md">
                                {activeStage}
                            </Badge>
                        </h2>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-white/80 hover:text-white text-sm font-medium underline-offset-4 hover:underline bg-white/10 px-3 py-1 rounded-lg transition-colors"
                    >
                        Edit
                    </button>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm font-medium text-white/80">
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                        <CloudRain className="w-4 h-4" /> Season: {season}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                        <Info className="w-4 h-4" /> strict today-only advisory
                    </span>
                </div>
            </div>

            <div className="p-6">
                {/* AI Explanation */}
                <div className="mb-6 bg-indigo-50 rounded-xl p-4 border border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Sprout className="w-24 h-24" />
                    </div>
                    <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        AgriPulse Advisor
                    </h4>
                    {isLoadingAi ? (
                        <div className="space-y-2">
                            <div className="h-4 w-3/4 bg-indigo-200/50 rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-indigo-200/50 rounded animate-pulse" />
                        </div>
                    ) : (
                        <p className="text-indigo-800 text-sm leading-relaxed font-medium">
                            "{aiExplanation}"
                        </p>
                    )}
                </div>

                {/* Actions List */}
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Actions for Today</h3>
                <div className="space-y-4">
                    {actions.map((action, idx) => {
                        const Icon = actionIcons[action.icon as keyof typeof actionIcons] || Info;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn(
                                    "p-4 rounded-xl border flex items-start gap-4 transition-all hover:translate-x-1",
                                    actionColors[action.type] || actionColors.GENERAL
                                )}
                            >
                                <div className="p-2 bg-white/60 rounded-lg shadow-sm">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-base mb-0.5">{action.label}</h4>
                                    <p className="text-sm opacity-90">{action.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
