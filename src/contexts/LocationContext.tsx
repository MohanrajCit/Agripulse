import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { fetchWeatherData, WeatherData } from '../lib/api';

// Flood risk calculation (matching Dashboard logic)
function calculateFloodRisk(rainfall: number, consecutiveRainyDays: number, forecastRainfall: number[]) {
    let score = 0;

    // Current rainfall contribution
    if (rainfall > 50) score += 40;
    else if (rainfall > 30) score += 25;
    else if (rainfall > 10) score += 10;

    // Consecutive rainy days contribution
    score += Math.min(consecutiveRainyDays * 8, 30);

    // Forecast contribution
    const totalForecastRain = forecastRainfall.reduce((sum, r) => sum + r, 0);
    if (totalForecastRain > 100) score += 30;
    else if (totalForecastRain > 50) score += 20;
    else if (totalForecastRain > 20) score += 10;

    score = Math.min(score, 100);

    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (score >= 60) level = 'HIGH';
    else if (score >= 30) level = 'MEDIUM';

    return { level, score };
}

interface LocationContextType {
    selectedLocation: string | null;
    weatherData: WeatherData | null;
    floodRisk: { level: 'LOW' | 'MEDIUM' | 'HIGH'; score: number };
    isLoading: boolean;
    error: string | null;
    setLocation: (location: string) => Promise<boolean>;
    clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [floodRisk, setFloodRisk] = useState<{ level: 'LOW' | 'MEDIUM' | 'HIGH'; score: number }>({ level: 'LOW', score: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setLocation = useCallback(async (location: string): Promise<boolean> => {
        if (!location.trim()) {
            setError('Please enter a valid location');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const weather = await fetchWeatherData(location.trim());

            if (!weather || !weather.current) {
                setError(`Could not find weather data for "${location}"`);
                return false;
            }

            // Calculate flood risk from weather data
            const risk = calculateFloodRisk(
                weather.current.rainfall || 0,
                weather.consecutiveRainyDays || 0,
                weather.forecast?.map(d => d.rainfall) || []
            );

            setSelectedLocation(location.trim());
            setWeatherData(weather);
            setFloodRisk(risk);
            setError(null);
            return true;

        } catch (err) {
            console.error('Failed to fetch location data:', err);
            setError(`Failed to fetch data for "${location}"`);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearLocation = useCallback(() => {
        setSelectedLocation(null);
        setWeatherData(null);
        setFloodRisk({ level: 'LOW', score: 0 });
        setError(null);
    }, []);

    return (
        <LocationContext.Provider value={{
            selectedLocation,
            weatherData,
            floodRisk,
            isLoading,
            error,
            setLocation,
            clearLocation,
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
