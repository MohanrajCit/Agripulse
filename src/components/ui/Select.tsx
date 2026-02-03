import React from 'react';
import { cn } from '../../lib/utils';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

export function Select({
    label,
    error,
    options,
    placeholder,
    className,
    ...props
}: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                </label>
            )}
            <select
                className={cn(
                    'w-full px-4 py-3 rounded-xl border border-slate-200',
                    'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
                    'outline-none transition-all duration-200',
                    'bg-white appearance-none cursor-pointer',
                    'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")]',
                    'bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat',
                    error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                    className
                )}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        </div>
    );
}
