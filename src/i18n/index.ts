import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';
import te from './te.json';

export type Language = 'en' | 'hi' | 'ta' | 'te';

export const translations = {
    en,
    hi,
    ta,
    te,
} as const;

export type TranslationKeys = typeof en;

/**
 * Get nested translation value by dot-notation key
 * Example: getTranslation('en', 'landing.hero.title')
 */
export function getTranslation(lang: Language, key: string): string {
    const keys = key.split('.');
    let value: unknown = translations[lang];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = (value as Record<string, unknown>)[k];
        } else {
            // Fallback to English if key not found
            value = translations.en;
            for (const fallbackKey of keys) {
                if (value && typeof value === 'object' && fallbackKey in value) {
                    value = (value as Record<string, unknown>)[fallbackKey];
                } else {
                    return key; // Return key if not found
                }
            }
            break;
        }
    }

    return typeof value === 'string' ? value : key;
}

/**
 * Language display names for selector
 */
export const languageNames: Record<Language, string> = {
    en: 'English',
    hi: 'हिंदी',
    ta: 'தமிழ்',
    te: 'తెలుగు',
};

/**
 * Get language name for AI prompts
 */
export const languageFullNames: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi',
    ta: 'Tamil',
    te: 'Telugu',
};
