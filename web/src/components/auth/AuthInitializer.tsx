'use client';

import { useEffect, useState } from 'react';
import AuthService from '@/lib/api/auth';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            // If we have a user in localStorage, try to restore the session silently
            if (AuthService.isAuthenticated()) {
                await AuthService.silentRefresh();
            }
            setIsInitialized(true);
        };
        initAuth();
    }, []);

    // We can show a global loading state here if we want to avoid flicker
    if (!isInitialized) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-fika-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium animate-pulse uppercase tracking-widest text-xs">Fika Admin Initialization...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
