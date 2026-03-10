import React, { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useDailyReset } from '@/hooks/useDailyReset';
import { Toaster } from 'react-hot-toast';

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const theme = useSettingsStore((state) => state.theme);

    // Run daily reset logic implicitly here so it runs globally
    useDailyReset();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Handle system theme changes if needed
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (!localStorage.getItem('todo-ai-settings')) {
                // Auto switch based on OS if no preference is saved yet
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <>
            {children}
            <Toaster
                position="bottom-center"
                toastOptions={{
                    className: 'dark:bg-slate-800 dark:text-white',
                    style: {
                        borderRadius: '16px',
                        background: '#333',
                        color: '#fff',
                    },
                }}
            />
        </>
    );
};
