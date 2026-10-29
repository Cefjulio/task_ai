/** Which goal/plan the daily reminder is on, and which ones have been acknowledged this round. */
export interface ReminderState {
    /** Keys ("goal:<id>" / "plan:<id>") acknowledged in the current round. */
    acknowledged: string[];
    /** The reminder picked for the day; stays until it is acknowledged (even across days). */
    currentKey: string | null;
    currentDate: string | null;
    /** One reminder per day: set when today's has been acknowledged. */
    lastAckDate: string | null;
    lastAckKey: string | null;
    /** How many full rounds through every goal & plan have been completed. */
    cycle: number;
}

/** The two items picked for today's study, and whether the modal is snoozed. */
export interface StudyState {
    /** Day the picks were last evaluated (used to roll over to new picks). */
    date: string | null;
    rouletteId: string | null;
    lessonId: string | null;
    /** Epoch ms — the study modal stays away until then. */
    snoozedUntil: number | null;
}

export interface DailyState {
    reminder: ReminderState;
    study: StudyState;
}

export const EMPTY_DAILY_STATE: DailyState = {
    reminder: {
        acknowledged: [],
        currentKey: null,
        currentDate: null,
        lastAckDate: null,
        lastAckKey: null,
        cycle: 0,
    },
    study: {
        date: null,
        rouletteId: null,
        lessonId: null,
        snoozedUntil: null,
    },
};
