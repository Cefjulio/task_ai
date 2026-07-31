import React from 'react';
import { DailyReadingGoal, ReadingSettings } from '@/types/Book';
import { Book } from '@/types/Book';
import { Flame, BookOpen, ChevronRight, PlusCircle, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/Button';

interface DailyReadingHeroProps {
    todayGoal: DailyReadingGoal | null;
    books: Book[];
    settings: ReadingSettings;
    streak: number;
    onGenerate: () => void;
    onReadNow: (bookId: string) => void;
    onLoadMore: (bookId: string) => void;
    onUpdateSettings: (s: Partial<ReadingSettings>) => void;
}

export const DailyReadingHero: React.FC<DailyReadingHeroProps> = ({
    todayGoal, books, settings, streak,
    onGenerate, onReadNow, onLoadMore, onUpdateSettings,
}) => {
    const assignments = todayGoal?.assignments ?? [];
    const totalAssignments = assignments.filter(a => !a.isExtra).length;
    const completedCount = assignments.filter(a => !!a.completedAt && !a.isExtra).length;
    const allCoreComplete = totalAssignments > 0 && completedCount === totalAssignments;

    const activeBooks = books.filter(b => b.isActive && b.currentPage <= b.totalPages);

    return (
        <div className="space-y-4">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a3a8f] via-[#1CB0F6] to-cyan-400 p-6 shadow-xl shadow-primary/20">
                <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }}
                />

                <div className="relative z-10">
                    {/* Streak + stats row */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 bg-white/20 rounded-2xl px-3 py-1.5">
                                <Flame className="w-4 h-4 text-orange-300" />
                                <span className="font-black text-white text-sm">{streak}</span>
                                <span className="text-white/70 text-xs">day streak</span>
                            </div>
                            {allCoreComplete && (
                                <div className="flex items-center gap-1.5 bg-emerald-400/30 rounded-2xl px-3 py-1.5">
                                    <Trophy className="w-4 h-4 text-yellow-200" />
                                    <span className="text-white font-extrabold text-xs">Goal Complete!</span>
                                </div>
                            )}
                        </div>

                        {/* Settings inline */}
                        <div className="flex items-center gap-2 text-[11px] text-white/70">
                            <div className="flex items-center gap-1">
                                <span>Pages:</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={settings.pagesPerSession}
                                    onChange={e => onUpdateSettings({ pagesPerSession: Math.max(1, Number(e.target.value)) })}
                                    className="w-10 bg-white/20 text-white font-black text-center rounded-lg py-0.5 border border-white/20 focus:outline-none focus:border-white/50"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <span>Books:</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={settings.booksPerDay}
                                    onChange={e => onUpdateSettings({ booksPerDay: Math.max(1, Number(e.target.value)) })}
                                    className="w-10 bg-white/20 text-white font-black text-center rounded-lg py-0.5 border border-white/20 focus:outline-none focus:border-white/50"
                                />
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 drop-shadow">
                        {allCoreComplete ? "Today's reading done! 🎉" : "Today's Reading"}
                    </h2>
                    <p className="text-white/65 text-sm mb-5">
                        {!todayGoal
                            ? 'No goal set yet — generate one below'
                            : allCoreComplete
                                ? `${completedCount} of ${totalAssignments} books completed`
                                : `${completedCount} of ${totalAssignments} books done · keep going!`}
                    </p>

                    {/* Assignment cards */}
                    {assignments.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {assignments.map(a => {
                                const book = books.find(b => b.id === a.bookId);
                                if (!book) return null;
                                const total = a.endPage - a.startPage + 1;
                                const isDone = !!a.completedAt;

                                return (
                                    <motion.div
                                        key={`${a.bookId}-${a.startPage}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            'bg-white/15 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20',
                                            isDone && 'opacity-60'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                                                isDone ? 'bg-emerald-400/30' : 'bg-white/20'
                                            )}>
                                                {isDone
                                                    ? <span className="text-lg">✓</span>
                                                    : <BookOpen className="w-4 h-4 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-white text-sm truncate">{book.title}</h4>
                                                    {a.isExtra && (
                                                        <span className="shrink-0 text-[9px] font-extrabold uppercase bg-white/20 text-white px-1.5 py-0.5 rounded-full">
                                                            Extra
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-white/70 text-[11px]">
                                                    Pages {a.startPage}–{a.endPage} · {total} page{total !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            {!isDone && (
                                                <button
                                                    onClick={() => onReadNow(a.bookId)}
                                                    className="shrink-0 flex items-center gap-1 bg-white text-primary font-black text-xs px-3 py-2 rounded-xl border-b-2 border-sky-200 active:border-b-0 active:translate-y-0.5 transition-all shadow"
                                                >
                                                    Read <ChevronRight className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {!todayGoal || todayGoal.date !== new Date().toLocaleDateString('en-CA') ? (
                            <button
                                onClick={onGenerate}
                                disabled={activeBooks.length === 0}
                                className="flex items-center gap-2 bg-yellow-400 text-yellow-900 font-black px-5 py-3 rounded-2xl border-b-4 border-yellow-600 shadow-lg active:border-b-2 active:translate-y-0.5 transition-all text-sm disabled:opacity-50"
                            >
                                <Zap className="w-4 h-4" />
                                {activeBooks.length === 0 ? 'Add active books first' : "Generate Today's Goal"}
                            </button>
                        ) : allCoreComplete && (
                            <button
                                onClick={() => {
                                    const activeWithPages = activeBooks.filter(b => b.currentPage <= b.totalPages);
                                    activeWithPages.forEach(b => onLoadMore(b.id));
                                }}
                                disabled={activeBooks.length === 0}
                                className="flex items-center gap-2 bg-white/20 text-white font-black px-5 py-3 rounded-2xl border-b-4 border-white/25 active:border-b-2 active:translate-y-0.5 transition-all text-sm"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Load More Pages
                            </button>
                        )}
                        {todayGoal && !allCoreComplete && (
                            <button
                                onClick={onGenerate}
                                className="flex items-center gap-2 bg-white/15 text-white font-bold px-4 py-3 rounded-2xl border border-white/20 text-xs hover:bg-white/20 transition-colors"
                                title="Regenerate today's goal with fresh books"
                            >
                                Regenerate
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
