import React, { useEffect, useRef } from 'react';
import { Course, Lesson, LessonStatus } from '@/types/Lms';
import { QuillContent } from '@/components/ui/QuillContent';
import { stripHtml } from '@/utils/htmlUtils';
import { cn } from '@/components/ui/Button';
import { PAPER_CLASS, STATUS_META } from './bookStyles';
import { Bookmark, CheckCheck, RotateCcw } from 'lucide-react';

interface BookContentsProps {
    course: Course;
    lessons: Lesson[]; // already in page order
    activeId: string | null;
    bookmarkId?: string;
    accent: string;
    onSelect: (lessonId: string) => void;
    onToggleComplete: (lesson: Lesson) => void;
    onSetAllStatus: (status: LessonStatus) => void;
    className?: string;
}

/** The "table of contents" page: every lesson as a page you can jump to, tick off, or reset. */
export const BookContents: React.FC<BookContentsProps> = ({
    course, lessons, activeId, bookmarkId, accent, onSelect, onToggleComplete, onSetAllStatus, className,
}) => {
    const listRef = useRef<HTMLOListElement>(null);
    const completedCount = lessons.filter(l => l.status === 'completed').length;
    const allDone = lessons.length > 0 && completedCount === lessons.length;

    // Keep the current page's entry in view without scrolling the whole window
    useEffect(() => {
        const list = listRef.current;
        const active = list?.querySelector<HTMLElement>('[data-active="true"]');
        if (!list || !active) return;
        const top = active.offsetTop - list.offsetTop;
        if (top < list.scrollTop || top + active.offsetHeight > list.scrollTop + list.clientHeight) {
            list.scrollTop = top - list.clientHeight / 2 + active.offsetHeight / 2;
        }
    }, [activeId]);

    return (
        <div className={cn('relative flex h-full flex-col overflow-hidden shadow-md', PAPER_CLASS, className)}>
            {/* Gutter shading toward the spine */}
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-8 bg-gradient-to-l from-black/10 to-transparent lg:block" />

            <div className="shrink-0 border-b border-dashed border-stone-300 px-6 pb-4 pt-6 dark:border-stone-700">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.3em]" style={{ color: accent }}>
                    Contents
                </p>
                <h3 className="mt-1 pr-8 font-serif text-xl font-bold leading-snug lg:pr-0">
                    <span className="mr-2">{course.emoji || '📚'}</span>
                    {course.title}
                </h3>
                {course.description && (
                    <QuillContent
                        html={course.description}
                        className="!p-0 mt-2 line-clamp-3 text-xs text-stone-500 dark:text-stone-400 [&_p]:m-0"
                    />
                )}

                {lessons.length > 0 && (
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                            {completedCount} of {lessons.length} complete
                        </span>
                        <button
                            onClick={() => onSetAllStatus(allDone ? 'not_started' : 'completed')}
                            className={cn(
                                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider transition-colors',
                                allDone
                                    ? 'border-stone-300 text-stone-500 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-800'
                                    : 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600'
                            )}
                        >
                            {allDone ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCheck className="h-3.5 w-3.5" />}
                            {allDone ? 'Mark all incomplete' : 'Mark all complete'}
                        </button>
                    </div>
                )}
            </div>

            {lessons.length === 0 ? (
                <p className="m-auto px-8 text-center font-serif text-sm italic text-stone-400">
                    No pages yet — add the first lesson to start writing this book.
                </p>
            ) : (
                <ol ref={listRef} className="custom-scrollbar relative flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
                    {lessons.map((lesson, i) => {
                        const meta = STATUS_META[lesson.status];
                        const isActive = lesson.id === activeId;
                        const isDone = lesson.status === 'completed';
                        const title = stripHtml(lesson.title) || 'Untitled lesson';
                        return (
                            <li
                                key={lesson.id}
                                data-active={isActive}
                                className={cn(
                                    'flex items-center gap-1 rounded-lg border-l-4 pr-1 transition-colors',
                                    isActive ? 'font-bold' : 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800/70'
                                )}
                                style={isActive ? { borderColor: accent, backgroundColor: `${accent}1f` } : undefined}
                            >
                                <button
                                    onClick={() => onSelect(lesson.id)}
                                    aria-current={isActive ? 'page' : undefined}
                                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left"
                                >
                                    <span className="w-6 shrink-0 text-right font-serif text-sm tabular-nums text-stone-400">
                                        {i + 1}
                                    </span>
                                    <span className={cn('min-w-0 flex-1 truncate text-sm', isDone && !isActive && 'text-stone-500 dark:text-stone-400')}>
                                        {title}
                                    </span>
                                    {lesson.id === bookmarkId && (
                                        <Bookmark className="h-3.5 w-3.5 shrink-0 fill-red-500 text-red-500" aria-label="Bookmarked" />
                                    )}
                                </button>
                                <button
                                    onClick={() => onToggleComplete(lesson)}
                                    aria-pressed={isDone}
                                    aria-label={isDone ? `Mark page ${i + 1} incomplete` : `Mark page ${i + 1} complete`}
                                    title={isDone ? 'Completed — click to mark incomplete' : `${meta.label} — click to mark complete`}
                                    className="shrink-0 rounded-full p-1.5 transition-transform hover:scale-110 active:scale-95"
                                >
                                    <meta.Icon className="h-5 w-5" style={{ color: meta.color }} />
                                </button>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
};
