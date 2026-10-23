import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LmsReaderState {
    /** courseId → lessonId of the page the book was last left open on */
    lastRead: Record<string, string>;
    /** Cover-opening and page-turn animations (on by default; can be switched off in the reader) */
    pageEffects: boolean;

    setLastRead: (courseId: string, lessonId: string) => void;
    togglePageEffects: () => void;
}

// Per-device reading preferences. Bookmarks are NOT here — they live on the course
// (lms_courses.bookmark_lesson_id) so they sync across devices.
export const useLmsReaderStore = create<LmsReaderState>()(
    persist(
        (set) => ({
            lastRead: {},
            pageEffects: true,

            setLastRead: (courseId, lessonId) =>
                set((state) =>
                    state.lastRead[courseId] === lessonId
                        ? state
                        : { lastRead: { ...state.lastRead, [courseId]: lessonId } }
                ),

            togglePageEffects: () => set((state) => ({ pageEffects: !state.pageEffects })),
        }),
        { name: 'todo-ai-lms-reader' }
    )
);
