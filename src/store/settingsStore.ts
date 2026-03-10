import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { localStorageService } from '@/services/storage/localStorageService';

interface SettingsState {
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    bannerPhrases: string[];
    setTheme: (theme: 'light' | 'dark') => void;
    toggleSound: () => void;
    setBannerPhrases: (phrases: string[]) => void;
}

const DEFAULT_PHRASES = [
    "Complete and sale Ai course.",
    "Complete and sale English course.",
    "Deep Focus (No Distractions), Be Fast, Manage Priorities (80/20).",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Don't stop when you're tired. Stop when you're done."
];

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light',
            soundEnabled: true,
            bannerPhrases: DEFAULT_PHRASES,
            setTheme: (theme) => set({ theme }),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
            setBannerPhrases: (bannerPhrases) => set({ bannerPhrases }),
        }),
        {
            name: 'todo-ai-settings',
            storage: createJSONStorage(() => localStorageService as any),
        }
    )
);
