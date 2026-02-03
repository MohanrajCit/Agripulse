import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionHook {
    isListening: boolean;
    transcript: string;
    error: string | null;
    isSupported: boolean;
    startListening: (language?: string) => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    // Store recognition instance ref
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check browser support
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            setIsSupported(true);
        }
    }, []);

    const startListening = useCallback((language: string = 'en-US') => {
        if (!isSupported) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        try {
            // Initialize recognition
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();

            const recognition = recognitionRef.current;
            recognition.continuous = false; // Stop after one sentence/phrase for better UX in chat
            recognition.interimResults = true;
            recognition.lang = language;

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognition.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const speechResult = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        setTranscript(prev => prev ? `${prev} ${speechResult}` : speechResult);
                    } else {
                        currentTranscript += speechResult;
                    }
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setError(`Error: ${event.error}`);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setError('Failed to start microphone. Please check permissions.');
            setIsListening(false);
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        error,
        isSupported,
        startListening,
        stopListening,
        resetTranscript
    };
}
