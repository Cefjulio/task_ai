import { create } from 'zustand';

/** Completions closer together than this keep the streak alive. */
export const STREAK_WINDOW_MS = 90_000;

interface StreakState {
    count: number;
    lastAt: number;
    /** Register a completion; returns the streak length including it. */
    bump: () => number;
}

// Session-only on purpose: a streak is "how many have I knocked out in a row right now".
export const useStreakStore = create<StreakState>((set, get) => ({
    count: 0,
    lastAt: 0,
    bump: () => {
        const now = Date.now();
        const { count, lastAt } = get();
        const next = now - lastAt <= STREAK_WINDOW_MS ? count + 1 : 1;
        set({ count: next, lastAt: now });
        return next;
    },
}));
