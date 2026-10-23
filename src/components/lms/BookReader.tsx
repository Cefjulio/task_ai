import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, PanInfo, useMotionValue, useMotionValueEvent } from 'framer-motion';
import toast from 'react-hot-toast';
import { Course, Lesson, LessonStatus } from '@/types/Lms';
import { useLmsStore } from '@/store/lmsStore';
import { useLmsReaderStore } from '@/store/lmsReaderStore';
import { useSettingsStore } from '@/store/settingsStore';
import { cn } from '@/components/ui/Button';
import { shadeHex } from '@/utils/colorUtils';
import { stripHtml } from '@/utils/htmlUtils';
import { playLevelUp, playPageTurn, resumeAudio, triggerConfetti } from '@/utils/soundEffects';
import { BookPage } from './BookPage';
import { BookContents } from './BookContents';
import { LessonFormModal } from './LessonFormModal';
import { PAGE_HEIGHT_CLASS, PAPER_CLASS } from './bookStyles';
import {
    ArrowLeft, ChevronLeft, ChevronRight, Pencil, Trash2, Plus, ListOrdered,
    Bookmark, BookmarkCheck, Volume2, VolumeX, X, BookOpen, Sparkles,
} from 'lucide-react';

interface BookReaderProps {
    course: Course;
    lessons: Lesson[];
    onBack: () => void;
    onEditCourse: (course: Course) => void;
    onDeleteCourse: (course: Course) => void;
    focusLessonId?: string | null;
}

interface Turn {
    fromId: string;
    toId: string;
    dir: 1 | -1; // 1 = forward (current page lifts away), -1 = back (previous page falls on top)
}

const TURN_MS = 750;
const TURN_EASE: [number, number, number, number] = [0.45, 0.05, 0.25, 1];
const FLIP_ANGLE = -100; // a little past edge-on so the page fully disappears into the spine
const INTRO_FLIP_MS = 1100;

/** Shadow that sweeps across a page while another one lifts over it (or lands on it). */
const Shade: React.FC<{ gradient: string; from: number; to: number }> = ({ gradient, from, to }) => (
    <motion.div
        className="pointer-events-none absolute inset-0 z-30 rounded-xl lg:rounded-l-sm"
        style={{ background: gradient }}
        initial={{ opacity: from }}
        animate={{ opacity: to }}
        transition={{ duration: TURN_MS / 1000, ease: TURN_EASE }}
    />
);

/** The front cover, as it appears on the shelf — used for the opening animation. */
const CoverArt: React.FC<{ course: Course; accent: string }> = ({ course, accent }) => (
    <div
        className="absolute inset-0 overflow-hidden rounded-xl text-white lg:rounded-l-sm"
        style={{
            background: `linear-gradient(145deg, ${shadeHex(accent, 18)} 0%, ${accent} 45%, ${shadeHex(accent, -38)} 100%)`,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)',
        }}
    >
        <div
            className="absolute inset-y-0 left-0 w-6"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,0,0,0.06) 55%, rgba(255,255,255,0.2) 78%, rgba(0,0,0,0.14))' }}
        />
        <div
            className="absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '14px 14px' }}
        />
        <div className="relative flex h-full flex-col items-center justify-center gap-4 px-10 text-center">
            {course.category && (
                <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/75">{course.category}</p>
            )}
            <span className="text-6xl drop-shadow-md">{course.emoji || '📚'}</span>
            <div className="w-full border-y border-amber-200/60 py-4">
                <h2 className="line-clamp-4 font-serif text-3xl font-black leading-tight drop-shadow">{course.title}</h2>
            </div>
        </div>
    </div>
);

/** Inside of the cover: patterned endpaper in the book's colour. */
const EndPaper: React.FC<{ accent: string }> = ({ accent }) => (
    <div
        className="absolute inset-0 rounded-xl lg:rounded-r-sm"
        style={{
            background: `repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 14px), linear-gradient(135deg, ${shadeHex(accent, 72)}, ${shadeHex(accent, 55)})`,
            boxShadow: 'inset -14px 0 24px -10px rgba(0,0,0,0.25)',
        }}
    />
);

/**
 * The cover swinging open around the spine, then fading away.
 * The two faces are swapped by angle (rather than via backface-visibility, which some browsers
 * get wrong for nested transforms): the front shows until edge-on, the endpaper after that.
 */
const CoverLeaf: React.FC<{ course: Course; accent: string; onSkip: () => void }> = ({ course, accent, onSkip }) => {
    const angle = useMotionValue(0);
    const [pastSpine, setPastSpine] = useState(false);

    useMotionValueEvent(angle, 'change', (value) => setPastSpine(value < -90));

    useEffect(() => {
        const controls = animate(angle, -180, {
            duration: INTRO_FLIP_MS / 1000,
            delay: 0.15,
            ease: [0.5, 0, 0.2, 1],
        });
        return () => controls.stop();
    }, [angle]);

    return (
        <motion.div
            className="absolute inset-0 z-40 cursor-pointer"
            style={{ rotateY: angle, transformOrigin: 'left center', transformPerspective: 2200 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + INTRO_FLIP_MS / 1000 }}
            onClick={onSkip}
            aria-hidden
        >
            <div className={cn('absolute inset-0', pastSpine && 'invisible')}>
                <CoverArt course={course} accent={accent} />
            </div>
            {/* Mirrored once more so it reads correctly after the leaf has turned over */}
            <div className={cn('absolute inset-0', !pastSpine && 'invisible')} style={{ transform: 'scaleX(-1)' }}>
                <EndPaper accent={accent} />
            </div>
        </motion.div>
    );
};

interface PageProgressProps {
    page: number;
    total: number;
    completed: number;
    bookmarkPage: number;
    onSeek: (index: number) => void;
}

/** "Page 3 of 20" + a bar you can click to jump around, with a flag where the bookmark is. */
const PageProgress: React.FC<PageProgressProps> = ({ page, total, completed, bookmarkPage, onSeek }) => {
    const position = total > 0 ? (page / total) * 100 : 0;
    const completion = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="text-white">
            <div className="mb-1 flex items-end justify-between gap-3 text-[11px] font-extrabold uppercase tracking-widest">
                <span aria-live="polite">
                    {total > 0 ? (
                        <>Page <span className="text-lg tracking-normal">{page}</span> of {total}</>
                    ) : (
                        'No pages yet'
                    )}
                </span>
                <span className="text-white/70">{completed} completed · {completion}%</span>
            </div>
            <div
                className={cn('relative py-2', total > 0 && 'cursor-pointer')}
                onClick={(e) => {
                    if (total === 0) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    onSeek(Math.min(total - 1, Math.max(0, Math.floor(ratio * total))));
                }}
                title={total > 0 ? 'Click to jump to a page' : undefined}
            >
                <div
                    className="relative h-3 rounded-full bg-black/30 shadow-inner"
                    role="progressbar"
                    aria-label="Page progress"
                    aria-valuemin={0}
                    aria-valuemax={total}
                    aria-valuenow={page}
                >
                    <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-200 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.55)] transition-[width] duration-700"
                        style={{ width: `${position}%` }}
                    />
                    {bookmarkPage > 0 && total > 0 && (
                        <Bookmark
                            className="absolute -top-2.5 h-4 w-4 -translate-x-1/2 fill-red-500 text-red-600 drop-shadow"
                            style={{ left: `${(bookmarkPage / total) * 100}%` }}
                            aria-label={`Bookmark at page ${bookmarkPage}`}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export const BookReader: React.FC<BookReaderProps> = ({
    course, lessons, onBack, onEditCourse, onDeleteCourse, focusLessonId,
}) => {
    const { deleteLesson, reorderLesson, setLessonStatus, setAllLessonsStatus, setBookmark } = useLmsStore();
    const { soundEnabled, toggleSound } = useSettingsStore();
    const bookmarkId = course.bookmarkLessonId ?? undefined;
    const lastReadId = useLmsReaderStore(s => s.lastRead[course.id]);
    const setLastRead = useLmsReaderStore(s => s.setLastRead);
    const pageEffects = useLmsReaderStore(s => s.pageEffects);
    const togglePageEffects = useLmsReaderStore(s => s.togglePageEffects);

    // Deliberately a reader setting rather than the OS "reduce motion" flag: the turning pages are the
    // point of this view, and the rest of the app doesn't follow that flag either.
    const reduceMotion = !pageEffects;
    const accent = course.color || '#8b5cf6';

    const sorted = useMemo(() => [...lessons].sort((a, b) => a.order - b.order), [lessons]);
    const total = sorted.length;
    const completed = sorted.filter(l => l.status === 'completed').length;

    // Where to open: a lesson asked for explicitly → the bookmark → where it was left → page 1
    const resolveStart = (): string | null => {
        const exists = (id?: string | null) => !!id && sorted.some(l => l.id === id);
        if (exists(focusLessonId)) return focusLessonId as string;
        if (exists(bookmarkId)) return bookmarkId as string;
        if (exists(lastReadId)) return lastReadId;
        return sorted[0]?.id ?? null;
    };

    const [activeId, setActiveId] = useState<string | null>(resolveStart);
    const [turn, setTurn] = useState<Turn | null>(null);
    const [intro, setIntro] = useState(() => !reduceMotion);
    const [leftVisible, setLeftVisible] = useState(() => reduceMotion);
    const [contentsOpen, setContentsOpen] = useState(false);
    const [isLessonModalOpen, setLessonModalOpen] = useState(false);
    const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);

    const rootRef = useRef<HTMLDivElement>(null);
    const turnRef = useRef<Turn | null>(null);
    const turnTimer = useRef<number | undefined>(undefined);
    const lastIndexRef = useRef(0);
    const addingRef = useRef<{ count: number } | null>(null);

    const foundIndex = activeId ? sorted.findIndex(l => l.id === activeId) : -1;
    const index = total === 0 ? -1 : foundIndex >= 0 ? foundIndex : Math.min(lastIndexRef.current, total - 1);
    const activeLesson = index >= 0 ? sorted[index] : null;
    const bookmarkIndex = bookmarkId ? sorted.findIndex(l => l.id === bookmarkId) : -1;
    const lessonById = useMemo(() => new Map(sorted.map(l => [l.id, l])), [sorted]);

    // Keep following the same lesson if the list changes underneath us (reorder, delete, late data load)
    useEffect(() => {
        if (foundIndex >= 0) {
            lastIndexRef.current = foundIndex;
        } else if (total > 0) {
            setActiveId(sorted[Math.min(lastIndexRef.current, total - 1)].id);
        }
    }, [foundIndex, total, sorted]);

    // Remember where the book was left open
    useEffect(() => {
        if (activeLesson) setLastRead(course.id, activeLesson.id);
    }, [activeLesson?.id, course.id, setLastRead]);

    // Cover-opening intro: reveal the contents page as the cover lands, then clear the cover away
    useEffect(() => {
        if (!intro) {
            setLeftVisible(true);
            return;
        }
        const reveal = window.setTimeout(() => setLeftVisible(true), (INTRO_FLIP_MS + 150) * 1.05);
        const clear = window.setTimeout(() => setIntro(false), INTRO_FLIP_MS + 600);
        return () => {
            window.clearTimeout(reveal);
            window.clearTimeout(clear);
        };
    }, [intro]);

    useEffect(() => () => window.clearTimeout(turnTimer.current), []);

    // The shelf may have been scrolled — bring the freshly opened book into view
    useEffect(() => {
        rootRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // After adding a lesson from the book, jump to the new last page
    useEffect(() => {
        if (addingRef.current && total > addingRef.current.count) {
            addingRef.current = null;
            turnTo(sorted[total - 1].id);
        }
    }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!isLessonModalOpen) addingRef.current = null;
    }, [isLessonModalOpen]);

    // ── Page turning ────────────────────────────────────────────────────────────
    const finishTurn = () => {
        window.clearTimeout(turnTimer.current);
        const current = turnRef.current;
        if (!current) return;
        turnRef.current = null;
        setActiveId(current.toId);
        setTurn(null);
    };

    const turnTo = (toId: string) => {
        if (turnRef.current || !activeLesson || toId === activeLesson.id) return;
        const toIndex = sorted.findIndex(l => l.id === toId);
        if (toIndex < 0) return;

        if (soundEnabled) {
            resumeAudio();
            playPageTurn();
        }
        if (reduceMotion) {
            setActiveId(toId);
            return;
        }

        const next: Turn = { fromId: activeLesson.id, toId, dir: toIndex > index ? 1 : -1 };
        turnRef.current = next;
        setTurn(next);
        // Safety net: never leave the book stuck mid-turn if the animation callback is missed
        window.clearTimeout(turnTimer.current);
        turnTimer.current = window.setTimeout(finishTurn, TURN_MS + 200);
    };

    const goNext = () => {
        if (index >= 0 && index < total - 1) turnTo(sorted[index + 1].id);
    };
    const goPrev = () => {
        if (index > 0) turnTo(sorted[index - 1].id);
    };

    // ── Lesson actions ──────────────────────────────────────────────────────────
    const toggleBookmark = (lesson: Lesson) => {
        if (bookmarkId === lesson.id) {
            setBookmark(course.id, null);
            toast('Bookmark removed', { icon: '🔖' });
        } else {
            setBookmark(course.id, lesson.id);
            toast.success(`Bookmarked page ${sorted.findIndex(l => l.id === lesson.id) + 1}`);
        }
    };

    const celebrateFinish = () => {
        triggerConfetti();
        if (soundEnabled) {
            resumeAudio();
            playLevelUp();
        }
        toast.success('You finished the book! 🎉');
    };

    /** Returns true when this change finished the whole book. */
    const changeStatus = (lesson: Lesson, status: LessonStatus): boolean => {
        const finishesBook =
            status === 'completed' &&
            lesson.status !== 'completed' &&
            sorted.every(l => l.id === lesson.id || l.status === 'completed');

        setLessonStatus(lesson.id, status);
        if (finishesBook) celebrateFinish();
        return finishesBook;
    };

    /** Contents page tick: complete ↔ incomplete. */
    const toggleComplete = (lesson: Lesson) =>
        changeStatus(lesson, lesson.status === 'completed' ? 'not_started' : 'completed');

    /** Contents page header button: the whole book at once (asks first — it touches every page). */
    const setAllStatus = (status: LessonStatus) => {
        if (total === 0) return;
        const message = status === 'completed'
            ? `Mark all ${total} pages as complete?`
            : `Mark all ${total} pages as incomplete? This resets your progress in this book.`;
        if (!window.confirm(message)) return;

        const finishesBook = status === 'completed' && completed < total;
        setAllLessonsStatus(course.id, status);
        if (finishesBook) celebrateFinish();
        else toast.success(status === 'completed' ? 'All pages marked complete' : 'All pages marked incomplete');
    };

    const completeAndTurn = (lesson: Lesson) => {
        const finishedBook = changeStatus(lesson, 'completed');
        if (!finishedBook) goNext();
    };

    const handleAddLesson = () => {
        addingRef.current = { count: total };
        setLessonToEdit(null);
        setLessonModalOpen(true);
    };

    const handleEditLesson = (lesson: Lesson) => {
        setLessonToEdit(lesson);
        setLessonModalOpen(true);
    };

    const handleDeleteLesson = (lesson: Lesson) => {
        const plainTitle = stripHtml(lesson.title) || 'this lesson';
        if (!window.confirm(`Delete "${plainTitle}"? This cannot be undone.`)) return;

        const at = sorted.findIndex(l => l.id === lesson.id);
        const neighbour = sorted[at + 1] ?? sorted[at - 1];
        setActiveId(neighbour?.id ?? null);
        deleteLesson(lesson.id); // also clears the bookmark if it was on this page
    };

    // ── Input: keyboard + swipe ─────────────────────────────────────────────────
    const keysRef = useRef({ goNext, goPrev, toggle: () => {}, closeContents: () => {}, blocked: false });
    keysRef.current = {
        goNext,
        goPrev,
        toggle: () => activeLesson && toggleBookmark(activeLesson),
        closeContents: () => setContentsOpen(false),
        blocked: isLessonModalOpen,
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const keys = keysRef.current;
            if (e.key === 'Escape') {
                keys.closeContents();
                return;
            }
            if (keys.blocked || e.metaKey || e.ctrlKey || e.altKey) return;

            const target = e.target as HTMLElement | null;
            if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return;

            if (e.key === 'ArrowRight') keys.goNext();
            else if (e.key === 'ArrowLeft') keys.goPrev();
            else if (e.key.toLowerCase() === 'b') keys.toggle();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Mouse drags are for selecting text — only fingers and pens turn pages
        if ((event as PointerEvent).pointerType === 'mouse') return;
        const { x, y } = info.offset;
        if (Math.abs(x) < 70 || Math.abs(x) < Math.abs(y) * 1.5) return;
        if (x < 0) goNext();
        else goPrev();
    };

    // ── Rendering ───────────────────────────────────────────────────────────────
    const renderPage = (lesson: Lesson) => (
        <BookPage
            lesson={lesson}
            page={sorted.findIndex(l => l.id === lesson.id) + 1}
            total={total}
            accent={accent}
            isBookmarked={bookmarkId === lesson.id}
            onToggleBookmark={() => toggleBookmark(lesson)}
            onSetStatus={(status) => changeStatus(lesson, status)}
            onCompleteAndNext={() => completeAndTurn(lesson)}
            onTurnNext={goNext}
            onEdit={() => handleEditLesson(lesson)}
            onDelete={() => handleDeleteLesson(lesson)}
            onMove={(direction) => reorderLesson(lesson.id, direction)}
        />
    );

    const renderStage = () => {
        if (!activeLesson) {
            return (
                <div className={cn('flex h-full flex-col items-center justify-center gap-4 rounded-xl p-8 text-center shadow-md lg:rounded-l-sm', PAPER_CLASS)}>
                    <BookOpen className="h-10 w-10 text-stone-300" />
                    <div>
                        <h3 className="font-serif text-xl font-bold">This book is empty</h3>
                        <p className="mt-1 max-w-xs font-serif text-sm italic text-stone-400">
                            Every lesson becomes a page. Write the first one and embed its Notebook LM resource.
                        </p>
                    </div>
                    <button
                        onClick={handleAddLesson}
                        className="flex items-center gap-2 rounded-xl border-b-4 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-all active:translate-y-0.5 active:border-b-2"
                        style={{ backgroundColor: accent, borderColor: shadeHex(accent, -28) }}
                    >
                        <Plus className="h-4 w-4" />
                        Write page 1
                    </button>
                </div>
            );
        }

        const fromLesson = turn ? lessonById.get(turn.fromId) : undefined;
        const toLesson = turn ? lessonById.get(turn.toId) : undefined;

        if (turn && fromLesson && toLesson) {
            const underlay = turn.dir === 1 ? toLesson : fromLesson;
            const leaf = turn.dir === 1 ? fromLesson : toLesson;
            return (
                <>
                    {/* The page being uncovered (or about to be covered) */}
                    <div className="absolute inset-0">
                        {renderPage(underlay)}
                        <Shade
                            gradient="linear-gradient(90deg, rgba(0,0,0,0.42), rgba(0,0,0,0))"
                            from={turn.dir === 1 ? 1 : 0}
                            to={turn.dir === 1 ? 0 : 1}
                        />
                    </div>
                    {/* The page that's turning */}
                    <motion.div
                        key={`${turn.fromId}->${turn.toId}`}
                        className="absolute inset-0 z-20"
                        style={{ transformOrigin: 'left center', transformPerspective: 2200, backfaceVisibility: 'hidden' }}
                        initial={{ rotateY: turn.dir === 1 ? 0 : FLIP_ANGLE }}
                        animate={{ rotateY: turn.dir === 1 ? FLIP_ANGLE : 0 }}
                        transition={{ duration: TURN_MS / 1000, ease: TURN_EASE }}
                        onAnimationComplete={finishTurn}
                    >
                        {renderPage(leaf)}
                        <Shade
                            gradient="linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0.5))"
                            from={turn.dir === 1 ? 0 : 1}
                            to={turn.dir === 1 ? 1 : 0}
                        />
                    </motion.div>
                </>
            );
        }

        return <div className="absolute inset-0" key={activeLesson.id}>{renderPage(activeLesson)}</div>;
    };

    const pagesBehind = Math.min(3, Math.max(index, 0));
    const pagesAhead = Math.min(3, Math.max(total - 1 - index, 0));
    const atFirst = index <= 0;
    const atLast = index < 0 || index >= total - 1;
    const bookmarkElsewhere = bookmarkIndex >= 0 && bookmarkIndex !== index;
    const activeIsBookmarked = !!activeLesson && bookmarkId === activeLesson.id;

    const navButton =
        'flex items-center gap-1.5 rounded-2xl border-b-4 border-black/30 bg-white/15 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:bg-white/25 active:translate-y-0.5 active:border-b-2 disabled:pointer-events-none disabled:opacity-35';
    const pillButton =
        'flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-white/25';
    const headerButton =
        'rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800';

    return (
        <div ref={rootRef} className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to shelf
                </button>
                <div className="flex items-center gap-1">
                    <button
                        onClick={togglePageEffects}
                        className={headerButton}
                        title={pageEffects ? 'Page effects on — click to turn off' : 'Page effects off — click to turn on'}
                        aria-label={pageEffects ? 'Turn off page effects' : 'Turn on page effects'}
                        aria-pressed={pageEffects}
                    >
                        <Sparkles className={cn('h-4 w-4', pageEffects && 'text-amber-500')} />
                    </button>
                    <button
                        onClick={toggleSound}
                        className={headerButton}
                        title={soundEnabled ? 'Mute page-turn sounds' : 'Unmute page-turn sounds'}
                        aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
                    >
                        {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-500" /> : <VolumeX className="h-4 w-4" />}
                    </button>
                    <button onClick={() => onEditCourse(course)} className={cn(headerButton, 'hover:!text-primary')} title="Edit course" aria-label="Edit course">
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDeleteCourse(course)} className={cn(headerButton, 'hover:!text-red-500')} title="Delete course" aria-label="Delete course">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Leather-bound book */}
            <div
                className="relative overflow-hidden rounded-[28px] p-3 shadow-2xl sm:p-5"
                style={{ background: `linear-gradient(135deg, ${shadeHex(accent, -8)} 0%, ${shadeHex(accent, -48)} 100%)` }}
            >
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }}
                />

                <div className="relative">
                    <div className="mb-3 flex items-center justify-between gap-3 text-white">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="text-3xl drop-shadow">{course.emoji || '📚'}</span>
                            <div className="min-w-0">
                                <h2 className="truncate font-serif text-xl font-black leading-tight">{course.title}</h2>
                                {course.category && (
                                    <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-white/65">{course.category}</p>
                                )}
                            </div>
                        </div>
                        <button onClick={handleAddLesson} className={cn(pillButton, 'shrink-0')}>
                            <Plus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Add page</span>
                        </button>
                    </div>

                    <PageProgress
                        page={index + 1}
                        total={total}
                        completed={completed}
                        bookmarkPage={bookmarkIndex + 1}
                        onSeek={(i) => turnTo(sorted[i].id)}
                    />

                    {/* The open book: contents on the left (wide screens), the current page on the right */}
                    <div className="relative mt-2 grid grid-cols-1 lg:grid-cols-2">
                        <div
                            className={cn(
                                'relative hidden transition-opacity duration-300 lg:block',
                                PAGE_HEIGHT_CLASS,
                                leftVisible ? 'opacity-100' : 'opacity-0'
                            )}
                        >
                            {Array.from({ length: pagesBehind }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute rounded-l-xl border border-stone-300/70 bg-stone-100 dark:border-stone-700 dark:bg-stone-800"
                                    style={{ left: -(i + 1) * 3, right: 0, top: (i + 1) * 2, bottom: -(i + 1) * 2 }}
                                />
                            ))}
                            <BookContents
                                course={course}
                                lessons={sorted}
                                activeId={activeLesson?.id ?? null}
                                bookmarkId={bookmarkId}
                                accent={accent}
                                onSelect={(id) => turnTo(id)}
                                onToggleComplete={toggleComplete}
                                onSetAllStatus={setAllStatus}
                                className="rounded-xl lg:rounded-r-sm"
                            />
                        </div>

                        <div className={cn('relative', PAGE_HEIGHT_CLASS)}>
                            {Array.from({ length: pagesAhead }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute rounded-r-xl border border-stone-300/70 bg-stone-100 dark:border-stone-700 dark:bg-stone-800"
                                    style={{ left: 0, right: -(i + 1) * 3, top: (i + 1) * 2, bottom: -(i + 1) * 2 }}
                                />
                            ))}
                            <motion.div
                                className={cn('absolute inset-0', turn && 'pointer-events-none')}
                                style={{ touchAction: 'pan-y' }}
                                onPanEnd={handlePanEnd}
                            >
                                {renderStage()}
                            </motion.div>
                            {intro && <CoverLeaf course={course} accent={accent} onSkip={() => { setIntro(false); setLeftVisible(true); }} />}
                        </div>
                    </div>

                    {/* Page controls */}
                    <div className="mt-5 flex items-center justify-between gap-2">
                        <button onClick={goPrev} disabled={atFirst || !!turn} className={navButton} aria-label="Previous page">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Previous</span>
                        </button>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <button onClick={() => setContentsOpen(true)} className={cn(pillButton, 'lg:hidden')}>
                                <ListOrdered className="h-3.5 w-3.5" />
                                Contents
                            </button>
                            {activeLesson && (
                                <button
                                    onClick={() => toggleBookmark(activeLesson)}
                                    className={cn(pillButton, activeIsBookmarked && '!bg-red-500/90 hover:!bg-red-500')}
                                    aria-pressed={activeIsBookmarked}
                                    title="Shortcut: B"
                                >
                                    {activeIsBookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                                    {activeIsBookmarked ? 'Bookmarked' : 'Bookmark'}
                                </button>
                            )}
                            {bookmarkElsewhere && (
                                <button onClick={() => turnTo(sorted[bookmarkIndex].id)} className={pillButton}>
                                    <Bookmark className="h-3.5 w-3.5 fill-red-400 text-red-400" />
                                    Go to page {bookmarkIndex + 1}
                                </button>
                            )}
                        </div>

                        <button onClick={goNext} disabled={atLast || !!turn} className={navButton} aria-label="Next page">
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Contents sheet for screens too narrow for the two-page spread */}
            <AnimatePresence>
                {contentsOpen && (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:hidden">
                        <motion.div
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setContentsOpen(false)}
                        />
                        <motion.div
                            className="relative h-[75dvh] w-full max-w-lg"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        >
                            <BookContents
                                course={course}
                                lessons={sorted}
                                activeId={activeLesson?.id ?? null}
                                bookmarkId={bookmarkId}
                                accent={accent}
                                onSelect={(id) => { setContentsOpen(false); turnTo(id); }}
                                onToggleComplete={toggleComplete}
                                onSetAllStatus={setAllStatus}
                                className="rounded-t-3xl"
                            />
                            <button
                                onClick={() => setContentsOpen(false)}
                                className="absolute right-3 top-3 rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
                                aria-label="Close contents"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isLessonModalOpen && (
                    <LessonFormModal
                        isOpen={isLessonModalOpen}
                        onClose={() => setLessonModalOpen(false)}
                        courseId={course.id}
                        lessonToEdit={lessonToEdit}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
