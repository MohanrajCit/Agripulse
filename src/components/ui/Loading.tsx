import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-2 border-slate-200 border-t-primary-500',
                sizes[size],
                className
            )}
        />
    );
}

interface LoadingOverlayProps {
    message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-slate-600 font-medium">{message}</p>
            </div>
        </div>
    );
}

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-slate-200 rounded-lg',
                className
            )}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-card p-6">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
}
