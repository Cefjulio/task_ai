import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book, BookAssignment, DailyReadingGoal, ReadingSettings } from '@/types/Book';
import { supabaseService } from '@/services/storage/supabaseService';
import { supabase } from '@/services/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

function todayStr(): string {
    return new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
}

interface ReadingState {
    books: Book[];
    settings: ReadingSettings;
    todayGoal: DailyReadingGoal | null;
    streak: number;
    lastCompletedDate: string | null;

    // Book CRUD
    addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'currentPage'>) => void;
    updateBook: (id: string, updates: Partial<Book>) => void;
    deleteBook: (id: string) => void;
    resetBookProgress: (id: string) => void;

    // Settings
    updateSettings: (s: Partial<ReadingSettings>) => void;

    // Daily goal
    generateTodayGoal: () => void;
    completeAssignment: (bookId: string) => void;
    loadMorePages: (bookId: string) => void;
}

export const useReadingStore = create<ReadingState>()(
    persist(
        (set, get) => ({
            books: [],
            settings: { pagesPerSession: 10, booksPerDay: 2 },
            todayGoal: null,
            streak: 0,
            lastCompletedDate: null,

            // ── Book CRUD ────────────────────────────────────────────────
            addBook: (bookData) => {
                const now = new Date().toISOString();
                const newBook: Book = {
                    ...bookData,
                    id: uuidv4(),
                    currentPage: 1,
                    createdAt: now,
                    updatedAt: now,
                };
                set(s => ({ books: [newBook, ...s.books] }));
            },

            updateBook: (id, updates) => {
                set(s => ({
                    books: s.books.map(b =>
                        b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
                    ),
                }));
            },

            deleteBook: async (id) => {
                set(s => ({ books: s.books.filter(b => b.id !== id) }));
                await supabase.from('books').delete().eq('id', id);
            },

            resetBookProgress: (id) => {
                set(s => ({
                    books: s.books.map(b =>
                        b.id === id ? { ...b, currentPage: 1, updatedAt: new Date().toISOString() } : b
                    ),
                    // Remove any assignment for this book from today's goal
                    todayGoal: s.todayGoal
                        ? {
                            ...s.todayGoal,
                            assignments: s.todayGoal.assignments.filter(a => a.bookId !== id),
                        }
                        : null,
                }));
            },

            // ── Settings ─────────────────────────────────────────────────
            updateSettings: (s) => {
                set(prev => ({ settings: { ...prev.settings, ...s } }));
            },

            // ── Daily goal ───────────────────────────────────────────────
            generateTodayGoal: () => {
                const { books, settings, todayGoal } = get();
                const today = todayStr();

                // Don't regenerate if we already have today's goal
                if (todayGoal?.date === today) return;

                const eligible = books.filter(
                    b => b.isActive && b.currentPage <= b.totalPages
                );

                // Shuffle so different books can surface each day
                const shuffled = [...eligible].sort(() => Math.random() - 0.5);
                const picked = shuffled.slice(0, settings.booksPerDay);

                const assignments: BookAssignment[] = picked.map(b => ({
                    bookId: b.id,
                    startPage: b.currentPage,
                    endPage: Math.min(b.currentPage + settings.pagesPerSession - 1, b.totalPages),
                }));

                set({ todayGoal: { date: today, assignments } });
            },

            completeAssignment: (bookId) => {
                const { todayGoal, books, streak, lastCompletedDate } = get();
                if (!todayGoal) return;

                const assignment = todayGoal.assignments.find(
                    a => a.bookId === bookId && !a.completedAt
                );
                if (!assignment) return;

                const now = new Date().toISOString();
                const updatedAssignments = todayGoal.assignments.map(a =>
                    a.bookId === bookId && !a.completedAt ? { ...a, completedAt: now } : a
                );

                // Advance book's currentPage past the completed pages
                const nextPage = assignment.endPage + 1;
                const updatedBooks = books.map(b =>
                    b.id === bookId ? { ...b, currentPage: nextPage, updatedAt: now } : b
                );

                // Check if all assignments for today are now complete
                const allDone = updatedAssignments.every(a => !!a.completedAt);
                const today = todayStr();
                let newStreak = streak;
                if (allDone) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
                    newStreak = lastCompletedDate === yesterdayStr || lastCompletedDate === today
                        ? streak + (lastCompletedDate === today ? 0 : 1)
                        : 1;
                }

                set({
                    todayGoal: { ...todayGoal, assignments: updatedAssignments },
                    books: updatedBooks,
                    streak: newStreak,
                    lastCompletedDate: allDone ? today : lastCompletedDate,
                });
            },

            loadMorePages: (bookId) => {
                const { todayGoal, books, settings } = get();
                if (!todayGoal) return;

                const book = books.find(b => b.id === bookId);
                if (!book || book.currentPage > book.totalPages) return;

                // Find the furthest endPage already assigned for this book
                const existing = todayGoal.assignments.filter(a => a.bookId === bookId);
                const lastEnd = existing.reduce((max, a) => Math.max(max, a.endPage), 0);
                const startPage = Math.max(book.currentPage, lastEnd + 1);
                if (startPage > book.totalPages) return;

                const newAssignment: BookAssignment = {
                    bookId,
                    startPage,
                    endPage: Math.min(startPage + settings.pagesPerSession - 1, book.totalPages),
                    isExtra: true,
                };

                set({
                    todayGoal: {
                        ...todayGoal,
                        assignments: [...todayGoal.assignments, newAssignment],
                    },
                });
            },
        }),
        {
            name: 'todo-ai-reading-storage',
            storage: supabaseService as any,
            partialize: s => ({
                books: s.books,
                settings: s.settings,
                todayGoal: s.todayGoal,
                streak: s.streak,
                lastCompletedDate: s.lastCompletedDate,
            }),
        }
    )
);
