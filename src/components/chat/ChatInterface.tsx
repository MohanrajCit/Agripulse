import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Volume2, VolumeX, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';

interface Message {
    id: string;
    message: string;
    role: 'user' | 'assistant';
    created_at: string;
}

interface ChatInterfaceProps {
    messages: Message[];
    isTyping: boolean;
    onSendMessage: (message: string) => void;
    onPlayVoice?: (text: string) => void;
    isVoiceLoading?: boolean;
}

export function ChatInterface({
    messages,
    isTyping,
    onSendMessage,
    onPlayVoice,
    isVoiceLoading,
}: ChatInterfaceProps) {
    const { t } = useLanguage();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        onSendMessage(input.trim());
        setInput('');
        inputRef.current?.focus();
    };

    const quickPrompts = [
        'What crops should I plant this season?',
        'How to protect crops from flooding?',
        'Best time to sell rice?',
        'Weather tips for farming',
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Welcome Message */}
                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                            <Bot className="w-8 h-8 text-primary-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            {t('chat.title')}
                        </h3>
                        <p className="text-slate-500 mb-6">{t('chat.welcome')}</p>

                        {/* Quick Prompts */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {quickPrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSendMessage(prompt)}
                                    className="px-4 py-2 bg-white rounded-full text-sm text-slate-600 hover:bg-primary-50 hover:text-primary-600 border border-slate-200 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Message List */}
                <AnimatePresence initial={false}>
                    {messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message}
                            onPlayVoice={onPlayVoice}
                            isVoiceLoading={isVoiceLoading}
                        />
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 bg-white">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('chat.placeholder')}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        disabled={isTyping}
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!input.trim() || isTyping}
                        className="px-4"
                    >
                        {isTyping ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

interface ChatMessageProps {
    message: Message;
    onPlayVoice?: (text: string) => void;
    isVoiceLoading?: boolean;
}

function ChatMessage({ message, onPlayVoice, isVoiceLoading }: ChatMessageProps) {
    const { t } = useLanguage();
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    isUser ? 'bg-accent-100' : 'bg-primary-100'
                )}
            >
                {isUser ? (
                    <User className="w-4 h-4 text-accent-600" />
                ) : (
                    <Bot className="w-4 h-4 text-primary-600" />
                )}
            </div>

            {/* Message Bubble */}
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
                    isUser
                        ? 'bg-primary-500 text-white rounded-tr-none'
                        : 'bg-white rounded-tl-none'
                )}
            >
                <p className={cn('text-sm leading-relaxed', !isUser && 'text-slate-700')}>
                    {message.message}
                </p>

                {/* Voice Button for AI responses */}
                {!isUser && onPlayVoice && (
                    <button
                        onClick={() => onPlayVoice(message.message)}
                        disabled={isVoiceLoading}
                        className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-primary-500 transition-colors"
                    >
                        {isVoiceLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Volume2 className="w-3 h-3" />
                        )}
                        <span>{t('chat.voice')}</span>
                    </button>
                )}
            </div>
        </motion.div>
    );
}
