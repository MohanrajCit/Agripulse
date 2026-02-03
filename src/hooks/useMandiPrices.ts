import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface MandiPrice {
    commodity: string;
    market: string;
    district: string;
    state: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    arrivalDate: string;
    unit: string;
}

interface MandiPriceResponse {
    prices: MandiPrice[];
    lastUpdated: string;
    source: string;
}

async function fetchMandiPrices(
    district: string,
    commodity?: string
): Promise<MandiPriceResponse> {
    const { data, error } = await supabase.functions.invoke('mandi-prices', {
        body: { district, commodity },
    });

    if (error) {
        throw new Error(error.message || 'Failed to fetch mandi prices');
    }

    return data;
}

export function useMandiPrices(district: string | undefined, commodity?: string) {
    return useQuery({
        queryKey: ['mandi-prices', district, commodity],
        queryFn: () => fetchMandiPrices(district!, commodity),
        enabled: !!district,
        staleTime: 60 * 60 * 1000, // 1 hour
        retry: 2,
    });
}

// Common commodities list
export const commodities = [
    { value: 'rice', label: 'Rice (धान)', labelHi: 'धान', labelTa: 'அரிசி', labelTe: 'బియ్యం' },
    { value: 'wheat', label: 'Wheat (गेहूं)', labelHi: 'गेहूं', labelTa: 'கோதுமை', labelTe: 'గోధుమ' },
    { value: 'cotton', label: 'Cotton (कपास)', labelHi: 'कपास', labelTa: 'பருத்தி', labelTe: 'పత్తి' },
    { value: 'groundnut', label: 'Groundnut (मूंगफली)', labelHi: 'मूंगफली', labelTa: 'நிலக்கடலை', labelTe: 'వేరుశెనగ' },
    { value: 'onion', label: 'Onion (प्याज)', labelHi: 'प्याज', labelTa: 'வெங்காயம்', labelTe: 'ఉల్లిపాయ' },
    { value: 'tomato', label: 'Tomato (टमाटर)', labelHi: 'टमाटर', labelTa: 'தக்காளி', labelTe: 'టమాటా' },
    { value: 'potato', label: 'Potato (आलू)', labelHi: 'आलू', labelTa: 'உருளைக்கிழங்கு', labelTe: 'బంగాళదుంప' },
    { value: 'sugarcane', label: 'Sugarcane (गन्ना)', labelHi: 'गन्ना', labelTa: 'கரும்பு', labelTe: 'చెరకు' },
    { value: 'maize', label: 'Maize (मक्का)', labelHi: 'मक्का', labelTa: 'மக்காச்சோளம்', labelTe: 'మొక్కజొన్న' },
    { value: 'soybean', label: 'Soybean (सोयाबीन)', labelHi: 'सोयाबीन', labelTa: 'சோயாபீன்', labelTe: 'సోయాబీన్' },
];

// Mock data for development/fallback
export function getMockMandiPrices(district: string): MandiPriceResponse {
    return {
        prices: [
            {
                commodity: 'Rice',
                market: `${district} Mandi`,
                district,
                state: 'Tamil Nadu',
                minPrice: 2800,
                maxPrice: 3200,
                modalPrice: 3000,
                arrivalDate: new Date().toISOString().split('T')[0],
                unit: 'Quintal',
            },
            {
                commodity: 'Wheat',
                market: `${district} Mandi`,
                district,
                state: 'Tamil Nadu',
                minPrice: 2200,
                maxPrice: 2600,
                modalPrice: 2400,
                arrivalDate: new Date().toISOString().split('T')[0],
                unit: 'Quintal',
            },
            {
                commodity: 'Onion',
                market: `${district} Mandi`,
                district,
                state: 'Tamil Nadu',
                minPrice: 1500,
                maxPrice: 2000,
                modalPrice: 1750,
                arrivalDate: new Date().toISOString().split('T')[0],
                unit: 'Quintal',
            },
        ],
        lastUpdated: new Date().toISOString(),
        source: 'Agmarknet',
    };
}
