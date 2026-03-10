import { Task } from '@/types/Task';
import { computeVisibleQueue } from './taskQueue';

/**
 * Calculates global stats based on the current task list.
 * Only factors in Primary tasks and the CURRENTLY ACTIVE Secondary/Tertiary queue items.
 */
export const calculateStats = (tasks: Task[]) => {
    // 1. Get all primary tasks (these are always "today's tasks")
    const primaryTasks = tasks.filter(t => t.priority === 'primary');

    // 2. Get the currently active queue for today
    const { visibleSecondary, visibleTertiary } = computeVisibleQueue(tasks);

    // 3. Combine them to represent "Today's Active Board"
    const activeTodayTasks = [
        ...primaryTasks,
        ...visibleSecondary,
        ...visibleTertiary
    ];

    const totalTasks = activeTodayTasks.length;

    // We only count completions/skips that happened within this active board.
    const completedToday = activeTodayTasks.filter((t) => t.status === 'done').length;
    const skippedToday = activeTodayTasks.filter((t) => t.status === 'skipped').length;

    const completionRate = totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0;

    const totalStepsCompleted = activeTodayTasks.reduce((sum, task) => {
        return sum + task.subSteps.filter(s => s.status === 'done').length;
    }, 0);

    return {
        totalTasks,
        completedToday,
        skippedToday,
        completionRate: Math.round(completionRate),
        totalStepsCompleted
    };
};
