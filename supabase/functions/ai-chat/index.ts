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
        const { message, context, language } = await req.json();

        if (!message) {
            return new Response(
                JSON.stringify({ error: 'Message is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const apiKey = Deno.env.get('OPENROUTER_API_KEY');

        if (!apiKey) {
            console.log('No OPENROUTER_API_KEY found, returning mock response');
            return new Response(
                JSON.stringify(getMockResponse(message, language)),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Build system prompt with context
        const languageNames: Record<string, string> = {
            en: 'English',
            hi: 'Hindi',
            ta: 'Tamil',
            te: 'Telugu',
        };

        const systemPrompt = `You are AgriShield AI, a helpful farming assistant for Indian farmers. 
You provide advice on:
- Crop management and best practices
- Pest and disease control
- Weather-based farming decisions
- Flood protection and preparedness
- Mandi prices and selling strategies
- Sustainable farming techniques

${context ? `Current context:\n${JSON.stringify(context, null, 2)}` : ''}

IMPORTANT: Respond in ${languageNames[language] || 'English'}. 
Keep responses concise, practical, and actionable.
Use simple language that farmers can understand.
If discussing prices, use Indian Rupees (₹).`;

        // Call OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://agrishield.ai',
                'X-Title': 'AgriShield AI',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', response.status, errorText);
            return new Response(
                JSON.stringify(getMockResponse(message, language)),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'I apologize, I could not generate a response.';

        return new Response(
            JSON.stringify({
                reply,
                model: data.model || 'gemini-2.0-flash',
                usage: data.usage,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('AI Chat error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process chat', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

function getMockResponse(message: string, language?: string): { reply: string } {
    const lowerMessage = message.toLowerCase();

    const responses: Record<string, Record<string, string>> = {
        weather: {
            en: "Based on the weather forecast, I recommend monitoring rainfall levels closely. If heavy rain is expected, consider harvesting mature crops early and ensuring proper drainage in your fields.",
            hi: "मौसम के पूर्वानुमान के आधार पर, मैं वर्षा के स्तर पर नज़र रखने की सलाह देता हूं। यदि भारी बारिश की संभावना है, तो परिपक्व फसलों की जल्दी कटाई करें और अपने खेतों में उचित जल निकासी सुनिश्चित करें।",
            ta: "வானிலை முன்னறிவிப்பின் அடிப்படையில், மழை அளவை கவனமாக கண்காணிக்க பரிந்துரைக்கிறேன். கனமழை எதிர்பார்க்கப்பட்டால், முதிர்ந்த பயிர்களை முன்கூட்டியே அறுவடை செய்து உங்கள் வயல்களில் சரியான வடிகால் வசதியை உறுதிசெய்யுங்கள்.",
            te: "వాతావరణ సూచన ఆధారంగా, వర్షపాతాన్ని జాగ్రత్తగా పర్యవేక్షించమని నేను సిఫార్సు చేస్తున్నాను. భారీ వర్షం అంచనా ఉంటే, పరిణతి చెందిన పంటలను ముందుగానే కోయండి మరియు మీ పొలాల్లో సరైన డ్రైనేజీని నిర్ధారించుకోండి.",
        },
        flood: {
            en: "For flood protection: 1) Create raised beds for crops 2) Ensure drainage channels are clear 3) Store seeds and equipment on higher ground 4) Consider flood-resistant crop varieties 5) Have an emergency harvest plan ready.",
            hi: "बाढ़ सुरक्षा के लिए: 1) फसलों के लिए उठी हुई क्यारियां बनाएं 2) जल निकासी चैनल साफ रखें 3) बीज और उपकरण ऊंची जगह पर रखें 4) बाढ़-प्रतिरोधी फसल किस्मों पर विचार करें 5) आपातकालीन कटाई योजना तैयार रखें।",
            ta: "வெள்ள பாதுகாப்பிற்கு: 1) பயிர்களுக்கு உயர்த்தப்பட்ட படுக்கைகளை உருவாக்குங்கள் 2) வடிகால் தெளிவாக இருப்பதை உறுதிசெய்யுங்கள் 3) விதைகளை உயரமான இடத்தில் சேமியுங்கள் 4) வெள்ள-எதிர்ப்பு ரகங்களை பரிசீலியுங்கள் 5) அவசர அறுவடை திட்டம் தயாராக வைத்திருங்கள்.",
            te: "వరద రక్షణ కోసం: 1) పంటలకు పెంచిన మడులు సృష్టించండి 2) డ్రైనేజీ ఛానెల్లు స్పష్టంగా ఉన్నాయని నిర్ధారించుకోండి 3) విత్తనాలను ఎత్తైన ప్రదేశంలో నిల్వ చేయండి 4) వరద-నిరోధక రకాలను పరిగణించండి 5) అత్యవసర పంట ప్రణాళిక సిద్ధంగా ఉంచండి.",
        },
        price: {
            en: "Current market trends show stable prices for most crops. Rice is trading around ₹3500/quintal, Wheat at ₹2600/quintal. I recommend checking local mandi prices before selling and considering storage if prices are expected to rise.",
            hi: "वर्तमान बाजार रुझान अधिकांश फसलों के लिए स्थिर कीमतें दिखाते हैं। चावल लगभग ₹3500/क्विंटल पर कारोबार कर रहा है, गेहूं ₹2600/क्विंटल पर। मैं बेचने से पहले स्थानीय मंडी की कीमतों की जांच करने की सलाह देता हूं।",
            ta: "தற்போதைய சந்தை போக்குகள் பெரும்பாலான பயிர்களுக்கு நிலையான விலைகளைக் காட்டுகின்றன. அரிசி சுமார் ₹3500/குவிண்டால், கோதுமை ₹2600/குவிண்டால் விலையில் வர்த்தகமாகிறது. விற்பனைக்கு முன் உள்ளூர் மண்டி விலைகளை சரிபார்க்க பரிந்துரைக்கிறேன்.",
            te: "ప్రస్తుత మార్కెట్ ట్రెండ్లు చాలా పంటలకు స్థిరమైన ధరలను చూపుతున్నాయి. బియ్యం సుమారు ₹3500/క్వింటాల్, గోధుమ ₹2600/క్వింటాల్ వద్ద వర్తకం జరుగుతోంది. అమ్మడానికి ముందు స్థానిక మండి ధరలను తనిఖీ చేయమని నేను సిఫార్సు చేస్తున్నాను.",
        },
        default: {
            en: "I'm here to help with your farming questions! You can ask me about:\n• Weather and flood alerts\n• Crop management tips\n• Pest and disease control\n• Mandi prices and selling strategies\n• Sustainable farming practices",
            hi: "मैं आपके खेती संबंधी प्रश्नों में मदद करने के लिए यहां हूं! आप मुझसे पूछ सकते हैं:\n• मौसम और बाढ़ अलर्ट\n• फसल प्रबंधन सुझाव\n• कीट और रोग नियंत्रण\n• मंडी मूल्य और बिक्री रणनीतियां\n• टिकाऊ खेती प्रथाएं",
            ta: "உங்கள் விவசாய கேள்விகளுக்கு உதவ இங்கே இருக்கிறேன்! என்னிடம் கேட்கலாம்:\n• வானிலை மற்றும் வெள்ள எச்சரிக்கைகள்\n• பயிர் மேலாண்மை குறிப்புகள்\n• பூச்சி மற்றும் நோய் கட்டுப்பாடு\n• மண்டி விலைகள் மற்றும் விற்பனை உத்திகள்\n• நிலையான விவசாய நடைமுறைகள்",
            te: "మీ వ్యవసాయ ప్రశ్నలకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను! మీరు అడగవచ్చు:\n• వాతావరణం మరియు వరద హెచ్చరికలు\n• పంట నిర్వహణ చిట్కాలు\n• తెగులు మరియు వ్యాధి నియంత్రణ\n• మండి ధరలు మరియు అమ్మకపు వ్యూహాలు\n• సుస్థిర వ్యవసాయ పద్ధతులు",
        },
    };

    let category = 'default';
    if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('मौसम') || lowerMessage.includes('வானிலை')) {
        category = 'weather';
    } else if (lowerMessage.includes('flood') || lowerMessage.includes('बाढ़') || lowerMessage.includes('வெள்ளம்')) {
        category = 'flood';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('mandi') || lowerMessage.includes('कीमत') || lowerMessage.includes('விலை')) {
        category = 'price';
    }

    const lang = language || 'en';
    const reply = responses[category][lang] || responses[category]['en'];

    return { reply };
}
