import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Course, Lesson, LessonStatus } from '../types/Lms';
import { supabaseService } from '../services/storage/supabaseService';
import { supabase } from '../services/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface LmsState {
    courses: Course[];
    lessons: Lesson[];

    addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateCourse: (id: string, updates: Partial<Course>) => void;
    deleteCourse: (id: string) => void;

    addLesson: (lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'status'>) => void;
    updateLesson: (id: string, updates: Partial<Lesson>) => void;
    deleteLesson: (id: string) => void;
    reorderLesson: (id: string, direction: 'up' | 'down') => void;
    setLessonStatus: (id: string, status: LessonStatus) => void;
    /** Set every lesson in a book to the same status in one update. */
    setAllLessonsStatus: (courseId: string, status: LessonStatus) => void;

    /** Bookmark a lesson in its book (null clears it). Leaves updatedAt alone so the shelf order doesn't shuffle. */
    setBookmark: (courseId: string, lessonId: string | null) => void;
}

export const useLmsStore = create<LmsState>()(
    persist(
        (set, get) => ({
            courses: [],
            lessons: [],

            addCourse: (courseData) => {
                const now = new Date().toISOString();
                const newCourse: Course = {
                    ...courseData,
                    id: uuidv4(),
                    createdAt: now,
                    updatedAt: now,
                };
                set((state) => ({ courses: [newCourse, ...state.courses] }));
            },

            updateCourse: (id, updates) => {
                set((state) => ({
                    courses: state.courses.map((c) =>
                        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
                    ),
                }));
            },

            deleteCourse: async (id) => {
                set((state) => ({
                    courses: state.courses.filter((c) => c.id !== id),
                    lessons: state.lessons.filter((l) => l.courseId !== id),
                }));

                const { error: courseError } = await supabase.from('lms_courses').delete().eq('id', id);
                if (courseError) console.error('Error deleting course from Supabase:', courseError);

                const { error: lessonError } = await supabase.from('lms_lessons').delete().eq('course_id', id);
                if (lessonError) console.error('Error deleting course lessons from Supabase:', lessonError);
            },

            addLesson: (lessonData) => {
                const now = new Date().toISOString();
                const siblingOrders = get().lessons
                    .filter((l) => l.courseId === lessonData.courseId)
                    .map((l) => l.order);
                const nextOrder = siblingOrders.length > 0 ? Math.max(...siblingOrders) + 1 : 0;

                const newLesson: Lesson = {
                    ...lessonData,
                    id: uuidv4(),
                    status: 'not_started',
                    order: nextOrder,
                    createdAt: now,
                    updatedAt: now,
                };
                set((state) => ({ lessons: [...state.lessons, newLesson] }));
            },

            updateLesson: (id, updates) => {
                set((state) => ({
                    lessons: state.lessons.map((l) =>
                        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
                    ),
                }));
            },

            deleteLesson: async (id) => {
                set((state) => ({
                    lessons: state.lessons.filter((l) => l.id !== id),
                    courses: state.courses.map((c) => (c.bookmarkLessonId === id ? { ...c, bookmarkLessonId: null } : c)),
                }));
                const { error } = await supabase.from('lms_lessons').delete().eq('id', id);
                if (error) console.error('Error deleting lesson from Supabase:', error);
            },

            reorderLesson: (id, direction) => {
                set((state) => {
                    const lesson = state.lessons.find((l) => l.id === id);
                    if (!lesson) return state;

                    const siblings = state.lessons
                        .filter((l) => l.courseId === lesson.courseId)
                        .sort((a, b) => a.order - b.order);

                    const index = siblings.findIndex((l) => l.id === id);
                    const swapIndex = direction === 'up' ? index - 1 : index + 1;
                    if (swapIndex < 0 || swapIndex >= siblings.length) return state;

                    const other = siblings[swapIndex];
                    const now = new Date().toISOString();

                    return {
                        lessons: state.lessons.map((l) => {
                            if (l.id === lesson.id) return { ...l, order: other.order, updatedAt: now };
                            if (l.id === other.id) return { ...l, order: lesson.order, updatedAt: now };
                            return l;
                        }),
                    };
                });
            },

            setBookmark: (courseId, lessonId) => {
                set((state) => ({
                    courses: state.courses.map((c) => (c.id === courseId ? { ...c, bookmarkLessonId: lessonId } : c)),
                }));
            },

            setAllLessonsStatus: (courseId, status) => {
                const now = new Date().toISOString();
                set((state) => ({
                    lessons: state.lessons.map((l) =>
                        l.courseId === courseId && l.status !== status ? { ...l, status, updatedAt: now } : l
                    ),
                }));
            },

            setLessonStatus: (id, status) => {
                set((state) => ({
                    lessons: state.lessons.map((l) =>
                        l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l
                    ),
                }));
            },
        }),
        {
            name: 'todo-ai-lms-storage',
            storage: supabaseService as any,
            partialize: (state) => ({
                courses: state.courses,
                lessons: state.lessons,
            }),
        }
    )
);
