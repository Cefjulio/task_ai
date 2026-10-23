import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Course, Lesson } from '@/types/Lms';
import { useLmsReaderStore } from '@/store/lmsReaderStore';
import { shadeHex } from '@/utils/colorUtils';
import { stripHtml } from '@/utils/htmlUtils';
import { RIBBON_CLIP, SHELF_PLANK_CLASS } from './bookStyles';
import { Pencil, Trash2, Bookmark } from 'lucide-react';

interface BookCoverProps {
    course: Course;
    lessons: Lesson[];
    onOpen: (course: Course) => void;
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
}

export const BookCover: React.FC<BookCoverProps> = ({ course, lessons, onOpen, onEdit, onDelete }) => {
    const bookmarkId = course.bookmarkLessonId;
    const lastReadId = useLmsReaderStore(s => s.lastRead[course.id]);

    const ordered = useMemo(() => [...lessons].sort((a, b) => a.order - b.order), [lessons]);
    const total = ordered.length;
    const completed = ordered.filter(l => l.status === 'completed').length;

    const bookmarkPage = bookmarkId ? ordered.findIndex(l => l.id === bookmarkId) + 1 : 0;
    const lastReadPage = lastReadId ? ordered.findIndex(l => l.id === lastReadId) + 1 : 0;
    // Never-opened books on this device: estimate from lesson progress (first unfinished page)
    const firstUnfinished = ordered.findIndex(l => l.status !== 'completed') + 1;
    const estimatedPage = completed === 0 ? 0 : firstUnfinished || total;
    // The bookmark wins over the page the book was last left on
    const currentPage = bookmarkPage || lastReadPage || estimatedPage;
    const progress = total > 0 ? Math.round((currentPage / total) * 100) : 0;
    const titleSize = course.title.length > 45 ? 'text-[13px]' : course.title.length > 26 ? 'text-[15px]' : 'text-[17px]';

    const accent = course.color || '#8b5cf6';
    const coverBackground = `linear-gradient(145deg, ${shadeHex(accent, 18)} 0%, ${accent} 45%, ${shadeHex(accent, -38)} 100%)`;
    const summary = course.description ? stripHtml(course.description) : '';

    const open = () => onOpen(course);

    return (
        <div className="relative px-3 sm:px-5 pt-7 pb-3">
            {/* Shelf plank — planks of neighbouring books join into one board */}
            <div className={SHELF_PLANK_CLASS} />

            <div className="relative mx-auto w-full max-w-[190px]">
                {/* Contact shadow on the shelf */}
                <div className="pointer-events-none absolute -bottom-1 inset-x-3 h-3 rounded-full bg-black/35 blur-md" />

                <motion.div
                    role="button"
                    tabIndex={0}
                    aria-label={`Open the book ${course.title}`}
                    title={summary || course.title}
                    onClick={open}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            open();
                        }
                    }}
                    whileHover={{ rotateY: -16, y: -10 }}
                    whileFocus={{ rotateY: -16, y: -10 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ transformOrigin: 'left center', transformPerspective: 1000 }}
                    className="group relative aspect-[2/3] w-full cursor-pointer outline-none"
                >
                    {/* Page block peeking out behind the cover */}
                    <div
                        className="absolute inset-y-[3px] left-3 -right-[7px] rounded-r-sm border border-stone-300/80"
                        style={{
                            background: 'repeating-linear-gradient(to right, #f6f1e4 0 1px, #ddd5c2 1px 2px)',
                            boxShadow: '2px 3px 6px rgba(0,0,0,0.25)',
                        }}
                    />

                    {/* Cover board */}
                    <div
                        className="absolute inset-0 overflow-hidden rounded-l-sm rounded-r-lg group-focus-visible:ring-4 group-focus-visible:ring-violet-400/70"
                        style={{
                            background: coverBackground,
                            boxShadow: '0 12px 22px -6px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.12)',
                        }}
                    >
                        {/* Spine */}
                        <div
                            className="absolute inset-y-0 left-0 w-4"
                            style={{
                                background:
                                    'linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,0,0,0.06) 55%, rgba(255,255,255,0.2) 78%, rgba(0,0,0,0.14))',
                            }}
                        />
                        {/* Cloth texture */}
                        <div
                            className="absolute inset-0 opacity-[0.12] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '14px 14px' }}
                        />

                        <div className="relative flex h-full flex-col pl-7 pr-4 pt-9 pb-4 text-white">
                            {course.category && (
                                <p className="truncate text-center text-[9px] font-extrabold uppercase tracking-[0.25em] text-white/75">
                                    {course.category}
                                </p>
                            )}

                            <div className="my-auto flex flex-col items-center gap-2.5 py-2 text-center">
                                <span className="text-4xl drop-shadow-md">{course.emoji || '📚'}</span>
                                <div className="w-full border-y border-amber-200/60 py-2">
                                    <h3 className={`line-clamp-4 break-words font-serif font-black leading-tight drop-shadow ${titleSize}`}>
                                        {course.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Reading progress: page vs. total pages */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-white/85">
                                    <span>
                                        {total === 0
                                            ? 'Empty book'
                                            : currentPage > 0
                                                ? `Page ${currentPage} of ${total}`
                                                : `${total} ${total === 1 ? 'page' : 'pages'}`}
                                    </span>
                                    {total > 0 && <span>{completed} ✓</span>}
                                </div>
                                <div
                                    className="h-1.5 overflow-hidden rounded-full bg-black/30"
                                    role="progressbar"
                                    aria-label="Reading progress"
                                    aria-valuemin={0}
                                    aria-valuemax={total}
                                    aria-valuenow={currentPage}
                                >
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-200 to-amber-400 transition-[width] duration-700"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bookmark ribbon sticking out of the top */}
                    {bookmarkPage > 0 && (
                        <div
                            className="absolute -top-2.5 right-7 flex h-12 w-5 items-start justify-center bg-red-500 pt-1.5 text-white shadow-md"
                            style={{ clipPath: RIBBON_CLIP }}
                            title={`Bookmarked at page ${bookmarkPage}`}
                        >
                            <Bookmark className="h-3 w-3 fill-current" />
                        </div>
                    )}

                    {/* Edit / delete */}
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(course); }}
                            className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                            title="Edit course"
                            aria-label={`Edit ${course.title}`}
                        >
                            <Pencil className="h-3 w-3" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(course); }}
                            className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500"
                            title="Delete course"
                            aria-label={`Delete ${course.title}`}
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
