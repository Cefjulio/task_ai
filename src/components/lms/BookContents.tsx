import React, { useEffect, useRef } from 'react';
import { Course, Lesson } from '@/types/Lms';
import { QuillContent } from '@/components/ui/QuillContent';
import { stripHtml } from '@/utils/htmlUtils';
import { cn } from '@/components/ui/Button';
import { PAPER_CLASS, STATUS_META } from './bookStyles';
import { Bookmark } from 'lucide-react';

interface BookContentsProps {
    course: Course;
    lessons: Lesson[]; // already in page order
    activeId: string | null;
    bookmarkId?: string;
    accent: string;
    onSelect: (lessonId: string) => void;
    className?: string;
}

/** The "table of contents" page: every lesson as a page you can jump to. */
export const BookContents: React.FC<BookContentsProps> = ({
    course, lessons, activeId, bookmarkId, accent, onSelect, className,
}) => {
    const listRef = useRef<HTMLOListElement>(null);

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
                <h3 className="mt-1 font-serif text-xl font-bold leading-snug">
                    <span className="mr-2">{course.emoji || '📚'}</span>
                    {course.title}
                </h3>
                {course.description && (
                    <QuillContent
                        html={course.description}
                        className="!p-0 mt-2 line-clamp-3 text-xs text-stone-500 dark:text-stone-400 [&_p]:m-0"
                    />
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
                        const title = stripHtml(lesson.title) || 'Untitled lesson';
                        return (
                            <li key={lesson.id}>
                                <button
                                    onClick={() => onSelect(lesson.id)}
                                    data-active={isActive}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cn(
                                        'flex w-full items-center gap-3 rounded-lg border-l-4 px-3 py-2 text-left transition-colors',
                                        isActive
                                            ? 'font-bold'
                                            : 'border-transparent hover:bg-stone-100 dark:hover:bg-stone-800/70'
                                    )}
                                    style={isActive ? { borderColor: accent, backgroundColor: `${accent}1f` } : undefined}
                                >
                                    <span className="w-6 shrink-0 text-right font-serif text-sm tabular-nums text-stone-400">
                                        {i + 1}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-sm">{title}</span>
                                    {lesson.id === bookmarkId && (
                                        <Bookmark className="h-3.5 w-3.5 shrink-0 fill-red-500 text-red-500" aria-label="Bookmarked" />
                                    )}
                                    <meta.Icon className="h-4 w-4 shrink-0" style={{ color: meta.color }} aria-label={meta.label} />
                                </button>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
};
