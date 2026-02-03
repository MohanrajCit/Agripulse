import { WeatherData } from './api';

export type CropType = string; // Allow free text input
export type Season = 'Kharif' | 'Rabi' | 'Zaid' | 'Unknown';
export type CropStage = 'Sowing' | 'Vegetative' | 'Flowering' | 'Maturity' | 'Harvest' | 'Preparation';

export interface DailyAction {
    type: 'SOW' | 'IRRIGATE' | 'FERTILIZE' | 'SPRAY' | 'HARVEST' | 'GENERAL' | 'ALERT';
    label: string;
    description: string;
    icon: string; // Lucide icon name
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Static Crop Configuration (for known crops)
export const CROP_DATA: Record<string, {
    seasons: Season[];
    durationDays: number;
    // We keep this for reference, but user will now manually select stage
}> = {
    'Paddy': { seasons: ['Kharif', 'Rabi'], durationDays: 120 },
    'Maize': { seasons: ['Kharif', 'Rabi'], durationDays: 100 },
    'Cotton': { seasons: ['Kharif'], durationDays: 150 },
    'Groundnut': { seasons: ['Kharif', 'Rabi'], durationDays: 110 },
    'Wheat': { seasons: ['Rabi'], durationDays: 120 },
};

export function determineSeason(month: number): Season {
    if (month >= 5 && month <= 9) return 'Kharif';      // June - Oct
    if (month >= 10 || month <= 2) return 'Rabi';      // Nov - March
    return 'Zaid';                                     // April - May
}

// NOTE: checkStageRules is now simpler as we trust the User's stage selection
export function generateDailyActions(
    weather: WeatherData,
    crop: string,
    stage: CropStage
): DailyAction[] {
    const actions: DailyAction[] = [];
    const { current } = weather;
    const isRaining = current.rainfall > 0 || current.condition.toLowerCase().includes('rain');
    const isWindy = current.windSpeed > 20;

    // Is this a known crop?
    // We can use specific rules if we had them, otherwise use Generic Rules for ALL crops
    // ensuring consistent behavior for custom inputs.

    // 1. SOWING STAGE RULES
    if (stage === 'Sowing') {
        if (isRaining && current.rainfall > 5) { // Threshold lowered for safety
            actions.push({
                type: 'ALERT',
                label: 'Postpone Sowing',
                description: `Rain detected (${current.rainfall}mm). Soil may be too wet for ${crop}.`,
                icon: 'CloudRain',
                priority: 'HIGH'
            });
        } else if (current.rainfall < 2 && !isRaining) {
            actions.push({
                type: 'SOW',
                label: 'Good for Sowing',
                description: 'Weather is clear. Good conditions to sow if soil moisture is optimal.',
                icon: 'Sprout',
                priority: 'HIGH'
            });
        }
    }

    // 2. VEGETATIVE / FLOWERING RULES (Irrigation & Fertilizer)
    if (['Vegetative', 'Flowering'].includes(stage)) {
        if (!isRaining && current.humidity < 60) {
            actions.push({
                type: 'IRRIGATE',
                label: 'Irrigate Today',
                description: 'Dry conditions detected. Ensure crop has sufficient water.',
                icon: 'Droplets',
                priority: 'MEDIUM'
            });
        } else if (isRaining || current.rainfall > 5) {
            actions.push({
                type: 'GENERAL',
                label: 'Skip Irrigation',
                description: `Rain detected. Natural moisture is sufficient for ${crop}.`,
                icon: 'CloudOff',
                priority: 'LOW'
            });
        }

        if (isWindy || isRaining) {
            actions.push({
                type: 'ALERT',
                label: 'Do Not Spray/Fertilize',
                description: 'Strong winds or rain will wash away inputs. Wait for calm weather.',
                icon: 'Wind',
                priority: 'HIGH'
            });
        } else if (stage === 'Vegetative') { // Only suggest fertilizer in vegetative usually
            actions.push({
                type: 'FERTILIZE',
                label: 'Safe to Fertilize',
                description: 'Calm weather. Good time for nutrient application if scheduled.',
                icon: 'FlaskConical',
                priority: 'MEDIUM'
            });
        }
    }

    // 3. MATURITY / HARVEST RULES
    if (stage === 'Maturity' || stage === 'Harvest') {
        if (isRaining) {
            actions.push({
                type: 'ALERT',
                label: 'Protect Crop',
                description: `Rain risk! Cover ${crop} immediately or improve field drainage.`,
                icon: 'Umbrella',
                priority: 'HIGH'
            });
        } else {
            actions.push({
                type: 'HARVEST',
                label: 'Harvest Preparation',
                description: 'Dry weather safe for harvesting or drying.',
                icon: 'Tractor',
                priority: 'HIGH'
            });
        }
    }

    // 4. GENERAL ALERTS
    if (current.temperature > 40) {
        actions.push({
            type: 'ALERT',
            label: 'Heat Stress Alert',
            description: 'Extreme heat. Mulch soil to retain moisture.',
            icon: 'ThermometerSun',
            priority: 'HIGH'
        });
    }

    if (actions.length === 0) {
        actions.push({
            type: 'GENERAL',
            label: 'Monitor Field',
            description: `Conditions are stable. Monitor ${crop} for pests.`,
            icon: 'Eye',
            priority: 'LOW'
        });
    }

    return actions;
}
