import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, locale: string = 'en-IN'): string {
    return new Date(date).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format time to readable string
 */
export function formatTime(date: string | Date, locale: string = 'en-IN'): string {
    return new Date(date).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Delay utility for animations
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9) / 5 + 32;
}

/**
 * Get weather icon based on condition
 */
export function getWeatherIcon(condition: string): string {
    const iconMap: Record<string, string> = {
        'clear': '☀️',
        'clouds': '☁️',
        'rain': '🌧️',
        'drizzle': '🌦️',
        'thunderstorm': '⛈️',
        'snow': '❄️',
        'mist': '🌫️',
        'fog': '🌫️',
    };
    return iconMap[condition.toLowerCase()] || '🌤️';
}
