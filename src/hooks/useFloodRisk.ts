import { useMemo } from 'react';
import {
    calculateFloodRisk,
    getFloodSafetyTips,
    calculateRiskTrend,
    FloodRiskResult
} from '../lib/flood-risk';

interface UseFloodRiskResult extends FloodRiskResult {
    tips: string[];
    trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

/**
 * Hook to calculate flood risk based on weather data
 * 
 * @param rainfall - Current rainfall in mm
 * @param consecutiveRainyDays - Number of consecutive rainy days
 * @param forecastRainfall - Optional array of forecasted rainfall for trend calculation
 */
export function useFloodRisk(
    rainfall: number,
    consecutiveRainyDays: number,
    forecastRainfall: number[] = []
): UseFloodRiskResult {
    return useMemo(() => {
        const riskResult = calculateFloodRisk(rainfall, consecutiveRainyDays);
        const tips = getFloodSafetyTips(riskResult.level);
        const trend = calculateRiskTrend(forecastRainfall);

        return {
            ...riskResult,
            tips,
            trend,
        };
    }, [rainfall, consecutiveRainyDays, forecastRainfall]);
}
