import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Configure Supabase with explicit auth settings for proper session management
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
        storageKey: 'agripulse-auth', // Custom key for easy cleanup
    },
});

// Types for database tables
export interface UserPreferences {
    id: string;
    user_id: string;
    district: string;
    state: string;
    language: string;
    created_at: string;
    updated_at: string;
}

export interface Alert {
    id: string;
    user_id: string;
    type: 'flood' | 'weather' | 'price' | 'general';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    is_read: boolean;
    is_dismissed: boolean;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    message: string;
    role: 'user' | 'assistant';
    language: string;
    created_at: string;
}
