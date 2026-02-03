import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { location } = await req.json();

        if (!location) {
            return new Response(
                JSON.stringify({ error: 'Location is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const apiKey = Deno.env.get('WEATHER_API_KEY');

        if (!apiKey) {
            console.log('No API key found, returning mock data');
            return new Response(
                JSON.stringify(getMockWeatherData(location)),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Fetch current weather from OpenWeatherMap
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},IN&appid=${apiKey}&units=metric`;
        const currentRes = await fetch(currentUrl);

        if (!currentRes.ok) {
            console.error('Weather API error:', await currentRes.text());
            return new Response(
                JSON.stringify(getMockWeatherData(location)),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const currentData = await currentRes.json();

        // Fetch 5-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)},IN&appid=${apiKey}&units=metric`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

        // Process current weather
        const current = {
            temperature: Math.round(currentData.main.temp),
            humidity: currentData.main.humidity,
            rainfall: currentData.rain?.['1h'] || currentData.rain?.['3h'] || 0,
            windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
            condition: currentData.weather[0].main,
            description: currentData.weather[0].description,
            icon: currentData.weather[0].icon,
            feelsLike: Math.round(currentData.main.feels_like),
            pressure: currentData.main.pressure,
            visibility: Math.round((currentData.visibility || 10000) / 1000),
        };

        // Process forecast - group by day and get daily summary
        const dailyForecast = new Map();
        let consecutiveRainyDays = 0;
        let currentStreak = 0;

        for (const item of forecastData.list || []) {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split('T')[0];

            if (!dailyForecast.has(dateKey)) {
                dailyForecast.set(dateKey, {
                    date: dateKey,
                    dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    temps: [],
                    conditions: [],
                    icons: [],
                    rainfall: 0,
                });
            }

            const day = dailyForecast.get(dateKey);
            day.temps.push(item.main.temp);
            day.conditions.push(item.weather[0].main);
            day.icons.push(item.weather[0].icon);
            day.rainfall += (item.rain?.['3h'] || 0);
        }

        // Convert to forecast array
        const forecast = Array.from(dailyForecast.values())
            .slice(0, 5)
            .map(day => {
                const hasRain = day.rainfall > 0 || day.conditions.includes('Rain');
                if (hasRain) {
                    currentStreak++;
                    consecutiveRainyDays = Math.max(consecutiveRainyDays, currentStreak);
                } else {
                    currentStreak = 0;
                }

                return {
                    date: day.date,
                    dayName: day.dayName,
                    tempMax: Math.round(Math.max(...day.temps)),
                    tempMin: Math.round(Math.min(...day.temps)),
                    condition: getMostFrequent(day.conditions),
                    icon: day.icons[Math.floor(day.icons.length / 2)],
                    rainfall: Math.round(day.rainfall),
                };
            });

        const response = {
            current,
            forecast,
            location: `${currentData.name}, India`,
            consecutiveRainyDays,
        };

        return new Response(
            JSON.stringify(response),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Weather API error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch weather data', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

function getMostFrequent(arr: string[]): string {
    const count = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Clear';
}

function getMockWeatherData(location: string) {
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
            rainfall: Math.random() > 0.5 ? Math.floor(Math.random() * 30) : 0,
        });
    }

    return {
        current: {
            temperature: 30,
            humidity: 75,
            rainfall: Math.floor(Math.random() * 20),
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
        consecutiveRainyDays: Math.floor(Math.random() * 4),
    };
}
