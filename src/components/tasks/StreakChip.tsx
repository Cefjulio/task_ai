import React, { useEffect, useState } from 'react';
import { STREAK_WINDOW_MS, useStreakStore } from '@/store/streakStore';

/** "🔥 3 in a row" — shows while you keep ticking things off, fades out after a quiet minute and a half. */
export const StreakChip: React.FC = () => {
    const count = useStreakStore(s => s.count);
    const lastAt = useStreakStore(s => s.lastAt);
    const [, rerender] = useState(0);

    // Re-check once the streak window has run out so the chip disappears on its own
    useEffect(() => {
        if (count < 2) return undefined;
        const remaining = STREAK_WINDOW_MS - (Date.now() - lastAt);
        if (remaining <= 0) return undefined;
        const timer = window.setTimeout(() => rerender(n => n + 1), remaining + 50);
        return () => window.clearTimeout(timer);
    }, [count, lastAt]);

    if (count < 2 || Date.now() - lastAt > STREAK_WINDOW_MS) return null;

    return (
        // Re-keyed on every increment so the pop animation replays
        <span
            key={count}
            className="check-pop inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            title="Tasks and steps you've finished in a row"
        >
            🔥 {count}
            <span className="hidden sm:inline">in a row</span>
        </span>
    );
};
