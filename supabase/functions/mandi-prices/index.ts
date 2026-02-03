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
        // Accept both 'state' (legacy) and 'location' (new) parameters
        // Also accept 'district' and 'market' for more specific filtering
        const { state, location, district, market, commodity } = await req.json();

        const apiKey = Deno.env.get('MANDI_API_KEY');

        // Determine the search location - prioritize specific params over legacy 'state'
        const searchLocation = district || market || location || state;

        if (!apiKey) {
            console.log('No MANDI_API_KEY found, returning mock data');
            return new Response(
                JSON.stringify(getMockMandiPrices(searchLocation)),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Fetch from data.gov.in API
        const baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
        const params = new URLSearchParams({
            'api-key': apiKey,
            format: 'json',
            limit: '50',
        });

        // Add filters based on the location type
        // The data.gov.in API supports: state, district, market, commodity
        if (searchLocation) {
            // First try to filter by district (most common use case for city names like Dharmapuri)
            params.append('filters[district]', searchLocation);
        }
        if (commodity) {
            params.append('filters[commodity]', commodity);
        }

        const url = `${baseUrl}?${params.toString()}`;
        console.log('Fetching mandi prices from:', url);

        const response = await fetch(url);

        if (!response.ok) {
            console.error('Mandi API error:', response.status, await response.text());
            return new Response(
                JSON.stringify(getMockMandiPrices(searchLocation)),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();

        // Process the response
        let prices = (data.records || []).map((record: any) => ({
            commodity: record.commodity || record.Commodity,
            variety: record.variety || record.Variety || 'Standard',
            market: record.market || record.Market,
            district: record.district || record.District,
            state: record.state || record.State,
            minPrice: parseFloat(record.min_price || record.Min_Price || 0),
            maxPrice: parseFloat(record.max_price || record.Max_Price || 0),
            modalPrice: parseFloat(record.modal_price || record.Modal_Price || 0),
            arrivalDate: record.arrival_date || record.Arrival_Date || new Date().toISOString().split('T')[0],
        }));

        // If no results with district filter, try market filter as fallback
        if (prices.length === 0 && searchLocation) {
            console.log('No results with district filter, trying market filter...');
            const marketParams = new URLSearchParams({
                'api-key': apiKey,
                format: 'json',
                limit: '50',
            });
            marketParams.append('filters[market]', searchLocation);
            if (commodity) {
                marketParams.append('filters[commodity]', commodity);
            }

            const marketUrl = `${baseUrl}?${marketParams.toString()}`;
            console.log('Retrying with market filter:', marketUrl);

            const marketResponse = await fetch(marketUrl);
            if (marketResponse.ok) {
                const marketData = await marketResponse.json();
                prices = (marketData.records || []).map((record: any) => ({
                    commodity: record.commodity || record.Commodity,
                    variety: record.variety || record.Variety || 'Standard',
                    market: record.market || record.Market,
                    district: record.district || record.District,
                    state: record.state || record.State,
                    minPrice: parseFloat(record.min_price || record.Min_Price || 0),
                    maxPrice: parseFloat(record.max_price || record.Max_Price || 0),
                    modalPrice: parseFloat(record.modal_price || record.Modal_Price || 0),
                    arrivalDate: record.arrival_date || record.Arrival_Date || new Date().toISOString().split('T')[0],
                }));
            }
        }

        return new Response(
            JSON.stringify({
                prices: prices.length > 0 ? prices : getMockMandiPrices(searchLocation).prices,
                lastUpdated: new Date().toISOString(),
                source: prices.length > 0 ? 'data.gov.in' : 'Mock Data',
                totalRecords: data.total || prices.length,
                searchedLocation: searchLocation,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Mandi API error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch mandi prices', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

function getMockMandiPrices(location?: string) {
    const state = location || 'Tamil Nadu';

    return {
        prices: [
            {
                commodity: 'Rice',
                variety: 'Basmati',
                market: 'Azadpur Mandi',
                state: state,
                minPrice: 3200,
                maxPrice: 3800,
                modalPrice: 3500,
                arrivalDate: new Date().toISOString().split('T')[0],
            },
            {
                commodity: 'Wheat',
                variety: 'Sharbati',
                market: 'Koyambedu Market',
                state: state,
                minPrice: 2400,
                maxPrice: 2800,
                modalPrice: 2600,
                arrivalDate: new Date().toISOString().split('T')[0],
            },
            {
                commodity: 'Onion',
                variety: 'Red',
                market: 'Lasalgaon',
                state: state,
                minPrice: 1800,
                maxPrice: 2400,
                modalPrice: 2100,
                arrivalDate: new Date().toISOString().split('T')[0],
            },
            {
                commodity: 'Tomato',
                variety: 'Hybrid',
                market: 'Madanapalle',
                state: state,
                minPrice: 2000,
                maxPrice: 3200,
                modalPrice: 2600,
                arrivalDate: new Date().toISOString().split('T')[0],
            },
            {
                commodity: 'Cotton',
                variety: 'Medium Staple',
                market: 'Rajkot',
                state: state,
                minPrice: 6500,
                maxPrice: 7200,
                modalPrice: 6850,
                arrivalDate: new Date().toISOString().split('T')[0],
            },
            {
                commodity: 'Potato',
                variety: 'Pukhraj',
                market: 'Agra',
                state: state,
                minPrice: 1200,
                maxPrice: 1600,
                modalPrice: 1400,
                arrivalDate: new Date().toISOString().split('T')[0],
            },
        ],
        lastUpdated: new Date().toISOString(),
        source: 'Mock Data',
    };
}
