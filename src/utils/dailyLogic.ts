import type { ReminderState, StudyState } from '../types/Daily';

/** Local calendar day as YYYY-MM-DD (the same shape the rest of the app uses for dates). */
export function todayStr(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export const SNOOZE_MS = 60 * 60 * 1000;

type Rand = () => number;

function pickOne<T>(items: T[], rand: Rand): T | null {
    if (items.length === 0) return null;
    return items[Math.min(items.length - 1, Math.floor(rand() * items.length))];
}

// ── Daily reminder (goals & plans) ────────────────────────────────────────────

export interface ReminderResolution<T> {
    state: ReminderState;
    /** The reminder to show right now, or null (nothing to show / already acknowledged today). */
    show: T | null;
}

/**
 * Decides which goal/plan to remind about.
 *  - once today's has been acknowledged, nothing more shows that day
 *  - a pending pick stays put (even across days) until it is acknowledged
 *  - otherwise a new one is picked from those not yet acknowledged in this round
 */
export function resolveReminder<T extends { key: string }>(
    state: ReminderState,
    candidates: T[],
    today: string,
    rand: Rand = Math.random
): ReminderResolution<T> {
    const keys = new Set(candidates.map(c => c.key));
    let next: ReminderState = { ...state, acknowledged: state.acknowledged.filter(k => keys.has(k)) };

    if (candidates.length === 0) return { state: next, show: null };
    if (next.lastAckDate === today) return { state: next, show: null };

    if (next.currentKey && keys.has(next.currentKey) && !next.acknowledged.includes(next.currentKey)) {
        return { state: next, show: candidates.find(c => c.key === next.currentKey) ?? null };
    }

    let pool = candidates.filter(c => !next.acknowledged.includes(c.key));
    if (pool.length === 0) {
        // Everything acknowledged → a fresh round, avoiding an immediate repeat when there's a choice
        next = { ...next, acknowledged: [], cycle: next.cycle + 1 };
        pool = candidates.length > 1 ? candidates.filter(c => c.key !== next.lastAckKey) : candidates;
    }

    const pick = pickOne(pool, rand);
    if (!pick) return { state: next, show: null };
    return { state: { ...next, currentKey: pick.key, currentDate: today }, show: pick };
}

export interface AcknowledgeResult {
    state: ReminderState;
    /** True when this acknowledgement finished the round and the list was reset. */
    roundCompleted: boolean;
}

export function acknowledgeReminder(
    state: ReminderState,
    key: string,
    today: string,
    allKeys: string[]
): AcknowledgeResult {
    const acknowledged = state.acknowledged.includes(key) ? state.acknowledged : [...state.acknowledged, key];
    const roundCompleted = allKeys.length > 0 && allKeys.every(k => acknowledged.includes(k));

    return {
        roundCompleted,
        state: {
            ...state,
            acknowledged: roundCompleted ? [] : acknowledged,
            cycle: roundCompleted ? state.cycle + 1 : state.cycle,
            currentKey: null,
            currentDate: null,
            lastAckDate: today,
            lastAckKey: key,
        },
    };
}

// ── Daily study (one Study Roulette item + one LMS lesson) ────────────────────

/**
 * Keeps one slot's pick, or chooses a new one.
 *  - an unfinished pick stays until it is finished
 *  - a pick finished *today* stays (so the modal can show it as done)
 *  - a pick finished before today is replaced by a fresh random one
 *  - an empty list is treated as "data not loaded yet": never wipe an existing pick
 */
function resolveSlot<T extends { id: string }>(
    currentId: string | null,
    items: T[],
    isDone: (item: T) => boolean,
    dayRolled: boolean,
    rand: Rand
): string | null {
    const current = currentId ? items.find(i => i.id === currentId) : undefined;
    const pool = items.filter(i => !isDone(i));

    if (current && !isDone(current)) return current.id;
    if (current && isDone(current)) {
        if (!dayRolled) return current.id;
        return pickOne(pool.filter(i => i.id !== current.id), rand)?.id ?? null;
    }
    // The pick is gone (deleted) or there was none yet
    if (currentId && items.length === 0) return currentId;
    return pickOne(pool, rand)?.id ?? null;
}

export interface StudyResolution {
    state: StudyState;
    rouletteId: string | null;
    lessonId: string | null;
}

export function resolveStudy<R extends { id: string }, L extends { id: string }>(
    state: StudyState,
    rouletteItems: R[],
    lessons: L[],
    isRouletteDone: (item: R) => boolean,
    isLessonDone: (lesson: L) => boolean,
    today: string,
    rand: Rand = Math.random
): StudyResolution {
    const dayRolled = state.date !== today;
    const rouletteId = resolveSlot(state.rouletteId, rouletteItems, isRouletteDone, dayRolled, rand);
    const lessonId = resolveSlot(state.lessonId, lessons, isLessonDone, dayRolled, rand);

    return {
        rouletteId,
        lessonId,
        state: { ...state, date: today, rouletteId, lessonId },
    };
}

export function isSnoozed(state: StudyState, now: number): boolean {
    return state.snoozedUntil !== null && state.snoozedUntil > now;
}
