import { WeatherData } from './api';
import { CropStage } from './crop-calendar-logic';

export type AlertType = 'WEATHER' | 'HARVEST' | 'IRRIGATE' | 'DISEASE' | 'FLOOD' | 'GENERAL';
export type AlertSeverity = 'high' | 'medium' | 'low' | 'info';

export interface SmartAlert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    action?: string;
    dismissible: boolean;
    isGeneralAdvisory?: boolean;
}

/**
 * Smart Alert Engine - Rule-Based Alert Generation
 * 
 * Generates TODAY-ONLY alerts based on:
 * - Current weather data (temperature, humidity, rainfall)
 * - User-selected crop and confirmed growth stage
 * - Flood risk level (calculated from weather)
 * 
 * ALERT RULES:
 * 1. 🌧️ Weather/Fertilizer Alert - Rain or high humidity
 * 2. 🧺 Harvest Alert - Maturity stage + dry weather
 * 3. 🚿 Irrigation Alert - No rain + moderate/high temp
 * 4. 🧪 Disease Watch Alert - Flowering stage + high humidity
 * 5. 🌊 Flood Risk Alert - Medium/High flood risk
 */
export function generateSmartAlerts(
    weather: WeatherData | null,
    crop: string | null,
    stage: CropStage | null,
    floodRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    // If no weather data, return empty array (caller should show fallback)
    if (!weather) return [];

    const { current } = weather;

    // Weather condition flags
    const isRaining = current.rainfall > 0 || current.condition.toLowerCase().includes('rain');
    const isHighHumidity = current.humidity > 75;
    const isVeryHighHumidity = current.humidity > 80;
    const isDryAndStable = !isRaining && current.humidity < 65 && current.condition !== 'Thunderstorm';
    const isModerateOrHighTemp = current.temperature >= 28;

    // Track if we have crop stage for context
    const hasCropStage = crop && stage;

    // ============================================
    // RULE 1: 🌧️ WEATHER / FERTILIZER ALERT
    // Trigger: Rainfall today OR high humidity
    // ============================================
    if (isRaining || isHighHumidity) {
        alerts.push({
            id: 'weather-fertilizer',
            type: 'WEATHER',
            severity: 'medium', // Yellow
            title: '🟡 Avoid fertilizer today',
            message: 'Reason: Rain or high humidity may reduce fertilizer effectiveness',
            action: 'Postpone Application',
            dismissible: true,
            isGeneralAdvisory: !hasCropStage
        });
    }

    // ============================================
    // RULE 2: 🧺 HARVEST ALERT
    // Trigger: Crop stage = Maturity AND dry/stable weather
    // ============================================
    if (hasCropStage && (stage === 'Maturity' || stage === 'Harvest') && isDryAndStable) {
        alerts.push({
            id: 'harvest-window',
            type: 'HARVEST',
            severity: 'low', // Green
            title: '🟢 Good harvest window today',
            message: 'Reason: Dry weather reduces spoilage risk',
            action: 'Plan Harvest',
            dismissible: true
        });
    }

    // ============================================
    // RULE 3: 🚿 IRRIGATION ALERT
    // Trigger: No rainfall AND temperature moderate/high
    // ============================================
    if (!isRaining && isModerateOrHighTemp) {
        alerts.push({
            id: 'irrigation-needed',
            type: 'IRRIGATE',
            severity: 'info', // Yellow
            title: '🟡 Light irrigation recommended today',
            message: 'Reason: Soil moisture may be low due to heat and no rain',
            action: 'Irrigate',
            dismissible: true,
            isGeneralAdvisory: !hasCropStage
        });
    }

    // ============================================
    // RULE 4: 🧪 DISEASE WATCH ALERT
    // Trigger: Crop stage = Flowering AND humidity > 80%
    // ============================================
    if (hasCropStage && stage === 'Flowering' && isVeryHighHumidity) {
        alerts.push({
            id: 'disease-watch',
            type: 'DISEASE',
            severity: 'high', // Red
            title: '🔴 Disease watch today',
            message: 'Reason: High humidity increases fungal disease risk',
            action: 'Inspect Leaves',
            dismissible: true
        });
    }

    // ============================================
    // RULE 5: 🌊 FLOOD RISK ALERT
    // Trigger: Flood risk = MEDIUM or HIGH
    // ============================================
    if (floodRiskLevel === 'HIGH') {
        alerts.push({
            id: 'flood-critical',
            type: 'FLOOD',
            severity: 'high', // Red
            title: '🔴 Flood risk detected',
            message: 'Reason: Avoid harvesting or fertilizer application today',
            action: 'Protect Crops',
            dismissible: false
        });
    } else if (floodRiskLevel === 'MEDIUM') {
        alerts.push({
            id: 'flood-caution',
            type: 'FLOOD',
            severity: 'medium', // Yellow
            title: '🟡 Moderate flood risk',
            message: 'Reason: Monitor conditions and keep drainage clear',
            action: 'Check Drainage',
            dismissible: true
        });
    }

    // ============================================
    // If no crop stage is set, mark remaining alerts as general
    // ============================================
    if (!hasCropStage) {
        alerts.forEach(alert => {
            if (alert.type !== 'FLOOD') {
                alert.isGeneralAdvisory = true;
            }
        });
    }

    // Maximum 4 alerts per day to avoid clutter
    return alerts.slice(0, 4);
}
