import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dailyStorage } from '@/services/storage/dailyStorage';
import { DailyState, EMPTY_DAILY_STATE, ReminderState, StudyState } from '@/types/Daily';
import { acknowledgeReminder } from '@/utils/dailyLogic';

interface DailyStoreState extends DailyState {
    setReminder: (reminder: ReminderState) => void;
    setStudy: (study: StudyState) => void;
    /** Acknowledge a reminder; returns true when that finished the round (so the caller can celebrate). */
    acknowledge: (key: string, today: string, allKeys: string[]) => boolean;
    snoozeStudy: (until: number | null) => void;
}

export const useDailyStore = create<DailyStoreState>()(
    persist(
        (set, get) => ({
            ...EMPTY_DAILY_STATE,

            setReminder: (reminder) => set({ reminder }),
            setStudy: (study) => set({ study }),

            acknowledge: (key, today, allKeys) => {
                const { state, roundCompleted } = acknowledgeReminder(get().reminder, key, today, allKeys);
                set({ reminder: state });
                return roundCompleted;
            },

            snoozeStudy: (until) => set((s) => ({ study: { ...s.study, snoozedUntil: until } })),
        }),
        {
            name: 'todo-ai-daily-state',
            storage: dailyStorage as any,
            partialize: (state) => ({ reminder: state.reminder, study: state.study }),
            // Tolerate older / partial saved shapes
            merge: (persisted: any, current) => ({
                ...current,
                reminder: { ...current.reminder, ...(persisted?.reminder ?? {}) },
                study: { ...current.study, ...(persisted?.study ?? {}) },
            }),
        }
    )
);
