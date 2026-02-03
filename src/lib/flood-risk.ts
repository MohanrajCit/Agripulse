/**
 * Flood Risk Calculation Engine
 * 
 * This module implements a rule-based flood risk assessment system
 * designed for Indian agricultural regions. The risk levels help farmers
 * make informed decisions about crop protection and farming activities.
 * 
 * RISK LEVELS:
 * - LOW: Normal conditions, safe for most farming activities
 * - MEDIUM: Caution advised, prepare for potential flooding
 * - HIGH: Significant risk, take protective measures immediately
 * 
 * CALCULATION FACTORS:
 * 1. Current rainfall amount (in mm)
 * 2. Number of consecutive rainy days
 * 3. Historical flooding patterns (future enhancement)
 */

export type FloodRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FloodRiskResult {
    level: FloodRiskLevel;
    score: number; // 0-100
    advice: string;
    color: string;
    bgColor: string;
}

/**
 * Calculate flood risk based on rainfall and weather patterns
 * 
 * Rule-based logic:
 * - LOW:    Rainfall < 50mm OR less than 2 consecutive rainy days
 * - MEDIUM: Rainfall 50-100mm AND 2-4 consecutive rainy days
 * - HIGH:   Rainfall > 100mm OR more than 4 consecutive rainy days
 * 
 * @param rainfall - Current/recent rainfall in millimeters (mm)
 * @param consecutiveRainyDays - Number of consecutive days with rain
 * @returns FloodRiskResult with level, score, advice, and colors
 */
export function calculateFloodRisk(
    rainfall: number,
    consecutiveRainyDays: number
): FloodRiskResult {
    // Calculate base score from rainfall (0-60 points)
    let rainfallScore = 0;
    if (rainfall < 20) {
        rainfallScore = 0;
    } else if (rainfall < 50) {
        rainfallScore = 15;
    } else if (rainfall < 100) {
        rainfallScore = 35;
    } else if (rainfall < 150) {
        rainfallScore = 50;
    } else {
        rainfallScore = 60;
    }

    // Calculate consecutive days score (0-40 points)
    let daysScore = 0;
    if (consecutiveRainyDays < 2) {
        daysScore = 0;
    } else if (consecutiveRainyDays < 3) {
        daysScore = 10;
    } else if (consecutiveRainyDays < 5) {
        daysScore = 25;
    } else {
        daysScore = 40;
    }

    // Total score
    const totalScore = rainfallScore + daysScore;

    // Determine risk level based on total score
    let level: FloodRiskLevel;
    let advice: string;
    let color: string;
    let bgColor: string;

    if (totalScore < 30) {
        // LOW RISK
        level = 'LOW';
        advice = 'Conditions are normal. Safe to proceed with regular farming activities.';
        color = 'text-green-700';
        bgColor = 'bg-green-100';
    } else if (totalScore < 60) {
        // MEDIUM RISK
        level = 'MEDIUM';
        advice = 'Moderate flood risk. Keep drainage clear and monitor weather updates.';
        color = 'text-amber-700';
        bgColor = 'bg-amber-100';
    } else {
        // HIGH RISK
        level = 'HIGH';
        advice = 'High flood risk! Protect crops, move equipment to higher ground, and stay safe.';
        color = 'text-red-700';
        bgColor = 'bg-red-100';
    }

    return {
        level,
        score: totalScore,
        advice,
        color,
        bgColor,
    };
}

/**
 * Get flood safety tips based on risk level
 */
export function getFloodSafetyTips(level: FloodRiskLevel): string[] {
    const tips: Record<FloodRiskLevel, string[]> = {
        LOW: [
            'Continue regular farming activities',
            'Check and maintain drainage systems',
            'Monitor weather forecasts regularly',
        ],
        MEDIUM: [
            'Clear all drainage channels',
            'Move valuable equipment to higher ground',
            'Prepare sandbags if available',
            'Keep emergency supplies ready',
            'Stay updated with local weather alerts',
        ],
        HIGH: [
            'Move livestock to safe areas immediately',
            'Do not enter flooded fields',
            'Disconnect electrical equipment',
            'Store harvested crops in elevated areas',
            'Contact local authorities if needed',
            'Avoid travel during heavy rainfall',
        ],
    };

    return tips[level];
}

/**
 * Calculate risk trend based on forecast data
 * @param forecastRainfall - Array of forecasted rainfall for next days
 * @returns 'INCREASING' | 'STABLE' | 'DECREASING'
 */
export function calculateRiskTrend(
    forecastRainfall: number[]
): 'INCREASING' | 'STABLE' | 'DECREASING' {
    if (forecastRainfall.length < 2) return 'STABLE';

    const firstHalf = forecastRainfall.slice(0, Math.floor(forecastRainfall.length / 2));
    const secondHalf = forecastRainfall.slice(Math.floor(forecastRainfall.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 10) return 'INCREASING';
    if (difference < -10) return 'DECREASING';
    return 'STABLE';
}
