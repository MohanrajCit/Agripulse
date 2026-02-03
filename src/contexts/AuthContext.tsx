import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserPreferences } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    preferences: UserPreferences | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, district: string, language: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    updatePreferences: (district: string, language: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Timeout to ensure loading never hangs indefinitely (reduced from 5s to 3s)
        const loadingTimeout = setTimeout(() => {
            setLoading(false);
        }, 3000);

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                // Fetch preferences in background - don't block
                fetchPreferences(session.user.id);
            } else {
                setLoading(false);
                clearTimeout(loadingTimeout);
            }
        }).catch((err) => {
            console.error('Error getting session:', err);
            setLoading(false);
            clearTimeout(loadingTimeout);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                // Update user/session immediately - don't wait for preferences
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
                clearTimeout(loadingTimeout);

                if (session?.user) {
                    // Fetch preferences in background (non-blocking)
                    fetchPreferences(session.user.id).catch(err => {
                        console.error('Background preferences fetch failed:', err);
                    });
                } else {
                    setPreferences(null);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
            clearTimeout(loadingTimeout);
        };
    }, []);

    const fetchPreferences = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching preferences:', error);
            }
            setPreferences(data);
        } catch (err) {
            console.error('Error fetching preferences:', err);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error as Error | null };
    };

    const signUp = async (
        email: string,
        password: string,
        district: string,
        language: string
    ) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return { error: error as Error };
        }

        // Create user preferences after successful signup
        if (data.user) {
            const { error: prefError } = await supabase
                .from('user_preferences')
                .insert({
                    user_id: data.user.id,
                    district,
                    language,
                    state: 'Tamil Nadu', // Default state
                });

            if (prefError) {
                console.error('Error creating preferences:', prefError);
            }
        }

        return { error: null };
    };

    const signOut = async () => {
        // CRITICAL: Clear local state and storage FIRST before API call
        // This prevents race conditions where session is restored before clearing

        // 1. Immediately clear React state
        setUser(null);
        setSession(null);
        setPreferences(null);

        // 2. Clear all storage BEFORE API call
        // Clear the custom auth key
        localStorage.removeItem('agripulse-auth');

        // Clear ALL Supabase-related keys from localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('Error removing key:', key, e);
            }
        });

        // Clear session storage
        sessionStorage.clear();

        // 3. Now call Supabase signOut (this may fail if network issues, but that's OK - storage is already cleared)
        try {
            await supabase.auth.signOut({ scope: 'global' });
        } catch (error) {
            console.error('Error signing out from Supabase:', error);
            // Don't throw - we already cleared local storage
        }
    };

    const updatePreferences = async (district: string, language: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: user.id,
                district,
                language,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error('Error updating preferences:', error);
            throw error;
        }

        await fetchPreferences(user.id);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                preferences,
                loading,
                signIn,
                signUp,
                signOut,
                updatePreferences,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
