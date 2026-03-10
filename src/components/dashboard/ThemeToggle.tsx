import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useSettingsStore();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5 text-slate-700" />
            ) : (
                <Sun className="h-5 w-5 text-slate-200" />
            )}
        </Button>
    );
};
