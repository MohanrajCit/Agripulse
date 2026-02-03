import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className,
}: BadgeProps) {
    const variants = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center font-semibold rounded-full',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </span>
    );
}
