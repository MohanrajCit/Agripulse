import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, getTranslation, languageNames, translations } from '../i18n';
import { useAuth } from './AuthContext';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    languageNames: typeof languageNames;
    availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'agripulse_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { preferences } = useAuth();
    const [language, setLanguageState] = useState<Language>(() => {
        // Check localStorage first - this is the source of truth
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && stored in translations) {
            return stored as Language;
        }
        return 'en';
    });

    // Sync language with user preferences ONLY if localStorage doesn't have a valid language
    // This prevents overriding user's explicit selection on login/signup pages
    useEffect(() => {
        const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        const hasValidStoredLang = storedLang && storedLang in translations;

        // Only sync from preferences if we don't have a valid localStorage value
        if (!hasValidStoredLang && preferences?.language && preferences.language in translations) {
            const prefLang = preferences.language as Language;
            setLanguageState(prefLang);
            localStorage.setItem(LANGUAGE_STORAGE_KEY, prefLang);
        }
    }, [preferences?.language]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    }, []);

    const t = useCallback(
        (key: string): string => getTranslation(language, key),
        [language]
    );

    const availableLanguages: Language[] = ['en', 'hi', 'ta', 'te'];

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
                t,
                languageNames,
                availableLanguages,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
