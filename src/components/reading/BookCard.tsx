import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { useReadingStore } from '@/store/readingStore';
import { Edit2, Trash2, RotateCcw, BookOpen, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/components/ui/Button';

const BOOK_COLORS = [
    'from-blue-500 to-cyan-400',
    'from-violet-500 to-purple-400',
    'from-rose-500 to-pink-400',
    'from-amber-500 to-orange-400',
    'from-emerald-500 to-teal-400',
    'from-indigo-500 to-blue-400',
];

function bookColor(id: string): string {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return BOOK_COLORS[Math.abs(hash) % BOOK_COLORS.length];
}

interface BookCardProps {
    book: Book;
    onEdit: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onEdit }) => {
    const { deleteBook, resetBookProgress, updateBook } = useReadingStore();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);

    const progress = book.totalPages > 0
        ? Math.min(100, Math.round(((book.currentPage - 1) / book.totalPages) * 100))
        : 0;
    const pagesRead = Math.max(0, book.currentPage - 1);
    const isFinished = book.currentPage > book.totalPages;

    return (
        <div className={cn(
            'flex gap-4 bg-white dark:bg-slate-900 rounded-2xl border p-4 shadow-sm transition-all',
            book.isActive
                ? 'border-slate-200 dark:border-slate-800'
                : 'border-slate-100 dark:border-slate-800/50 opacity-60'
        )}>
            {/* Cover / thumbnail */}
            <div className="shrink-0 w-16 sm:w-20 h-24 sm:h-28 rounded-xl overflow-hidden shadow-md">
                {book.coverUrl ? (
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${bookColor(book.id)} flex flex-col items-center justify-center p-2`}>
                        <BookOpen className="w-6 h-6 text-white/80 mb-1" />
                        <span className="text-white text-[9px] font-black text-center leading-tight line-clamp-3">
                            {book.title}
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h3 className="font-black text-slate-800 dark:text-white text-sm leading-tight line-clamp-2">
                            {book.title}
                        </h3>
                        {isFinished && (
                            <span className="shrink-0 text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                ✓ Done
                            </span>
                        )}
                    </div>
                    {book.author && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{book.author}</p>
                    )}

                    {/* Progress */}
                    <div className="mb-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-bold">
                                Page {pagesRead} of {book.totalPages}
                            </span>
                            <span className="text-[10px] font-black text-primary">{progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-wrap">
                    {/* Active toggle */}
                    <button
                        onClick={() => updateBook(book.id, { isActive: !book.isActive })}
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-extrabold transition-colors',
                            book.isActive
                                ? 'text-primary bg-primary/10 hover:bg-primary/20'
                                : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                        )}
                        title={book.isActive ? 'Remove from daily rotation' : 'Add to daily rotation'}
                    >
                        {book.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {book.isActive ? 'Active' : 'Inactive'}
                    </button>

                    <button
                        onClick={() => onEdit(book)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Reset progress */}
                    {confirmReset ? (
                        <div className="flex gap-1">
                            <button
                                onClick={() => { resetBookProgress(book.id); setConfirmReset(false); }}
                                className="px-2 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500 text-white"
                            >
                                Reset?
                            </button>
                            <button
                                onClick={() => setConfirmReset(false)}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmReset(true)}
                            className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Reset progress"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Delete */}
                    {confirmDelete ? (
                        <div className="flex gap-1">
                            <button
                                onClick={() => { deleteBook(book.id); setConfirmDelete(false); }}
                                className="px-2 py-1 rounded-lg text-[11px] font-extrabold bg-red-500 text-white"
                            >
                                Delete?
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
