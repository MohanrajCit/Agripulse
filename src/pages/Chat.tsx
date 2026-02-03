import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Bot, Send, Loader2, Volume2, User, Sparkles, MapPin, AlertTriangle, Mic, Square } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';
import { sendAIMessage, generateVoice } from '../lib/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { cn } from '../lib/utils';

interface Message {
    id: string;
    message: string;
    role: 'user' | 'assistant';
    created_at: string;
}

export function Chat() {
    const { t, language } = useLanguage();

    // Use global location context - NO HARDCODED FALLBACKS
    const { selectedLocation, weatherData, floodRisk } = useLocation();

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Voice Input State
    const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported: isSpeechSupported } = useSpeechRecognition();

    // Voice Output State
    const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
    const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Build context for AI - STRICTLY from LocationContext
    const chatContext = useMemo(() => {
        if (!selectedLocation) return null;

        return {
            district: selectedLocation,
            weather: weatherData?.current ? {
                temperature: weatherData.current.temperature,
                humidity: weatherData.current.humidity,
                rainfall: weatherData.current.rainfall,
                condition: weatherData.current.condition,
                description: weatherData.current.description,
            } : null,
            floodRisk: floodRisk.level,
            floodRiskScore: floodRisk.score,
        };
    }, [selectedLocation, weatherData, floodRisk]);

    // Handle transcript updates (Voice Input)
    useEffect(() => {
        if (transcript) {
            setInput(prev => {
                // Determine if we need to append with space
                const shouldSpace = prev.length > 0 && !prev.endsWith(' ');
                return prev + (shouldSpace ? ' ' : '') + transcript;
            });
            resetTranscript();
        }
    }, [transcript, resetTranscript]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Send message - BLOCK if no location
    const handleSendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || isTyping) return;

        // STRICT: Do not call AI without location
        if (!selectedLocation || !chatContext) {
            const errorMessage: Message = {
                id: Date.now().toString(),
                message: 'Please select your location on the Dashboard first to get accurate farming advice for your area.',
                role: 'assistant',
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
            return;
        }

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            message: messageText,
            role: 'user',
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            // Call AI API with STRICT location context
            const response = await sendAIMessage(messageText, chatContext, language);

            // Add AI response
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                message: response.reply,
                role: 'assistant',
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                message: 'Sorry, I encountered an error. Please try again.',
                role: 'assistant',
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    }, [isTyping, chatContext, language, selectedLocation]);

    // Handle Voice Playback
    const handlePlayVoice = async (messageId: string, text: string) => {
        // Stop currently playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Toggle off if clicking active
        if (activeAudioId === messageId) {
            setActiveAudioId(null);
            return;
        }

        setActiveAudioId(messageId);
        setIsGeneratingVoice(true);

        try {
            console.log('Starting voice generation for message:', messageId);
            const audioUrl = await generateVoice(text);

            if (audioUrl) {
                console.log('Audio URL received, creating Audio element');
                const audio = new Audio(audioUrl);
                audioRef.current = audio;

                // Pre-load the audio
                audio.preload = 'auto';

                // Reset state when audio ends naturally
                audio.onended = () => {
                    console.log('Audio playback ended');
                    setActiveAudioId(null);
                    audioRef.current = null;
                    // Clean up blob URL
                    URL.revokeObjectURL(audioUrl);
                };

                // Handle errors during playback
                audio.onerror = (e) => {
                    console.error('Audio playback error:', e);
                    setActiveAudioId(null);
                    setIsGeneratingVoice(false);
                    URL.revokeObjectURL(audioUrl);
                    alert('Audio playback failed. Please try again.');
                };

                // Wait for audio to be ready
                audio.oncanplaythrough = async () => {
                    console.log('Audio can play through, starting playback');
                    try {
                        await audio.play();
                        console.log('Audio playback started successfully');
                        setIsGeneratingVoice(false);
                    } catch (playError) {
                        console.error('Playback failed:', playError);
                        setActiveAudioId(null);
                        setIsGeneratingVoice(false);
                        URL.revokeObjectURL(audioUrl);
                        alert('Could not play audio. Please check your browser settings.');
                    }
                };

                // Trigger loading
                audio.load();

            } else {
                // Generation failed
                console.error('No audio URL returned from API');
                setActiveAudioId(null);
                setIsGeneratingVoice(false);
                alert('Voice generation failed. Check console for details.');
            }
        } catch (error) {
            console.error('Failed to process voice request:', error);
            setActiveAudioId(null);
            setIsGeneratingVoice(false);
            alert('Voice generation encountered an error.');
        }
    };

    // Clear history
    const clearHistory = () => {
        setMessages([]);
        if (audioRef.current) {
            audioRef.current.pause();
            setActiveAudioId(null);
        }
    };

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    // Toggle Mic
    const toggleMic = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening(language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : 'en-US');
        }
    };

    // Quick prompts
    const quickPrompts = [
        'What crops should I plant this season?',
        'How to protect crops from flooding?',
        'Best time to sell my harvest?',
        'Weather tips for today',
    ];

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-[calc(100vh-140px)]"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/dashboard"
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                {t('chat.title')}
                            </h1>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {selectedLocation ? (
                                    <>{selectedLocation} • {floodRisk.level} Flood Risk</>
                                ) : (
                                    <span className="text-amber-600">No location selected</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-slate-500 hover:text-red-500"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                    </Button>
                </div>

                {/* Chat Container */}
                <Card className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-white">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Welcome Message */}
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Bot className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">
                                    AgriPulse Assistant
                                </h3>
                                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                    Ask me anything about farming, weather, crops, or market prices.
                                    I'm here to help you make better farming decisions.
                                </p>

                                {/* Quick Prompts */}
                                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                                    {quickPrompts.map((prompt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSendMessage(prompt)}
                                            className="px-4 py-2 bg-white rounded-full text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-600 border border-slate-200 hover:border-purple-300 transition-all shadow-sm"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Message List */}
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                onPlay={() => handlePlayVoice(message.id, message.message)}
                                isPlaying={activeAudioId === message.id}
                                isGenerating={isGeneratingVoice && activeAudioId === message.id}
                            />
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 shadow-md border border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-100 bg-white">
                        <form onSubmit={handleSubmit} className="flex items-center gap-3">
                            {/* Voice Input Button */}
                            {isSpeechSupported && (
                                <Button
                                    type="button"
                                    onClick={toggleMic}
                                    variant="secondary"
                                    className={cn(
                                        "p-3 rounded-xl transition-all",
                                        isListening
                                            ? "bg-red-50 text-red-500 border-red-200 animate-pulse ring-2 ring-red-200"
                                            : "hover:bg-slate-100 text-slate-600 border-slate-200"
                                    )}
                                    title={isListening ? "Stop listening" : "Use voice input"}
                                >
                                    {isListening ? (
                                        <Square className="w-5 h-5 fill-current" />
                                    ) : (
                                        <Mic className="w-5 h-5" />
                                    )}
                                </Button>
                            )}

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isListening ? "Listening..." : "Type your question here..."}
                                className={cn(
                                    "flex-1 px-5 py-4 rounded-xl border focus:ring-2 outline-none transition-all text-slate-700 placeholder-slate-400",
                                    isListening
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/10 placeholder-red-400"
                                        : "border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                                )}
                                disabled={isTyping}
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!input.trim() || isTyping}
                                className="px-5 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg"
                            >
                                {isTyping ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </form>
                    </div>
                </Card>
            </motion.div>
        </DashboardLayout>
    );
}

// Chat Message Component
function ChatMessage({
    message,
    onPlay,
    isPlaying,
    isGenerating
}: {
    message: Message;
    onPlay: () => void;
    isPlaying: boolean;
    isGenerating: boolean;
}) {
    const isUser = message.role === 'user';

    // Voice is now handled by secure Edge Function - always show the button

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md',
                    isUser
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-purple-500 to-pink-600'
                )}
            >
                {isUser ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message Bubble container */}
            <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser ? "items-end" : "items-start")}>
                <div
                    className={cn(
                        'rounded-2xl px-5 py-4 shadow-md',
                        isUser
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    )}
                >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.message}
                    </p>
                </div>

                {/* Voice Interaction (Assistants only) */}
                {!isUser && (
                    <button
                        onClick={onPlay}
                        disabled={isGenerating}
                        className={cn(
                            "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-all",
                            isPlaying
                                ? "text-purple-600 bg-purple-50"
                                : "text-slate-400 hover:text-purple-600 hover:bg-white"
                        )}
                        title="Listen to this measure"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Generating audio...
                            </>
                        ) : isPlaying ? (
                            <>
                                <Volume2 className="w-3 h-3 animate-pulse" />
                                Playing...
                            </>
                        ) : (
                            <>
                                <Volume2 className="w-3 h-3" />
                                Listen
                            </>
                        )}
                    </button>
                )}
            </div>
        </motion.div>
    );
}
