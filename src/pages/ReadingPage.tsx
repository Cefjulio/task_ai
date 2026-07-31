import React, { useEffect, useState } from 'react';
import { useReadingStore } from '@/store/readingStore';
import { Book, BookAssignment } from '@/types/Book';
import { DailyReadingHero } from '@/components/reading/DailyReadingHero';
import { BookCard } from '@/components/reading/BookCard';
import { BookFormModal } from '@/components/reading/BookFormModal';
import { PdfViewerModal } from '@/components/reading/PdfViewerModal';
import { AnimatePresence, motion } from 'framer-motion';
import { triggerConfetti, playLevelUp, resumeAudio } from '@/utils/soundEffects';
import { Library } from 'lucide-react';

export const ReadingPage: React.FC = () => {
    const {
        books, todayGoal, settings, streak,
        generateTodayGoal, completeAssignment, loadMorePages, updateSettings,
    } = useReadingStore();

    const [isFormOpen, setFormOpen] = useState(false);
    const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
    const [viewerState, setViewerState] = useState<{ book: Book; assignment: BookAssignment } | null>(null);

    // Auto-generate goal on mount if today's goal doesn't exist
    useEffect(() => {
        const today = new Date().toLocaleDateString('en-CA');
        if (books.length > 0 && (!todayGoal || todayGoal.date !== today)) {
            generateTodayGoal();
        }
    }, []);

    const handleReadNow = (bookId: string) => {
        const book = books.find(b => b.id === bookId);
        if (!book || !todayGoal) return;
        const assignment = todayGoal.assignments.find(a => a.bookId === bookId && !a.completedAt);
        if (!assignment) return;
        setViewerState({ book, assignment });
    };

    const handleCompleteAssignment = () => {
        if (!viewerState) return;
        resumeAudio();
        completeAssignment(viewerState.book.id);

        // Check if all core assignments are now done
        const updatedAssignments = todayGoal?.assignments.map(a =>
            a.bookId === viewerState.book.id && !a.completedAt ? { ...a, completedAt: new Date().toISOString() } : a
        ) ?? [];
        const allDone = updatedAssignments.filter(a => !a.isExtra).every(a => !!a.completedAt);
        if (allDone) {
            playLevelUp();
            triggerConfetti();
        }

        setViewerState(null);
    };

    const handleEdit = (book: Book) => {
        setBookToEdit(book);
        setFormOpen(true);
    };

    const handleAddNew = () => {
        setBookToEdit(null);
        setFormOpen(true);
    };

    const sortedBooks = [...books].sort((a, b) => {
        if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
        const ap = a.totalPages > 0 ? (a.currentPage - 1) / a.totalPages : 0;
        const bp = b.totalPages > 0 ? (b.currentPage - 1) / b.totalPages : 0;
        return ap - bp;
    });

    return (
        <div className="space-y-8">
            {/* Daily reading hero */}
            <DailyReadingHero
                todayGoal={todayGoal}
                books={books}
                settings={settings}
                streak={streak}
                onGenerate={generateTodayGoal}
                onReadNow={handleReadNow}
                onLoadMore={loadMorePages}
                onUpdateSettings={updateSettings}
            />

            {/* Library section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Library className="w-5 h-5 text-primary" />
                        <h3 className="font-black text-slate-800 dark:text-white text-lg">My Library</h3>
                        <span className="text-xs text-slate-400 font-semibold">({books.length} book{books.length !== 1 ? 's' : ''})</span>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-primary text-white font-extrabold text-sm px-4 py-2.5 rounded-2xl border-b-4 border-primary-dark shadow-md shadow-primary/25 active:border-b-2 active:translate-y-0.5 transition-all"
                    >
                        + Add Book
                    </button>
                </div>

                {books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5">
                            <Library className="w-10 h-10 text-primary/60" />
                        </div>
                        <h4 className="text-xl font-black text-slate-700 dark:text-slate-300 mb-2">No books yet</h4>
                        <p className="text-slate-500 max-w-sm mb-5 text-sm">Upload your first PDF book to start your daily reading habit.</p>
                        <button
                            onClick={handleAddNew}
                            className="bg-primary text-white font-extrabold px-6 py-3 rounded-2xl border-b-4 border-primary-dark shadow-lg shadow-primary/25 active:border-b-2 active:translate-y-0.5 transition-all"
                        >
                            Add Your First Book
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {sortedBooks.map((book, i) => (
                                <motion.div
                                    key={book.id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.18, delay: i * 0.04 }}
                                >
                                    <BookCard book={book} onEdit={handleEdit} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Book form modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <BookFormModal
                        isOpen={isFormOpen}
                        onClose={() => { setFormOpen(false); setBookToEdit(null); }}
                        bookToEdit={bookToEdit}
                    />
                )}
            </AnimatePresence>

            {/* PDF viewer modal — full screen, portalled above everything */}
            <AnimatePresence>
                {viewerState && (
                    <PdfViewerModal
                        book={viewerState.book}
                        assignment={viewerState.assignment}
                        onComplete={handleCompleteAssignment}
                        onClose={() => setViewerState(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
