import { Task } from '@/types/Task';

export interface QueueState {
    visibleSecondary: Task[];
    visibleTertiary: Task[];
    fullSecondary: Task[];
    fullTertiary: Task[];
}

/**
 * Selects 2 Secondary tasks and 1 Tertiary task with the lowest completions.
 * Ignores tasks that are currently 'done' or 'skipped'.
 */
export const computeVisibleQueue = (tasks: Task[]): QueueState => {
    // Map 'high' to secondary slot, 'middle/low' to tertiary slot for categorization
    const pendingSecondary = tasks.filter(t =>
        (t.priority === 'secondary' || t.priority === 'high') && t.status === 'pending'
    );
    const pendingTertiary = tasks.filter(t =>
        (t.priority === 'tertiary' || t.priority === 'middle' || t.priority === 'low') && t.status === 'pending'
    );

    // Sort: lowest completions first, then oldest creation date
    const sortByPriority = (list: Task[]) => {
        list.sort((a, b) => {
            if (a.completions === b.completions) {
                const timeA = new Date(a.lastQueuedAt || a.createdAt).getTime();
                const timeB = new Date(b.lastQueuedAt || b.createdAt).getTime();
                return timeA - timeB;
            }
            return a.completions - b.completions;
        });
    };

    sortByPriority(pendingSecondary);
    sortByPriority(pendingTertiary);

    return {
        visibleSecondary: pendingSecondary.slice(0, 2),
        visibleTertiary: pendingTertiary.slice(0, 1),
        fullSecondary: pendingSecondary.slice(2),
        fullTertiary: pendingTertiary.slice(1),
    };
};
