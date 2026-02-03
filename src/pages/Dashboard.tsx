import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Cloud, TrendingUp, AlertTriangle, MapPin, Search, Loader2, Sparkles, X, CloudRain, Thermometer, Droplets, Wind, Shield, CheckCircle, Info } from 'lucide-react';
import { DashboardLayout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { WeatherCard } from '../components/weather/WeatherCard';
import { FloodRiskCard } from '../components/flood/FloodRiskCard';
import { MandiPriceCard } from '../components/mandi/MandiPriceCard';
import { AlertBanner } from '../components/alerts/AlertBanner';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';
import { useFloodRisk } from '../hooks/useFloodRisk';
import { fetchWeatherData, fetchMandiPrices, getHarvestAdvisory, WeatherData, MandiPrice, HarvestAdvisoryResult } from '../lib/api';
import { HarvestRecommendationCard } from '../components/dashboard/HarvestRecommendationCard';
import { CropCalendarCard } from '../components/dashboard/CropCalendarCard';
import { SmartAlerts } from '../components/dashboard/SmartAlerts';
import { CropStage } from '../lib/crop-calendar-logic';
import { generateSmartAlerts, SmartAlert } from '../lib/alerts-engine';

// Results Popup Modal Component
function ResultsPopup({
    isOpen,
    onClose,
    location,
    weatherData,
    floodRisk,
    isLoading
}: {
    isOpen: boolean;
    onClose: () => void;
    location: string;
    weatherData: WeatherData | null;
    floodRisk: any;
    isLoading: boolean;
}) {
    if (!isOpen) return null;

    const riskColors = {
        LOW: 'bg-green-500',
        MEDIUM: 'bg-amber-500',
        HIGH: 'bg-red-500',
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <div
                className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-40"
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 p-5 rounded-t-2xl">
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{location}</h2>
                                <p className="text-sm text-white/80">Live Weather & Risk Data</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <>
                            {/* Weather Summary */}
                            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-5 border border-sky-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Cloud className="w-5 h-5 text-sky-500" />
                                    Current Weather in {location}
                                </h3>

                                {weatherData?.current ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                            <Thermometer className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-slate-800">
                                                {weatherData.current.temperature}°C
                                            </div>
                                            <div className="text-xs text-slate-500">Temperature</div>
                                        </div>

                                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                            <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-slate-800">
                                                {weatherData.current.humidity}%
                                            </div>
                                            <div className="text-xs text-slate-500">Humidity</div>
                                        </div>

                                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                            <CloudRain className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-slate-800">
                                                {weatherData.current.rainfall} mm
                                            </div>
                                            <div className="text-xs text-slate-500">Rainfall</div>
                                        </div>

                                        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                            <Wind className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                                            <div className="text-2xl font-bold text-slate-800">
                                                {weatherData.current.windSpeed} km/h
                                            </div>
                                            <div className="text-xs text-slate-500">Wind</div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-center py-4">Weather data unavailable for {location}</p>
                                )}

                                {/* Condition */}
                                {weatherData?.current && (
                                    <div className="mt-4 text-center">
                                        <Badge variant="info" size="lg" className="text-base">
                                            {weatherData.current.condition} - {weatherData.current.description}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Flood Risk Summary */}
                            <div className={`rounded-xl p-5 border ${floodRisk.level === 'LOW' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100' :
                                floodRisk.level === 'MEDIUM' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100' :
                                    'bg-gradient-to-br from-red-50 to-orange-50 border-red-100'
                                }`}>
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <AlertTriangle className={`w-5 h-5 ${floodRisk.level === 'LOW' ? 'text-green-500' :
                                        floodRisk.level === 'MEDIUM' ? 'text-amber-500' : 'text-red-500'
                                        }`} />
                                    Flood Risk in {location}
                                </h3>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-600">Risk Level</span>
                                            <Badge variant={
                                                floodRisk.level === 'LOW' ? 'success' :
                                                    floodRisk.level === 'MEDIUM' ? 'warning' : 'danger'
                                            } size="lg">
                                                {floodRisk.level}
                                            </Badge>
                                        </div>
                                        <div className="h-3 bg-white rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${riskColors[floodRisk.level as keyof typeof riskColors]}`}
                                                style={{ width: `${floodRisk.score}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-800">
                                        {floodRisk.score}%
                                    </div>
                                </div>

                                <div className={`p-3 rounded-lg ${floodRisk.level === 'LOW' ? 'bg-green-100 text-green-700' :
                                    floodRisk.level === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    <p className="text-sm font-medium">{floodRisk.advice}</p>
                                </div>
                            </div>

                            {/* 5-Day Forecast */}
                            {weatherData?.forecast && weatherData.forecast.length > 0 && (
                                <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-purple-500" />
                                        5-Day Forecast for {location}
                                    </h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {weatherData.forecast.slice(0, 5).map((day, index) => (
                                            <div key={index} className="text-center p-3 bg-white rounded-xl shadow-sm">
                                                <div className="text-xs font-medium text-slate-600 mb-1">{day.dayName}</div>
                                                <div className="text-sm font-bold text-slate-800">{day.tempMax}°</div>
                                                <div className="text-xs text-slate-400">{day.tempMin}°</div>
                                                {day.rainfall > 0 && (
                                                    <div className="text-[10px] text-blue-500 mt-1">
                                                        {day.rainfall}mm
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 p-4 rounded-b-2xl border-t border-slate-200">
                    <Button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3"
                    >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Got it!
                    </Button>
                </div>
            </div>
        </>
    );
}

export function Dashboard() {
    const { t } = useLanguage();
    const { user, preferences, updatePreferences } = useAuth();

    // Global location context - sync with Chat page
    const { setLocation: setGlobalLocation } = useLocation();

    // ============================================
    // SINGLE SOURCE OF TRUTH: selectedLocation
    // This is the ONLY location state that controls all API calls
    // ============================================
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [locationInput, setLocationInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Weather state - STRICTLY tied to selectedLocation
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);
    const [weatherError, setWeatherError] = useState<string | null>(null);

    // Mandi state - STRICTLY tied to selectedLocation
    const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([]);
    const [mandiLastUpdated, setMandiLastUpdated] = useState<string>('');
    const [isLoadingMandi, setIsLoadingMandi] = useState(false);

    // Harvest Advisory State
    const [harvestAdvisory, setHarvestAdvisory] = useState<HarvestAdvisoryResult | null>(null);
    const [isLoadingAdvisory, setIsLoadingAdvisory] = useState(false);

    // Crop Calendar State (Persisted)
    const [selectedCrop, setSelectedCrop] = useState<string | undefined>(() => {
        return localStorage.getItem('selectedCrop') || undefined;
    });

    const [selectedStage, setSelectedStage] = useState<CropStage | undefined>(() => {
        return (localStorage.getItem('selectedStage') as CropStage) || undefined;
    });

    const handleCropSave = (crop: string, stage: CropStage) => {
        setSelectedCrop(crop);
        setSelectedStage(stage);
        localStorage.setItem('selectedCrop', crop);
        localStorage.setItem('selectedStage', stage);
    };

    const handleCropClear = () => {
        setSelectedCrop(undefined);
        setSelectedStage(undefined);
        localStorage.removeItem('selectedCrop');
        localStorage.removeItem('selectedStage');
    };



    // Results Popup state
    const [showResultsPopup, setShowResultsPopup] = useState(false);

    // ============================================
    // FLOOD RISK: Calculated ONLY from weatherData of selectedLocation
    // ============================================
    const floodRisk = useFloodRisk(
        weatherData?.current?.rainfall || 0,
        weatherData?.consecutiveRainyDays || 0,
        weatherData?.forecast?.map((d) => d.rainfall) || []
    );

    // Calculate Smart Alerts (Proactive) - Now safely AFTER floodRisk definition
    const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([]);

    useEffect(() => {
        if (weatherData) {
            const generatedAlerts = generateSmartAlerts(
                weatherData,
                selectedCrop || null,
                selectedStage || null,
                floodRisk.level
            );
            setSmartAlerts(generatedAlerts);
        }
    }, [weatherData, selectedCrop, selectedStage, floodRisk]);

    const handleDismissSmartAlert = (id: string) => {
        setSmartAlerts(prev => prev.filter(a => a.id !== id));
    };

    // Alerts based on flood risk for selectedLocation (for Navbar)
    const navbarAlerts = useMemo(() => {
        if (!selectedLocation || !hasSearched) return [];

        if (floodRisk.level === 'HIGH') {
            return [{
                id: 'flood-warning',
                type: 'flood' as const,
                title: `⚠️ High Flood Risk in ${selectedLocation}`,
                message: floodRisk.advice,
                severity: 'high' as const,
            }];
        } else if (floodRisk.level === 'MEDIUM') {
            return [{
                id: 'flood-caution',
                type: 'flood' as const,
                title: `🌧️ Moderate Flood Risk in ${selectedLocation}`,
                message: 'Monitor weather conditions closely.',
                severity: 'medium' as const,
            }];
        }
        return [];
    }, [floodRisk, selectedLocation, hasSearched]);

    const dismissNavbarAlert = useCallback((id: string) => {
        // Alerts are derived from state, so we'd need to track dismissed IDs
    }, []);

    // ============================================
    // WEATHER FETCH: Uses ONLY selectedLocation
    // ============================================
    const loadWeather = useCallback(async (location: string) => {
        if (!location) return null;

        setIsLoadingWeather(true);
        setWeatherError(null);

        try {
            const data = await fetchWeatherData(location);
            setWeatherData(data);
            return data;
        } catch (error) {
            console.error('Failed to fetch weather for:', location, error);
            setWeatherError(`Failed to fetch weather data for ${location}`);
            setWeatherData(null);
            return null;
        } finally {
            setIsLoadingWeather(false);
        }
    }, []);

    // ============================================
    // MANDI FETCH: Uses selectedLocation as district filter
    // NO FALLBACKS - if no data found, show message
    // ============================================
    const loadMandiPrices = useCallback(async (commodity: string, market?: string) => {
        // Use provided market, or default to selectedLocation
        const searchMarket = market || selectedLocation || undefined;

        setIsLoadingMandi(true);
        try {
            const data = await fetchMandiPrices(commodity, searchMarket);

            // Don't use fallback data - if no results, show empty
            if (data.prices.length === 0) {
                setMandiPrices([]);
                setMandiLastUpdated('');
            } else {
                setMandiPrices(data.prices);
                setMandiLastUpdated(data.lastUpdated);
            }
        } catch (error) {
            console.error('Failed to fetch mandi prices:', error);
            setMandiPrices([]);
        } finally {
            setIsLoadingMandi(false);
        }
    }, [selectedLocation]);

    // ============================================
    // SEARCH HANDLER: The ONLY way to change selectedLocation
    // ============================================
    const handleLocationSearch = useCallback(async () => {
        const trimmedInput = locationInput.trim();

        if (!trimmedInput) {
            setSearchError('Please enter a location');
            return;
        }

        setIsSearching(true);
        setSearchError('');
        setWeatherError(null);

        try {
            // 1. First validate by attempting to fetch weather
            const weatherResult = await fetchWeatherData(trimmedInput);

            if (!weatherResult || !weatherResult.current) {
                setSearchError(`Could not find weather data for "${trimmedInput}". Please try a different location.`);
                // DO NOT update selectedLocation on error
                return;
            }

            // SUCCESS: Update the single source of truth
            setSelectedLocation(trimmedInput);
            setWeatherData(weatherResult);
            setGlobalLocation(trimmedInput); // SYNC with global LocationContext for Chat page

            // 2. Fetch Mandi Data
            setIsLoadingMandi(true);
            try {
                const mandiData = await fetchMandiPrices(undefined, trimmedInput); // Fetch all for the location
                setMandiPrices(mandiData.prices);
                setMandiLastUpdated(mandiData.lastUpdated);
            } catch (err) {
                console.error('Mandi fetch error:', err);
                setMandiPrices([]); // Clear on error
            } finally {
                setIsLoadingMandi(false);
            }

            // 3. Fetch Harvest Advisory (Non-blocking but important)
            setIsLoadingAdvisory(true);
            try {
                // Use language from context
                const languageCode = preferences?.language || 'en';
                // We need to pass the *just fetched* weather data, not the state (which might not be updated yet)
                const advisory = await getHarvestAdvisory(weatherResult, languageCode);
                setHarvestAdvisory(advisory);
            } catch (err) {
                console.error('Harvest advisory error:', err);
                setHarvestAdvisory(null); // Clear on error
            } finally {
                setIsLoadingAdvisory(false);
            }

            // Only show popup on new search
            setShowResultsPopup(true);
            setHasSearched(true);

            // Clear input after successful search
            setLocationInput('');

            // Save to preferences
            try {
                await updatePreferences(trimmedInput, preferences?.language || 'en');
            } catch (e) {
                // Ignore preference save errors
            }

        } catch (error) {
            console.error('Location search failed:', error);
            setSearchError(`Failed to fetch data for "${trimmedInput}". Please try again.`);
            // DO NOT update selectedLocation on error
        } finally {
            setIsSearching(false);
        }
    }, [locationInput, updatePreferences, preferences?.language, setGlobalLocation]);

    // ============================================
    // QUICK LOCATION SELECT: Also uses search logic
    // ============================================
    const handleQuickLocation = useCallback(async (city: string) => {
        setLocationInput(city);
        setIsSearching(true);
        setSearchError('');
        setWeatherError(null);

        try {
            // 1. Fetch weather
            const weatherResult = await fetchWeatherData(city);

            if (!weatherResult || !weatherResult.current) {
                setSearchError(`Could not find weather data for "${city}".`);
                return;
            }

            // SUCCESS: Update the single source of truth
            setSelectedLocation(city);
            setWeatherData(weatherResult);
            setGlobalLocation(city); // SYNC with global LocationContext for Chat page

            // 2. Fetch Mandi Data
            setIsLoadingMandi(true);
            try {
                const mandiData = await fetchMandiPrices(undefined, city); // Fetch all for the location
                setMandiPrices(mandiData.prices);
                setMandiLastUpdated(mandiData.lastUpdated);
            } catch (err) {
                console.error('Mandi fetch error:', err);
                setMandiPrices([]); // Clear on error
            } finally {
                setIsLoadingMandi(false);
            }

            // 3. Fetch Harvest Advisory (Non-blocking but important)
            setIsLoadingAdvisory(true);
            try {
                const languageCode = preferences?.language || 'en';
                const advisory = await getHarvestAdvisory(weatherResult, languageCode);
                setHarvestAdvisory(advisory);
            } catch (err) {
                console.error('Harvest advisory error:', err);
                setHarvestAdvisory(null); // Clear on error
            } finally {
                setIsLoadingAdvisory(false);
            }

            setShowResultsPopup(true);
            setHasSearched(true);
            setLocationInput('');

        } catch (error) {
            console.error('Quick location failed:', error);
            setSearchError(`Failed to fetch data for "${city}".`);
        } finally {
            setIsSearching(false);
        }
    }, [setGlobalLocation, preferences?.language]);

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLocationSearch();
        }
    };

    // Quick actions
    const quickActions = [
        {
            icon: MessageSquare,
            label: 'AI Assistant',
            description: 'Get farming advice',
            href: '/chat',
            color: 'from-violet-500 to-purple-600',
        },
        {
            icon: Cloud,
            label: 'Weather',
            description: 'View forecast',
            href: '#weather',
            color: 'from-sky-500 to-blue-600',
        },
        {
            icon: TrendingUp,
            label: 'Mandi Prices',
            description: 'Live crop prices',
            href: '#mandi',
            color: 'from-emerald-500 to-green-600',
        },
        {
            icon: AlertTriangle,
            label: 'Flood Risk',
            description: 'Safety alerts',
            href: '#flood',
            color: 'from-amber-500 to-orange-600',
        },
    ];

    return (
        <DashboardLayout>
            {/* Results Popup */}
            {selectedLocation && (
                <ResultsPopup
                    isOpen={showResultsPopup}
                    onClose={() => setShowResultsPopup(false)}
                    location={selectedLocation}
                    weatherData={weatherData}
                    floodRisk={floodRisk}
                    isLoading={isLoadingWeather}
                />
            )}

            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
                    Welcome, {user?.email?.split('@')[0] || 'Farmer'}
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                </h1>
                <p className="text-slate-500 mt-1">
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    })}
                </p>
            </motion.div>

            {/* Location Search Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6"
            >
                <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-xl shadow-emerald-500/20">
                    <CardContent className="py-5 px-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/80">Your Location</p>
                                    <p className="text-xl font-bold">
                                        {selectedLocation || 'Not Selected'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter any city or district name..."
                                        className="w-full px-4 py-3.5 pl-12 rounded-xl bg-white text-slate-700 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                </div>
                                <Button
                                    onClick={handleLocationSearch}
                                    disabled={isSearching}
                                    className="bg-white text-emerald-600 hover:bg-white/90 px-8 shadow-lg font-semibold text-base"
                                >
                                    {isSearching ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Search'
                                    )}
                                </Button>
                            </div>
                        </div>

                        {searchError && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 text-white text-sm bg-red-500/30 px-4 py-2 rounded-lg backdrop-blur-sm"
                            >
                                ⚠️ {searchError}
                            </motion.p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-white/70 text-sm">Quick select:</span>
                            {['Chennai', 'Mumbai', 'Delhi', 'Hyderabad', 'Bangalore', 'Kolkata', 'Dharmapuri', 'Salem', 'Coimbatore'].map((city) => (
                                <button
                                    key={city}
                                    onClick={() => handleQuickLocation(city)}
                                    disabled={isSearching}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedLocation === city
                                        ? 'bg-white text-emerald-600 shadow-md'
                                        : 'bg-white/20 hover:bg-white/30 text-white'
                                        } disabled:opacity-50`}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Alerts */}
            {navbarAlerts.length > 0 && (
                <AlertBanner alerts={navbarAlerts} onDismiss={dismissNavbarAlert} />
            )}

            {/* Harvest Recommendation Card */}
            {(harvestAdvisory || isLoadingAdvisory) && (
                <div className="mb-6">
                    <HarvestRecommendationCard
                        advisory={harvestAdvisory}
                        isLoading={isLoadingAdvisory}
                    />
                </div>
            )}

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        const isLink = action.href.startsWith('/');

                        // Define glow colors for each action - ENHANCED for more visibility
                        const glowColors: Record<string, string> = {
                            'from-violet-500 to-purple-600': 'hover:shadow-[0_0_50px_rgba(139,92,246,0.7),0_0_80px_rgba(139,92,246,0.4)] active:shadow-[0_0_60px_rgba(139,92,246,0.9),0_0_100px_rgba(139,92,246,0.5)]',
                            'from-sky-500 to-blue-600': 'hover:shadow-[0_0_50px_rgba(14,165,233,0.7),0_0_80px_rgba(14,165,233,0.4)] active:shadow-[0_0_60px_rgba(14,165,233,0.9),0_0_100px_rgba(14,165,233,0.5)]',
                            'from-emerald-500 to-green-600': 'hover:shadow-[0_0_50px_rgba(16,185,129,0.7),0_0_80px_rgba(16,185,129,0.4)] active:shadow-[0_0_60px_rgba(16,185,129,0.9),0_0_100px_rgba(16,185,129,0.5)]',
                            'from-amber-500 to-orange-600': 'hover:shadow-[0_0_50px_rgba(245,158,11,0.7),0_0_80px_rgba(245,158,11,0.4)] active:shadow-[0_0_60px_rgba(245,158,11,0.9),0_0_100px_rgba(245,158,11,0.5)]',
                        };
                        const glowClass = glowColors[action.color] || 'hover:shadow-xl';

                        const content = (
                            <Card className={`hover:-translate-y-2 active:scale-95 transition-all duration-300 cursor-pointer border-0 shadow-md group ${glowClass}`}>
                                <CardContent className="py-6 text-center">
                                    <div
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 group-active:scale-125 transition-all duration-300`}
                                    >
                                        <Icon className="w-7 h-7 text-white group-hover:animate-pulse" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 block group-hover:text-slate-900 transition-colors">
                                        {action.label}
                                    </span>
                                    <span className="text-xs text-slate-400 group-hover:text-slate-500 transition-colors">
                                        {action.description}
                                    </span>
                                </CardContent>
                            </Card>
                        );

                        return isLink ? (
                            <Link key={index} to={action.href}>
                                {content}
                            </Link>
                        ) : (
                            <a key={index} href={action.href}>
                                {content}
                            </a>
                        );
                    })}
                </div>
            </motion.div>

            {/* Main Dashboard Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Weather Card */}
                <div id="weather">
                    {!hasSearched ? (
                        <Card className="bg-gradient-to-br from-sky-50 to-blue-50 border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <Cloud className="w-16 h-16 text-sky-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">Weather Data</h3>
                                <p className="text-slate-500 mb-4">Please enter your location to view weather</p>
                                <Info className="w-5 h-5 text-slate-400 mx-auto" />
                            </CardContent>
                        </Card>
                    ) : (
                        <WeatherCard
                            current={weatherData?.current}
                            forecast={weatherData?.forecast}
                            location={selectedLocation || 'Unknown'}
                            isLoading={isLoadingWeather}
                        />
                    )}
                </div>

                {/* Flood Risk Card */}
                <div id="flood">
                    {!hasSearched ? (
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
                            <CardContent className="py-12 text-center">
                                <Shield className="w-16 h-16 text-green-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">Flood Risk Status</h3>
                                <p className="text-slate-500 mb-4">Please enter your location to view flood risk</p>
                                <Info className="w-5 h-5 text-slate-400 mx-auto" />
                            </CardContent>
                        </Card>
                    ) : (
                        <FloodRiskCard
                            level={floodRisk.level}
                            score={floodRisk.score}
                            advice={floodRisk.advice}
                            tips={floodRisk.tips}
                            trend={floodRisk.trend}
                            rainfall={weatherData?.current?.rainfall || 0}
                            consecutiveRainyDays={weatherData?.consecutiveRainyDays || 0}
                            location={selectedLocation || undefined}
                        />
                    )}
                </div>

                <div id="mandi" className="lg:col-span-2">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Crop Calendar - Full Height/Featured */}
                        <div className="space-y-6">
                            {/* Proactive Smart Alerts */}
                            <SmartAlerts
                                alerts={smartAlerts}
                                onDismiss={handleDismissSmartAlert}
                                weatherUnavailable={hasSearched && !weatherData}
                            />

                            {/* Planner Card */}
                            <CropCalendarCard
                                weather={weatherData}
                                initialCrop={selectedCrop}
                                initialStage={selectedStage}
                                onSave={handleCropSave}
                                onClear={handleCropClear}
                            />
                        </div>

                        {/* Mandi Prices */}
                        <div>
                            <MandiPriceCard
                                prices={mandiPrices}
                                lastUpdated={mandiLastUpdated}
                                isLoading={isLoadingMandi}
                                onSearch={loadMandiPrices}
                                location={selectedLocation || undefined}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
