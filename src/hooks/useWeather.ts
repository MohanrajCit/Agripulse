import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface WeatherData {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    condition: string;
    description: string;
    icon: string;
    feelsLike: number;
    pressure: number;
    visibility: number;
}

interface ForecastDay {
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    icon: string;
    rainfall: number;
}

interface WeatherResponse {
    current: WeatherData;
    forecast: ForecastDay[];
    location: string;
    consecutiveRainyDays: number;
}

async function fetchWeather(district: string): Promise<WeatherResponse> {
    // Call our Supabase Edge Function to fetch weather data
    const { data, error } = await supabase.functions.invoke('weather-api', {
        body: { district },
    });

    if (error) {
        throw new Error(error.message || 'Failed to fetch weather data');
    }

    return data;
}

export function useWeather(district: string | undefined) {
    return useQuery({
        queryKey: ['weather', district],
        queryFn: () => fetchWeather(district!),
        enabled: !!district,
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
        retry: 2,
    });
}

// Mock data for development/fallback
export function getMockWeatherData(): WeatherResponse {
    const today = new Date();
    const forecast: ForecastDay[] = [];

    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        forecast.push({
            date: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            tempMax: 32 + Math.floor(Math.random() * 5),
            tempMin: 24 + Math.floor(Math.random() * 3),
            condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
            icon: '01d',
            rainfall: Math.random() > 0.5 ? Math.floor(Math.random() * 50) : 0,
        });
    }

    return {
        current: {
            temperature: 30,
            humidity: 75,
            rainfall: 15,
            windSpeed: 12,
            condition: 'Clouds',
            description: 'Partly cloudy',
            icon: '02d',
            feelsLike: 33,
            pressure: 1012,
            visibility: 10,
        },
        forecast,
        location: 'Chennai, Tamil Nadu',
        consecutiveRainyDays: 2,
    };
}
