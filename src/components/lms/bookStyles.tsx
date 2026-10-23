import { LucideIcon, CircleDashed, CircleDot, CheckCircle2 } from 'lucide-react';
import { LessonStatus } from '@/types/Lms';

export const STATUS_META: Record<LessonStatus, { label: string; color: string; Icon: LucideIcon }> = {
    not_started: { label: 'Not Started', color: '#94a3b8', Icon: CircleDashed },
    in_progress: { label: 'In Progress', color: '#f59e0b', Icon: CircleDot },
    completed: { label: 'Completed', color: '#10b981', Icon: CheckCircle2 },
};

export const STATUS_ORDER: LessonStatus[] = ['not_started', 'in_progress', 'completed'];

/** Paper surface shared by the contents page and the lesson pages. */
export const PAPER_CLASS =
    'bg-[#fdfaf2] dark:bg-stone-900 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-800';

/** Both halves of the open book share one height so the spread lines up. */
export const PAGE_HEIGHT_CLASS = 'h-[min(72vh,680px)] min-h-[460px]';

/** Hanging ribbon bookmark shape. */
export const RIBBON_CLIP = 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)';

/** The wooden board a row of books stands on. */
export const SHELF_PLANK_CLASS =
    'pointer-events-none absolute inset-x-0 bottom-0 h-3.5 bg-gradient-to-b from-amber-700 via-amber-800 to-stone-800 shadow-md dark:from-stone-600 dark:via-stone-700 dark:to-stone-900';
