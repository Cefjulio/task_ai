import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabaseService } from '@/services/storage/supabaseService';
import { FastingSessionState } from '@/types/Health';

interface SettingsState {
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    bannerPhrases: string[];
    fastingState: FastingSessionState;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleSound: () => void;
    setBannerPhrases: (phrases: string[]) => void;
    updateFastingConfig: (fastingHours: number, eatingHours: number) => void;
    startFast: () => void;
    stopFast: () => number | null;
    resetFast: () => void;
}

const DEFAULT_PHRASES = [
    "Complete and sale Ai course.",
    "Complete and sale English course.",
    "Deep Focus (No Distractions), Be Fast, Manage Priorities (80/20).",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Don't stop when you're tired. Stop when you're done."
];

const DEFAULT_FASTING_STATE: FastingSessionState = {
    fastingHours: 16,
    eatingHours: 8,
    activeFastStart: null,
    lastFastEnd: null
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'light',
            soundEnabled: true,
            bannerPhrases: DEFAULT_PHRASES,
            fastingState: DEFAULT_FASTING_STATE,
            setTheme: (theme) => set({ theme }),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
            setBannerPhrases: (bannerPhrases) => set({ bannerPhrases }),
            updateFastingConfig: (fastingHours, eatingHours) => set((state) => ({
                fastingState: {
                    ...state.fastingState,
                    fastingHours,
                    eatingHours
                }
            })),
            startFast: () => set((state) => ({
                fastingState: {
                    ...state.fastingState,
                    activeFastStart: new Date().toISOString()
                }
            })),
            stopFast: () => {
                let durationMinutes: number | null = null;
                set((state) => {
                    const start = state.fastingState.activeFastStart;
                    if (!start) return {};
                    const durationMs = new Date().getTime() - new Date(start).getTime();
                    durationMinutes = Math.round(durationMs / 60000);
                    return {
                        fastingState: {
                            ...state.fastingState,
                            activeFastStart: null,
                            lastFastEnd: new Date().toISOString()
                        }
                    };
                });
                return durationMinutes;
            },
            resetFast: () => set((state) => ({
                fastingState: {
                    ...state.fastingState,
                    activeFastStart: null,
                    lastFastEnd: null
                }
            }))
        }),
        {
            name: 'todo-ai-settings',
            storage: supabaseService as any,
        }
    )
);
