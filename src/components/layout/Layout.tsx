import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main>
                <Outlet />
            </main>
        </div>
    );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
        </div>
    );
}
