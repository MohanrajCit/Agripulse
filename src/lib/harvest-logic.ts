import { WeatherData } from './api';

export interface HarvestRecommendation {
    status: 'DELAY' | 'CAUTION' | 'HARVEST';
    label: string;
    color: 'red' | 'amber' | 'emerald';
    details: {
        rainfall: 'none' | 'moderate' | 'heavy';
        humidity: 'low' | 'moderate' | 'high';
        temperature: 'normal' | 'extreme';
        season: string;
    };
    reason: string;
}

export function analyzeHarvestConditions(weather: WeatherData): HarvestRecommendation {
    const { current, location } = weather;

    // 1. Analyze Rainfall (Current & Recent)
    // Assumption: 'rainfall' in API response is mm in last 3h or 1h. 
    // We also look at 'condition' string for safety.
    let rainfallStatus: 'none' | 'moderate' | 'heavy' = 'none';
    const isRaining = current.condition.toLowerCase().includes('rain') ||
        current.condition.toLowerCase().includes('drizzle') ||
        current.condition.toLowerCase().includes('thunderstorm');

    if (current.rainfall > 10 || (isRaining && current.rainfall > 5)) {
        rainfallStatus = 'heavy';
    } else if (current.rainfall > 0 || isRaining) {
        rainfallStatus = 'moderate';
    }

    // 2. Analyze Humidity
    let humidityStatus: 'low' | 'moderate' | 'high' = 'moderate';
    if (current.humidity > 80) {
        humidityStatus = 'high';
    } else if (current.humidity < 40) {
        humidityStatus = 'low';
    }

    // 3. Analyze Temperature
    let tempStatus: 'normal' | 'extreme' = 'normal';
    if (current.temperature > 35 || current.temperature < 5) {
        tempStatus = 'extreme';
    }

    // 4. Determine Season (India specific)
    const month = new Date().getMonth(); // 0-11
    let season = 'Unknown';
    if (month >= 5 && month <= 9) season = 'Kharif (Monsoon)';
    else if (month >= 10 && month <= 2) season = 'Rabi (Winter)';
    else season = 'Zaid (Summer)';

    // 5. Apply Rules
    if (rainfallStatus === 'heavy') {
        return {
            status: 'DELAY',
            label: 'Do Not Harvest',
            color: 'red',
            details: { rainfall: rainfallStatus, humidity: humidityStatus, temperature: tempStatus, season },
            reason: 'Heavy rain detected. Harvesting now risks crop spoilage and fungal growth.'
        };
    }

    if (rainfallStatus === 'moderate') {
        return {
            status: 'DELAY',
            label: 'Delay Recommended',
            color: 'red',
            details: { rainfall: rainfallStatus, humidity: humidityStatus, temperature: tempStatus, season },
            reason: 'Light to moderate rain detected. Wait for dry spell to prevent moisture issues.'
        };
    }

    if (humidityStatus === 'high') {
        return {
            status: 'CAUTION',
            label: 'Harvest with Caution',
            color: 'amber',
            details: { rainfall: rainfallStatus, humidity: humidityStatus, temperature: tempStatus, season },
            reason: 'High humidity (>80%) detected. Ensure immediate drying or proper storage ventilation.'
        };
    }

    if (tempStatus === 'extreme') {
        return {
            status: 'CAUTION',
            label: 'Harvest Early Morning',
            color: 'amber',
            details: { rainfall: rainfallStatus, humidity: humidityStatus, temperature: tempStatus, season },
            reason: 'Extreme temperatures detected. Harvest during cooler hours to reduce crop stress.'
        };
    }

    // Default: Good conditions
    return {
        status: 'HARVEST',
        label: 'Good to Harvest',
        color: 'emerald',
        details: { rainfall: rainfallStatus, humidity: humidityStatus, temperature: tempStatus, season },
        reason: 'Weather conditions are dry and stable. Suitable for harvesting.'
    };
}
