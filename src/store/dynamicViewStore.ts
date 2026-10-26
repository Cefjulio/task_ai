import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DynamicViewState {
    /** Hide everything outside today's Focus lane until the Focus tasks are done. */
    focusMode: boolean;
    toggleFocusMode: () => void;
}

// Per-device view preference (not task data, so it stays out of Supabase)
export const useDynamicViewStore = create<DynamicViewState>()(
    persist(
        (set) => ({
            focusMode: false,
            toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
        }),
        { name: 'todo-ai-dynamic-view' }
    )
);
