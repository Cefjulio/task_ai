import { create } from 'zustand';
import type { TabType } from '@/components/dashboard/Tabs';

export interface NavRequest {
    tab: TabType;
    /** Study Hub sub-tab to land on. */
    studySubTab?: 'roulette' | 'lms';
    /** Open this course (book) and jump to this lesson. */
    courseId?: string;
    lessonId?: string;
}

interface NavState {
    request: NavRequest | null;
    go: (request: NavRequest) => void;
    clear: () => void;
}

/** One-shot "take me there" requests from anywhere (e.g. a modal) to the tab / book that should open. */
export const useNavStore = create<NavState>((set) => ({
    request: null,
    go: (request) => set({ request }),
    clear: () => set({ request: null }),
}));
