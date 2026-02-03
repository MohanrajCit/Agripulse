import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { languageFullNames } from '../i18n';

interface UseTextToSpeechResult {
    speak: (text: string) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    audioUrl: string | null;
}

/**
 * Hook for text-to-speech functionality using ElevenLabs API
 * Falls back to browser speech synthesis if API fails
 */
export function useTextToSpeech(): UseTextToSpeechResult {
    const { language } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const speak = useCallback(async (text: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Try ElevenLabs API via Edge Function
            const { data, error: apiError } = await supabase.functions.invoke('text-to-speech', {
                body: {
                    text,
                    language: languageFullNames[language as keyof typeof languageFullNames] || 'English',
                },
            });

            if (apiError) {
                throw new Error(apiError.message);
            }

            if (data?.audioUrl) {
                setAudioUrl(data.audioUrl);

                // Play the audio
                const audio = new Audio(data.audioUrl);
                await audio.play();
            }
        } catch (err) {
            console.error('TTS API failed, falling back to browser speech:', err);
            setError(err as Error);

            // Fallback to browser speech synthesis
            fallbackSpeak(text, language);
        } finally {
            setIsLoading(false);
        }
    }, [language]);

    return {
        speak,
        isLoading,
        error,
        audioUrl,
    };
}

/**
 * Fallback speech synthesis using browser API
 */
function fallbackSpeak(text: string, language: string) {
    if (!('speechSynthesis' in window)) {
        console.warn('Browser does not support speech synthesis');
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Map language codes to BCP 47 language tags
    const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
    };

    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to find a voice for the language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((voice) => voice.lang.startsWith(language));
    if (matchingVoice) {
        utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
}
