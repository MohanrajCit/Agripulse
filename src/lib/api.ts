// API service using Supabase Edge Functions for secure API calls
// API keys are stored securely on the server side

import { analyzeHarvestConditions, HarvestRecommendation } from './harvest-logic';
import { CropType, Season, CropStage, DailyAction } from './crop-calendar-logic';

// Supabase Edge Function base URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper function to call Edge Functions
async function callEdgeFunction(functionName: string, body: object): Promise<Response> {
    return fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(body),
    });
}

export interface WeatherData {
    current: {
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
    };
    forecast: Array<{
        date: string;
        dayName: string;
        tempMax: number;
        tempMin: number;
        condition: string;
        icon: string;
        rainfall: number;
    }>;
    location: string;
    consecutiveRainyDays: number;
}

export interface MandiPrice {
    commodity: string;
    variety?: string;
    market: string;
    state?: string;
    minPrice: number;
    maxPrice: number;
    modalPrice: number;
    arrivalDate?: string;
}

// Fetch weather data via Supabase Edge Function (secure)
export async function fetchWeatherData(location: string): Promise<WeatherData> {
    try {
        const response = await callEdgeFunction('weather-api', { location });

        if (!response.ok) {
            console.error('Weather API error:', response.status);
            return getMockWeatherData(location);
        }

        const data = await response.json();
        return data as WeatherData;

    } catch (error) {
        console.error('Weather fetch error:', error);
        return getMockWeatherData(location);
    }
}

// Fetch mandi prices via Supabase Edge Function (secure)
export async function fetchMandiPrices(commodity?: string, market?: string): Promise<{ prices: MandiPrice[], lastUpdated: string }> {
    try {
        const response = await callEdgeFunction('mandi-prices', {
            district: market,  // Send location as district filter (city names like Dharmapuri)
            commodity
        });

        if (!response.ok) {
            console.error('Mandi API error:', response.status);
            return getMockMandiPrices(market);
        }

        const data = await response.json();
        return {
            prices: data.prices || [],
            lastUpdated: data.lastUpdated || new Date().toISOString(),
        };

    } catch (error) {
        console.error('Mandi fetch error:', error);
        return { prices: [], lastUpdated: '' };
    }
}

// Send message to AI via Supabase Edge Function (secure)
export async function sendAIMessage(message: string, context?: any, language?: string): Promise<{ reply: string }> {
    try {
        const response = await callEdgeFunction('ai-chat', {
            message,
            context,
            language,
        });

        if (!response.ok) {
            console.error('AI Chat API error:', response.status);
            return getMockAIResponse(message, language);
        }

        const data = await response.json();
        return { reply: data.reply || 'I apologize, I could not generate a response.' };

    } catch (error) {
        console.error('AI chat error:', error);
        return getMockAIResponse(message, language);
    }
}

// ============================================
// CROP DISEASE DETECTION - Vision API
// ============================================

export interface DiseaseDetectionResult {
    diseaseName: string;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    symptoms: string[];
    treatment: string[];
    prevention: string[];
    additionalNotes: string;
    isHealthy: boolean;
}

export async function analyzeCropDisease(
    imageBase64: string,
    language: string = 'en'
): Promise<DiseaseDetectionResult> {
    try {
        const response = await callEdgeFunction('disease-detection', {
            imageBase64,
            language,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Disease detection API error:', errorData);
            throw new Error(errorData.error || 'Failed to analyze image');
        }

        const result = await response.json();
        return {
            diseaseName: result.diseaseName || 'Unknown',
            confidence: result.confidence || 'LOW',
            symptoms: result.symptoms || [],
            treatment: result.treatment || [],
            prevention: result.prevention || [],
            additionalNotes: result.additionalNotes || '',
            isHealthy: result.isHealthy || false,
        };
    } catch (error) {
        console.error('Disease detection error:', error);
        throw error;
    }
}


// Generate voice from text via Supabase Edge Function (secure)
export async function generateVoice(text: string): Promise<string | null> {
    if (!text || text.trim().length < 3) {
        console.warn('Text too short for voice generation');
        return null;
    }

    console.log('Generating voice for text (first 50 chars):', text.slice(0, 50) + '...');

    try {
        const response = await callEdgeFunction('text-to-speech', { text });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('TTS Edge Function error:', response.status, errorData.error || 'Unknown error');
            return null;
        }

        // Check content type
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);

        const blob = await response.blob();
        console.log('Received audio blob, size:', blob.size, 'bytes');

        if (blob.size === 0) {
            console.error('Received empty audio blob');
            return null;
        }

        // Create blob URL with explicit type
        const audioBlob = new Blob([blob], { type: 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(audioBlob);
        console.log('Created audio URL:', blobUrl);

        return blobUrl;
    } catch (error) {
        console.error('Voice generation error:', error);
        return null;
    }
}

// ============================================
// HARVEST ADVISORY - Rule-based + AI
// ============================================

export interface HarvestAdvisoryResult extends HarvestRecommendation {
    aiAdvice: {
        bestCrops: string[];
        reasoning: string;
        precautions: string[];
    };
}

export async function getHarvestAdvisory(
    weather: WeatherData,
    language: string = 'en'
): Promise<HarvestAdvisoryResult> {
    // 1. Run rule-based logic first
    const recommendation = analyzeHarvestConditions(weather);

    const languageNames: Record<string, string> = {
        en: 'English',
        hi: 'Hindi',
        ta: 'Tamil',
        te: 'Telugu',
    };

    // 2. Enhance with AI via Edge Function
    try {
        const message = `Provide harvest advice in JSON format:
Weather: ${weather.current.condition}, Temp: ${weather.current.temperature}°C, Humidity: ${weather.current.humidity}%, Rain: ${weather.current.rainfall}mm.
Season: ${recommendation.details.season}.
Status: ${recommendation.status}, Reason: ${recommendation.reason}.

Respond ONLY in JSON: {"bestCrops": ["Crop1", "Crop2"], "reasoning": "Brief explanation in ${languageNames[language]}", "precautions": ["Tip1", "Tip2"]}`;

        const response = await callEdgeFunction('ai-chat', {
            message,
            language,
            context: { type: 'harvest_advisory', weather: weather.current }
        });

        if (!response.ok) throw new Error('AI API failed');

        const data = await response.json();
        const content = data.reply || '{}';

        // Try to parse JSON from response
        try {
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const aiResult = JSON.parse(jsonMatch[0]);
                return {
                    ...recommendation,
                    aiAdvice: {
                        bestCrops: aiResult.bestCrops || [],
                        reasoning: aiResult.reasoning || recommendation.reason,
                        precautions: aiResult.precautions || []
                    }
                };
            }
        } catch {
            // Parsing failed, use AI response as reasoning
            return {
                ...recommendation,
                aiAdvice: {
                    bestCrops: ['Rice', 'Wheat', 'Pulses'],
                    reasoning: content,
                    precautions: ['Monitor moisture levels', 'Keep storage ready']
                }
            };
        }
    } catch (error) {
        console.error('Harvest advisory error:', error);
    }

    // Fallback to rule-based only
    return {
        ...recommendation,
        aiAdvice: {
            bestCrops: ['Consult local expert'],
            reasoning: recommendation.reason,
            precautions: ['Check local weather alerts']
        }
    };
}

// Helper functions
function getMostFrequent(arr: string[]): string {
    const count = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Clear';
}

function getMockWeatherData(location: string): WeatherData {
    const today = new Date();
    const forecast = [];

    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        forecast.push({
            date: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            tempMax: 32 + Math.floor(Math.random() * 5),
            tempMin: 24 + Math.floor(Math.random() * 3),
            condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
            icon: '02d',
            rainfall: Math.random() > 0.6 ? Math.floor(Math.random() * 20) : 0,
        });
    }

    return {
        current: {
            temperature: 30,
            humidity: 75,
            rainfall: Math.floor(Math.random() * 15),
            windSpeed: 12,
            condition: 'Clouds',
            description: 'Partly cloudy',
            icon: '02d',
            feelsLike: 33,
            pressure: 1012,
            visibility: 10,
        },
        forecast,
        location: `${location}, India`,
        consecutiveRainyDays: Math.floor(Math.random() * 3),
    };
}

function getMockMandiPrices(location?: string): { prices: MandiPrice[], lastUpdated: string } {
    return {
        prices: [
            { commodity: 'Rice', variety: 'Ponni', market: 'Koyambedu', state: 'Tamil Nadu', minPrice: 3200, maxPrice: 3800, modalPrice: 3500 },
            { commodity: 'Wheat', variety: 'Sharbati', market: 'Azadpur', state: 'Delhi', minPrice: 2400, maxPrice: 2800, modalPrice: 2600 },
            { commodity: 'Onion', variety: 'Nasik Red', market: 'Lasalgaon', state: 'Maharashtra', minPrice: 1800, maxPrice: 2400, modalPrice: 2100 },
            { commodity: 'Tomato', variety: 'Hybrid', market: 'Madanapalle', state: 'Andhra Pradesh', minPrice: 2000, maxPrice: 3200, modalPrice: 2600 },
            { commodity: 'Cotton', variety: 'Medium Staple', market: 'Rajkot', state: 'Gujarat', minPrice: 6500, maxPrice: 7200, modalPrice: 6850 },
        ],
        lastUpdated: new Date().toISOString(),
    };
}

// Mock AI Response Helper
function getMockAIResponse(message: string, language?: string): { reply: string } {
    const responses: Record<string, string> = {
        en: "I'm AgriPulse, your farming assistant! I can help you with weather forecasts, flood protection tips, crop management advice, and mandi prices. What would you like to know about farming today?",
        hi: "मैं AgriPulse हूं, आपका कृषि सहायक! मैं मौसम पूर्वानुमान, बाढ़ सुरक्षा सुझाव, फसल प्रबंधन सलाह और मंडी मूल्यों में आपकी मदद कर सकता हूं। आज खेती के बारे में क्या जानना चाहेंगे?",
        ta: "நான் AgriPulse, உங்கள் விவசாய உதவியாளர்! வானிலை முன்னறிவிப்பு, வெள்ள பாதுகாப்பு குறிப்புகள், பயிர் மேலாண்மை ஆலோசனை மற்றும் மண்டி விலைகளில் நான் உங்களுக்கு உதவ முடியும்.",
        te: "నేను AgriPulse, మీ వ్యవసాయ సహాయకుడిని! వాతావరణ సూచన, వరద రక్షణ చిట్కాలు, పంట నిర్వహణ సలహా మరియు మండి ధరలలో నేను మీకు సహాయం చేయగలను.",
    };
    return { reply: responses[language || 'en'] || responses.en };
}

// ============================================
// CROP CALENDAR ADVISORY - AI Explanation
// ============================================

export async function getPersonalizedCropAdvisory(
    weather: WeatherData,
    crop: string,
    stage: string,
    season: string,
    actions: any[],
    language: string = 'en'
): Promise<{ explanation: string }> {
    const languageNames: Record<string, string> = {
        en: 'English',
        hi: 'Hindi',
        ta: 'Tamil',
        te: 'Telugu',
    };

    try {
        const message = `Provide a 1-2 sentence daily farming advice for TODAY ONLY.
Context: Crop: ${crop}, Stage: ${stage}, Season: ${season}
Weather: ${weather.current.condition}, Temp: ${weather.current.temperature}°C, Rain: ${weather.current.rainfall}mm.
Actions: ${actions.map(a => a.label).join(', ')}.
Respond in ${languageNames[language]}. Do not mention future days.`;

        const response = await callEdgeFunction('ai-chat', {
            message,
            language,
            context: { type: 'crop_advisory', crop, stage, weather: weather.current }
        });

        if (!response.ok) throw new Error('AI API failed');

        const data = await response.json();
        return { explanation: data.reply?.trim() || 'Based on current weather, follow the recommended actions below.' };

    } catch (error) {
        console.error('Crop advisory error:', error);
        return { explanation: 'Based on current weather, follow the recommended actions below.' };
    }
}
