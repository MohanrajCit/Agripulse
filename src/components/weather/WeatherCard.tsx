import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Loading';
import { useLanguage } from '../../contexts/LanguageContext';

interface WeatherData {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    condition: string;
    description: string;
    feelsLike: number;
}

interface ForecastDay {
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    rainfall: number;
}

interface WeatherCardProps {
    current?: WeatherData;
    forecast?: ForecastDay[];
    location?: string;
    isLoading?: boolean;
    error?: Error | null;
}

const getWeatherIcon = (condition: string) => {
    const iconMap: Record<string, React.ReactNode> = {
        clear: <Sun className="w-12 h-12 text-amber-400" />,
        clouds: <Cloud className="w-12 h-12 text-slate-400" />,
        rain: <CloudRain className="w-12 h-12 text-blue-400" />,
        drizzle: <CloudRain className="w-12 h-12 text-blue-300" />,
    };
    return iconMap[condition.toLowerCase()] || <Cloud className="w-12 h-12 text-slate-400" />;
};

export function WeatherCard({ current, forecast, location, isLoading, error }: WeatherCardProps) {
    const { t } = useLanguage();

    if (isLoading) {
        return <WeatherCardSkeleton />;
    }

    if (error || !current) {
        return (
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent>
                    <div className="text-center py-8">
                        <Cloud className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">{t('common.error')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>{t('dashboard.weather.title')}</span>
                        {location && (
                            <span className="text-sm font-normal text-slate-500">{location}</span>
                        )}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Current Weather */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            {getWeatherIcon(current.condition)}
                            <div>
                                <div className="text-4xl font-bold text-slate-800">
                                    {Math.round(current.temperature)}°C
                                </div>
                                <div className="text-slate-500 capitalize">{current.description}</div>
                            </div>
                        </div>
                    </div>

                    {/* Weather Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-xl">
                            <Thermometer className="w-5 h-5 text-orange-500" />
                            <div>
                                <div className="text-xs text-slate-500">Feels like</div>
                                <div className="font-semibold">{Math.round(current.feelsLike)}°C</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-xl">
                            <Droplets className="w-5 h-5 text-blue-500" />
                            <div>
                                <div className="text-xs text-slate-500">{t('dashboard.weather.humidity')}</div>
                                <div className="font-semibold">{current.humidity}%</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-xl">
                            <CloudRain className="w-5 h-5 text-cyan-500" />
                            <div>
                                <div className="text-xs text-slate-500">{t('dashboard.weather.rainfall')}</div>
                                <div className="font-semibold">{current.rainfall} mm</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-white/60 rounded-xl">
                            <Wind className="w-5 h-5 text-teal-500" />
                            <div>
                                <div className="text-xs text-slate-500">{t('dashboard.weather.wind')}</div>
                                <div className="font-semibold">{current.windSpeed} km/h</div>
                            </div>
                        </div>
                    </div>

                    {/* 5-Day Forecast */}
                    {forecast && forecast.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-600 mb-3">
                                {t('dashboard.weather.forecast')}
                            </h4>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {forecast.map((day, index) => (
                                    <div
                                        key={index}
                                        className="flex-shrink-0 w-20 p-3 bg-white/60 rounded-xl text-center"
                                    >
                                        <div className="text-xs text-slate-500 mb-1">{day.dayName}</div>
                                        <div className="text-2xl mb-1">
                                            {day.condition.toLowerCase().includes('rain') ? '🌧️' :
                                                day.condition.toLowerCase().includes('cloud') ? '☁️' : '☀️'}
                                        </div>
                                        <div className="text-sm font-semibold">{Math.round(day.tempMax)}°</div>
                                        <div className="text-xs text-slate-400">{Math.round(day.tempMin)}°</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

function WeatherCardSkeleton() {
    return (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div>
                        <Skeleton className="h-10 w-24 mb-2" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
