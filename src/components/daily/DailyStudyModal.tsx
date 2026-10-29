import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
    BookOpen, Check, Dices, ExternalLink, Eye, EyeOff, FileText, Globe, GraduationCap,
    Headphones, Moon, RotateCcw, Video, X,
} from 'lucide-react';
import { Course, Lesson } from '@/types/Lms';
import { StudyContentType, StudyItem } from '@/types/StudyItem';
import { QuillContent } from '@/components/ui/QuillContent';
import { cn } from '@/components/ui/Button';
import { stripHtml } from '@/utils/htmlUtils';
import { dailyFx } from '@/utils/dailyFx';
import { ModalShell, Sparkles } from './ModalShell';
import { PreviewKind, ResourcePreview } from './ResourcePreview';

const TYPE_META: Record<StudyContentType, { label: string; Icon: React.ElementType; color: string }> = {
    youtube: { label: 'Video', Icon: Video, color: 'text-red-500' },
    pdf: { label: 'PDF', Icon: FileText, color: 'text-orange-500' },
    audio: { label: 'Audio', Icon: Headphones, color: 'text-purple-500' },
    webpage: { label: 'Web page', Icon: Globe, color: 'text-sky-500' },
};

const primaryButton =
    'flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 px-4 py-3 text-sm font-black text-white shadow-md transition-transform active:translate-y-0.5 active:border-b-2';
const secondaryButton =
    'flex items-center justify-center gap-2 rounded-2xl border-b-4 border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-600 shadow-sm transition-transform hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700';

// ── One slot (card) ──────────────────────────────────────────────────────────

interface SlotCardProps {
    accent: string;
    label: string;
    icon: React.ReactNode;
    done: boolean;
    onUndo?: () => void;
    children: React.ReactNode;
}

const SlotCard: React.FC<SlotCardProps> = ({ accent, label, icon, done, onUndo, children }) => (
    <motion.div
        layout
        className="relative flex min-w-0 flex-col gap-3 rounded-3xl border-2 bg-white p-5 dark:bg-slate-900"
        style={{ borderColor: done ? 'rgba(16,185,129,0.45)' : `${accent}45` }}
    >
        <div className="flex items-center justify-between gap-2">
            <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider"
                style={{ backgroundColor: `${accent}1c`, color: accent }}
            >
                {icon}
                {label}
            </span>
            {done && (
                <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 14 }}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white"
                >
                    <Check className="h-3 w-3" strokeWidth={4} /> Done today
                </motion.span>
            )}
        </div>
        {children}
        {done && onUndo && (
            <button onClick={onUndo} className="flex items-center gap-1 self-start text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <RotateCcw className="h-3 w-3" /> Undo
            </button>
        )}
    </motion.div>
);

const EmptySlot: React.FC<{ accent: string; label: string; icon: React.ReactNode; message: string }> = ({ accent, label, icon, message }) => (
    <div className="flex flex-col gap-3 rounded-3xl border-2 border-dashed border-slate-200 p-5 dark:border-slate-700">
        <span className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider" style={{ backgroundColor: `${accent}1c`, color: accent }}>
            {icon}
            {label}
        </span>
        <p className="py-4 text-center text-sm text-slate-400">{message}</p>
    </div>
);

// ── Study Roulette item ──────────────────────────────────────────────────────

interface RouletteSlotProps {
    item: StudyItem;
    done: boolean;
    onComplete: (origin: HTMLElement) => void;
    onUndo: () => void;
}

const RouletteSlot: React.FC<RouletteSlotProps> = ({ item, done, onComplete, onUndo }) => {
    const [showPreview, setShowPreview] = useState(false);
    const meta = TYPE_META[item.contentType] ?? TYPE_META.webpage;
    const description = stripHtml(item.description || '');
    const hasUrl = !!item.contentUrl?.trim();

    return (
        <SlotCard accent="#6366f1" label="Study Roulette" icon={<Dices className="h-3.5 w-3.5" />} done={done} onUndo={onUndo}>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <meta.Icon className={cn('h-4 w-4', meta.color)} />
                {meta.label}
            </div>
            <h3 className="line-clamp-3 [overflow-wrap:anywhere] text-lg font-black leading-snug text-slate-900 dark:text-white">{item.title}</h3>
            {description && <p className="line-clamp-2 [overflow-wrap:anywhere] text-sm text-slate-500 dark:text-slate-400">{description}</p>}

            <div>
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="min-w-0 truncate">{item.lastPageRead ? <>Last at <span className="text-slate-700 dark:text-slate-200">{item.lastPageRead}</span></> : 'Not started yet'}</span>
                    <span className="shrink-0 pl-2">{item.completionPercentage}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500" style={{ width: `${item.completionPercentage}%` }} />
                </div>
            </div>

            {showPreview && hasUrl && <ResourcePreview kind={item.contentType as PreviewKind} url={item.contentUrl} title={item.title} />}

            {!done && (
                <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                        {hasUrl ? (
                            <a href={item.contentUrl} target="_blank" rel="noopener noreferrer" className={cn(primaryButton, 'border-primary-dark bg-primary')}>
                                <ExternalLink className="h-4 w-4" /> Open
                            </a>
                        ) : (
                            <span className={cn(secondaryButton, 'flex-1 cursor-default')}>No link saved</span>
                        )}
                        {hasUrl && (
                            <button onClick={() => setShowPreview(v => !v)} className={secondaryButton} aria-pressed={showPreview}>
                                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showPreview ? 'Hide' : 'Preview'}
                            </button>
                        )}
                    </div>
                    <button onClick={(e) => onComplete(e.currentTarget)} className={cn(primaryButton, 'w-full border-emerald-700 bg-emerald-500')}>
                        <Check className="h-4 w-4" strokeWidth={3} /> Mark as done
                    </button>
                </div>
            )}
        </SlotCard>
    );
};

// ── LMS lesson ───────────────────────────────────────────────────────────────

interface LessonSlotProps {
    lesson: Lesson;
    course: Course | null;
    done: boolean;
    onComplete: (origin: HTMLElement) => void;
    onUndo: () => void;
    onOpenInBook: () => void;
}

const LessonSlot: React.FC<LessonSlotProps> = ({ lesson, course, done, onComplete, onUndo, onOpenInBook }) => {
    const [showPreview, setShowPreview] = useState(false);
    const accent = course?.color || '#8b5cf6';
    const notes = stripHtml(lesson.content || '');
    const hasUrl = !!lesson.resourceUrl?.trim();

    return (
        <SlotCard accent={accent} label="LMS lesson" icon={<GraduationCap className="h-3.5 w-3.5" />} done={done} onUndo={onUndo}>
            {course && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="text-base">{course.emoji || '📚'}</span>
                    <span className="truncate">{course.title}</span>
                </div>
            )}
            <QuillContent html={lesson.title} className="!p-0 line-clamp-3 [overflow-wrap:anywhere] text-lg font-black leading-snug text-slate-900 dark:text-white [&_p]:m-0" />
            {notes && <p className="line-clamp-2 [overflow-wrap:anywhere] text-sm text-slate-500 dark:text-slate-400">{notes}</p>}

            {showPreview && hasUrl && <ResourcePreview kind="webpage" url={lesson.resourceUrl} title={stripHtml(lesson.title)} />}

            {!done && (
                <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                        {hasUrl ? (
                            <a
                                href={lesson.resourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={primaryButton}
                                style={{ backgroundColor: accent, borderColor: 'rgba(0,0,0,0.28)' }}
                            >
                                <ExternalLink className="h-4 w-4" /> Open lesson
                            </a>
                        ) : (
                            <span className={cn(secondaryButton, 'flex-1 cursor-default')}>No link saved</span>
                        )}
                        <button onClick={onOpenInBook} className={secondaryButton} title="Open this lesson in its book">
                            <BookOpen className="h-4 w-4" />
                            Book
                        </button>
                        {hasUrl && (
                            <button onClick={() => setShowPreview(v => !v)} className={secondaryButton} aria-pressed={showPreview} title="Try an inline preview">
                                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                    <button onClick={(e) => onComplete(e.currentTarget)} className={cn(primaryButton, 'w-full border-emerald-700 bg-emerald-500')}>
                        <Check className="h-4 w-4" strokeWidth={3} /> Mark as done
                    </button>
                </div>
            )}
        </SlotCard>
    );
};

// ── The modal ────────────────────────────────────────────────────────────────

interface DailyStudyModalProps {
    rouletteItem: StudyItem | null;
    rouletteDone: boolean;
    lesson: Lesson | null;
    lessonDone: boolean;
    course: Course | null;
    onCompleteRoulette: (origin: HTMLElement) => void;
    onUndoRoulette: () => void;
    onCompleteLesson: (origin: HTMLElement) => void;
    onUndoLesson: () => void;
    onOpenInBook: () => void;
    /** Hide for an hour (also what the ✕ does). */
    onSnooze: () => void;
    /** Only reachable once there is nothing left to do today. */
    onClose: () => void;
}

export const DailyStudyModal: React.FC<DailyStudyModalProps> = ({
    rouletteItem, rouletteDone, lesson, lessonDone, course,
    onCompleteRoulette, onUndoRoulette, onCompleteLesson, onUndoLesson, onOpenInBook, onSnooze, onClose,
}) => {
    useEffect(() => { dailyFx.studyAppears(); }, []);

    const slots = [rouletteItem && { done: rouletteDone }, lesson && { done: lessonDone }].filter(Boolean) as { done: boolean }[];
    const doneCount = slots.filter(s => s.done).length;
    const allDone = slots.length > 0 && doneCount === slots.length;

    return (
        <ModalShell label="Today's study" widthClass="sm:max-w-3xl">
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-500 to-cyan-400 px-6 pb-6 pt-7 text-white sm:px-8">
                <Sparkles />
                {!allDone && (
                    <button
                        onClick={onSnooze}
                        className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/30"
                        aria-label="Snooze for 1 hour"
                        title="Snooze for 1 hour"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
                <div className="relative flex items-center gap-4 pr-10">
                    <div className="animate-float flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-3xl shadow-lg ring-4 ring-white/20 backdrop-blur-sm">
                        {allDone ? '🎓' : '📚'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-white/80">{format(new Date(), 'EEEE, MMM d')}</p>
                        <h2 className="text-2xl font-black leading-tight sm:text-3xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            {allDone ? "You're done for today!" : "Today's study"}
                        </h2>
                    </div>
                </div>
                {slots.length > 0 && (
                    <div className="relative mt-4 flex items-center gap-3">
                        <div className="flex gap-1.5" aria-hidden>
                            {slots.map((s, i) => (
                                <span key={i} className={cn('h-2.5 w-10 rounded-full transition-colors', s.done ? 'bg-emerald-300' : 'bg-white/35')} />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-white/90">{doneCount} of {slots.length} done</span>
                    </div>
                )}
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6">
                <div className={cn('grid gap-4 [&>*]:min-w-0', slots.length > 1 || (!rouletteItem && !lesson) ? 'md:grid-cols-2' : 'grid-cols-1')}>
                    {rouletteItem ? (
                        <RouletteSlot item={rouletteItem} done={rouletteDone} onComplete={onCompleteRoulette} onUndo={onUndoRoulette} />
                    ) : (
                        <EmptySlot accent="#6366f1" label="Study Roulette" icon={<Dices className="h-3.5 w-3.5" />} message="Nothing left to pick here — add more items to Study Roulette." />
                    )}
                    {lesson ? (
                        <LessonSlot lesson={lesson} course={course} done={lessonDone} onComplete={onCompleteLesson} onUndo={onUndoLesson} onOpenInBook={onOpenInBook} />
                    ) : (
                        <EmptySlot accent="#8b5cf6" label="LMS lesson" icon={<GraduationCap className="h-3.5 w-3.5" />} message="No unfinished lessons — add lessons to your LMS books." />
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
                {allDone ? (
                    <button
                        onClick={onClose}
                        autoFocus
                        className="w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3.5 text-base font-black text-white shadow-lg transition-transform active:translate-y-0.5 active:border-b-2"
                    >
                        See you tomorrow 👋
                    </button>
                ) : (
                    <>
                        <p className="hidden text-xs text-slate-400 sm:block">Not now? It will come back in an hour.</p>
                        <button onClick={onSnooze} className={cn(secondaryButton, 'w-full sm:w-auto')}>
                            <Moon className="h-4 w-4" /> Snooze 1 hour
                        </button>
                    </>
                )}
            </div>
        </ModalShell>
    );
};
