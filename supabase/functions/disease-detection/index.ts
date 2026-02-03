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
        const { imageBase64, language } = await req.json();

        if (!imageBase64) {
            return new Response(
                JSON.stringify({ error: 'Image is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const apiKey = Deno.env.get('OPENROUTER_API_KEY');

        if (!apiKey) {
            console.error('OPENROUTER_API_KEY not configured');
            return new Response(
                JSON.stringify({ error: 'Disease detection service not configured' }),
                { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const languageNames: Record<string, string> = {
            en: 'English',
            hi: 'Hindi',
            ta: 'Tamil',
            te: 'Telugu',
        };

        const systemPrompt = `You are an expert agricultural plant pathologist AI assistant. Analyze the provided crop/leaf image for signs of disease.

RESPOND ONLY IN ${languageNames[language] || 'English'}.

Analyze the image and provide your response in the following JSON format ONLY (no other text):
{
    "diseaseName": "Name of the disease or 'Healthy' if no disease detected",
    "confidence": "LOW" | "MEDIUM" | "HIGH",
    "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
    "treatment": ["treatment step 1", "treatment step 2", "treatment step 3"],
    "prevention": ["prevention tip 1", "prevention tip 2", "prevention tip 3"],
    "additionalNotes": "Any additional observations or recommendations",
    "isHealthy": true | false
}

Guidelines:
- If the image is unclear or not a plant/crop, set confidence to "LOW"
- If you cannot identify the disease, suggest general plant health tips
- Be specific about symptoms you observe
- Provide practical, farmer-friendly treatment advice
- Include organic/natural remedies when possible
- Keep advice simple and actionable`;

        // Prepare image URL
        const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://agrishield.ai',
                'X-Title': 'AgriShield AI - Disease Detection',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Please analyze this crop/leaf image for any signs of disease or health issues.'
                            },
                            {
                                type: 'image_url',
                                image_url: { url: imageUrl }
                            }
                        ]
                    },
                ],
                max_tokens: 1500,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter Vision API error:', response.status, errorText);
            return new Response(
                JSON.stringify({ error: 'Failed to analyze image', details: errorText }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Parse JSON from response
        try {
            let jsonStr = content;
            if (content.includes('```json')) {
                jsonStr = content.split('```json')[1].split('```')[0];
            } else if (content.includes('```')) {
                jsonStr = content.split('```')[1].split('```')[0];
            }

            const result = JSON.parse(jsonStr.trim());
            return new Response(
                JSON.stringify({
                    diseaseName: result.diseaseName || 'Unknown',
                    confidence: result.confidence || 'LOW',
                    symptoms: result.symptoms || [],
                    treatment: result.treatment || [],
                    prevention: result.prevention || [],
                    additionalNotes: result.additionalNotes || '',
                    isHealthy: result.isHealthy || false,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            return new Response(
                JSON.stringify({
                    diseaseName: 'Analysis Inconclusive',
                    confidence: 'LOW',
                    symptoms: ['Unable to clearly identify symptoms from the image'],
                    treatment: ['Please upload a clearer image', 'Consult a local agricultural expert'],
                    prevention: ['Regular crop monitoring', 'Maintain good drainage', 'Use disease-resistant varieties'],
                    additionalNotes: 'The image quality or content may not be suitable for accurate analysis.',
                    isHealthy: false,
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

    } catch (error) {
        console.error('Disease detection error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
