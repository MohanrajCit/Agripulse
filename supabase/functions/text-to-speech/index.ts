import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

        if (!ELEVENLABS_API_KEY) {
            console.error('ELEVENLABS_API_KEY not configured');
            return new Response(
                JSON.stringify({ error: 'Voice service not configured' }),
                { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Text is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Clean and validate text
        const cleanedText = text
            .replace(/[*_~`#]/g, '') // Remove markdown characters
            .replace(/\n+/g, ' ')    // Replace newlines with spaces
            .replace(/\s+/g, ' ')    // Normalize whitespace
            .trim()
            .slice(0, 500);          // Limit length for safety/latency

        if (cleanedText.length < 3) {
            return new Response(
                JSON.stringify({ error: 'Text too short after cleaning' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log('Generating voice for text (first 50 chars):', cleanedText.slice(0, 50) + '...');

        // Voice ID for "Rachel" - reliable standard voice
        const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
        const MODEL_ID = 'eleven_multilingual_v2'; // Supports English, Hindi, Tamil, Telugu

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'audio/mpeg',
            },
            body: JSON.stringify({
                text: cleanedText,
                model_id: MODEL_ID,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', response.status, errorText);

            // Handle specific error codes
            if (response.status === 401) {
                return new Response(
                    JSON.stringify({ error: 'Voice service authentication failed' }),
                    { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            } else if (response.status === 429) {
                return new Response(
                    JSON.stringify({ error: 'Voice service rate limit exceeded. Please try again later.' }),
                    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            return new Response(
                JSON.stringify({ error: 'Voice generation failed' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get the audio data
        const audioBuffer = await response.arrayBuffer();
        console.log('Generated audio, size:', audioBuffer.byteLength, 'bytes');

        if (audioBuffer.byteLength === 0) {
            return new Response(
                JSON.stringify({ error: 'Empty audio response' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Return the audio as binary response
        return new Response(audioBuffer, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });

    } catch (error) {
        console.error('TTS function error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
