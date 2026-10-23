import React, { useState } from 'react';
import { Lesson, LessonStatus } from '@/types/Lms';
import { QuillContent } from '@/components/ui/QuillContent';
import { cn } from '@/components/ui/Button';
import { hueOf, shadeHex } from '@/utils/colorUtils';
import { PAPER_CLASS, RIBBON_CLIP, STATUS_META, STATUS_ORDER } from './bookStyles';
import { ExternalLink, Eye, EyeOff, Pencil, Trash2, ChevronsLeft, ChevronsRight, ArrowRight, CheckCheck, Bookmark } from 'lucide-react';

interface BookPageProps {
    lesson: Lesson;
    page: number;
    total: number;
    accent: string;
    isBookmarked: boolean;
    onToggleBookmark: () => void;
    onSetStatus: (status: LessonStatus) => void;
    onCompleteAndNext: () => void;
    onTurnNext: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onMove: (direction: 'up' | 'down') => void;
}

const toolButton =
    'p-2 rounded-lg text-stone-400 transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-stone-400';

/** One lesson, laid out as a printed page. */
export const BookPage: React.FC<BookPageProps> = ({
    lesson, page, total, accent, isBookmarked,
    onToggleBookmark, onSetStatus, onCompleteAndNext, onTurnNext, onEdit, onDelete, onMove,
}) => {
    const [showEmbed, setShowEmbed] = useState(false);
    const meta = STATUS_META[lesson.status];
    const isFirst = page === 1;
    const isLast = page === total;
    const hasNotes = lesson.content.replace(/<[^>]*>/g, '').trim().length > 0;

    // "Complete & turn" uses the book's colour, but never a green: green is reserved for "already completed"
    const hue = hueOf(accent);
    const pendingColor = hue !== null && hue >= 90 && hue <= 170 ? '#6366f1' : accent;

    return (
        <div className={cn('relative flex h-full flex-col overflow-hidden rounded-xl shadow-md lg:rounded-l-sm', PAPER_CLASS)}>
            {/* Gutter shading toward the spine */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-10 bg-gradient-to-r from-black/10 to-transparent lg:block" />

            {/* Hanging ribbon */}
            <button
                onClick={onToggleBookmark}
                className={cn(
                    'absolute right-6 top-0 z-20 flex h-14 w-6 items-start justify-center pt-2 shadow-md transition-all',
                    isBookmarked
                        ? 'bg-red-500 text-white hover:h-16'
                        : '-translate-y-6 bg-stone-300 text-stone-500 opacity-0 hover:translate-y-0 hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 dark:bg-stone-700 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-60'
                )}
                style={{ clipPath: RIBBON_CLIP }}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
                aria-label={isBookmarked ? 'Remove bookmark from this page' : 'Bookmark this page'}
                aria-pressed={isBookmarked}
            >
                <Bookmark className={cn('h-3.5 w-3.5', isBookmarked && 'fill-current')} />
            </button>

            <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-6 pb-4 pt-8 sm:px-10">
                <div className="flex items-center gap-3 pr-10">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.3em]" style={{ color: accent }}>
                        Lesson {page}
                    </p>
                    <span
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider"
                        style={{ backgroundColor: `${meta.color}1c`, color: meta.color }}
                    >
                        <meta.Icon className="h-3.5 w-3.5" />
                        {meta.label}
                    </span>
                </div>

                <QuillContent
                    html={lesson.title}
                    className="!p-0 font-serif text-2xl font-bold leading-snug text-stone-900 dark:text-stone-50 sm:text-3xl [&_p]:m-0"
                />

                <div className="flex items-center gap-3 text-stone-300 dark:text-stone-700" aria-hidden>
                    <span className="h-px flex-1 bg-current" />
                    <span className="text-lg">❦</span>
                    <span className="h-px flex-1 bg-current" />
                </div>

                {hasNotes ? (
                    <QuillContent
                        html={lesson.content}
                        className="!p-0 font-serif text-[15px] leading-relaxed text-stone-700 dark:text-stone-300"
                    />
                ) : (
                    <p className="font-serif text-sm italic text-stone-400">
                        No notes on this page yet — use the pencil below to jot some down.
                    </p>
                )}

                {lesson.resourceUrl && (
                    <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-800 dark:bg-stone-800/40">
                        <div className="flex flex-wrap items-center gap-2">
                            <a
                                href={lesson.resourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-[filter] hover:brightness-110"
                                style={{ backgroundColor: accent }}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open in Notebook LM
                            </a>
                            <button
                                onClick={() => setShowEmbed(v => !v)}
                                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
                            >
                                {showEmbed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                {showEmbed ? 'Hide preview' : 'Try inline preview'}
                            </button>
                        </div>
                        <p className="text-[11px] text-stone-400 dark:text-stone-500">
                            NotebookLM often blocks embedding, so the button above is the reliable way in — the inline preview is a bonus that may show blank.
                        </p>
                        {showEmbed && (
                            <iframe
                                src={lesson.resourceUrl}
                                className="h-72 w-full rounded-xl border border-stone-200 bg-white dark:border-stone-700"
                                title={`Resource for lesson ${page}`}
                            />
                        )}
                    </div>
                )}

                <div>
                    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">Progress</p>
                    <div className="flex gap-2">
                        {STATUS_ORDER.map(status => {
                            const option = STATUS_META[status];
                            const selected = lesson.status === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => onSetStatus(status)}
                                    aria-pressed={selected}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all',
                                        selected ? 'text-white shadow-md' : 'bg-transparent opacity-60 hover:opacity-90'
                                    )}
                                    style={{
                                        backgroundColor: selected ? option.color : `${option.color}18`,
                                        borderColor: option.color,
                                        color: selected ? '#fff' : option.color,
                                    }}
                                >
                                    <option.Icon className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">{option.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Page footer: tools · printed page number · primary action */}
            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-stone-200 px-3 py-2.5 dark:border-stone-800 sm:px-5">
                <div className="flex items-center">
                    <button
                        onClick={() => onMove('up')}
                        disabled={isFirst}
                        className={cn(toolButton, 'hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800')}
                        title="Move this page earlier"
                        aria-label="Move this page earlier"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onMove('down')}
                        disabled={isLast}
                        className={cn(toolButton, 'hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800')}
                        title="Move this page later"
                        aria-label="Move this page later"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className={cn(toolButton, 'hover:bg-primary/10 hover:text-primary')}
                        title="Edit lesson"
                        aria-label="Edit lesson"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className={cn(toolButton, 'hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20')}
                        title="Delete lesson"
                        aria-label="Delete lesson"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <span className="hidden font-serif text-sm text-stone-400 sm:block" aria-hidden>— {page} —</span>

                {lesson.status !== 'completed' ? (
                    <button
                        onClick={onCompleteAndNext}
                        className="flex items-center gap-1.5 rounded-xl border-b-4 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition-all active:translate-y-0.5 active:border-b-2"
                        style={{ backgroundColor: pendingColor, borderColor: shadeHex(pendingColor, -28) }}
                    >
                        <CheckCheck className="h-4 w-4" />
                        {isLast ? 'Mark complete' : 'Complete & turn'}
                    </button>
                ) : !isLast ? (
                    // Green = this page is already done; the book's colour = still to complete
                    <button
                        onClick={onTurnNext}
                        className="flex items-center gap-1.5 rounded-xl border-b-4 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition-all active:translate-y-0.5 active:border-b-2"
                        style={{
                            backgroundColor: STATUS_META.completed.color,
                            borderColor: shadeHex(STATUS_META.completed.color, -28),
                        }}
                    >
                        Turn the page
                        <ArrowRight className="h-4 w-4" />
                    </button>
                ) : (
                    <span className="px-3 font-serif text-sm italic text-stone-400">The End</span>
                )}
            </div>
        </div>
    );
};
