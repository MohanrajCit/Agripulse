import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, ChatMessage } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { languageFullNames } from '../i18n';

interface ChatContext {
    district: string;
    weather?: {
        temperature: number;
        rainfall: number;
        condition: string;
    };
    floodRisk?: string;
}

interface SendMessageParams {
    message: string;
    context?: ChatContext;
}

async function sendChatMessage(
    message: string,
    language: string,
    context?: ChatContext
): Promise<string> {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
            message,
            language: languageFullNames[language as keyof typeof languageFullNames] || 'English',
            context,
        },
    });

    if (error) {
        throw new Error(error.message || 'Failed to get AI response');
    }

    return data.response;
}

async function fetchChatHistory(userId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(50);

    if (error) {
        throw new Error('Failed to fetch chat history');
    }

    return data || [];
}

async function saveChatMessage(
    userId: string,
    message: string,
    role: 'user' | 'assistant',
    language: string
): Promise<void> {
    const { error } = await supabase.from('chat_history').insert({
        user_id: userId,
        message,
        role,
        language,
    });

    if (error) {
        console.error('Failed to save chat message:', error);
    }
}

export function useAIChat() {
    const { user } = useAuth();
    const { language } = useLanguage();
    const queryClient = useQueryClient();
    const [isTyping, setIsTyping] = useState(false);

    // Fetch chat history
    const {
        data: chatHistory = [],
        isLoading: isLoadingHistory,
    } = useQuery({
        queryKey: ['chat-history', user?.id],
        queryFn: () => fetchChatHistory(user!.id),
        enabled: !!user,
    });

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async ({ message, context }: SendMessageParams) => {
            if (!user) throw new Error('User not authenticated');

            setIsTyping(true);

            // Save user message
            await saveChatMessage(user.id, message, 'user', language);

            // Get AI response
            const response = await sendChatMessage(message, language, context);

            // Save AI response
            await saveChatMessage(user.id, response, 'assistant', language);

            return response;
        },
        onSuccess: () => {
            // Invalidate chat history to refetch
            queryClient.invalidateQueries({ queryKey: ['chat-history', user?.id] });
        },
        onSettled: () => {
            setIsTyping(false);
        },
    });

    const sendMessage = useCallback(
        (message: string, context?: ChatContext) => {
            return sendMessageMutation.mutateAsync({ message, context });
        },
        [sendMessageMutation]
    );

    const clearHistory = useCallback(async () => {
        if (!user) return;

        const { error } = await supabase
            .from('chat_history')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            console.error('Failed to clear chat history:', error);
        } else {
            queryClient.invalidateQueries({ queryKey: ['chat-history', user.id] });
        }
    }, [user, queryClient]);

    return {
        chatHistory,
        isLoadingHistory,
        isTyping,
        sendMessage,
        clearHistory,
        error: sendMessageMutation.error,
    };
}
