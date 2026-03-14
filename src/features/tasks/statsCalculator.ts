import { Task } from '@/types/Task';
import { computeVisibleQueue } from './taskQueue';
import { getTaskStatusForDate } from '@/utils/taskHelpers';

/**
 * Calculates global stats based on the current task list.
 * Only factors in Primary tasks and the CURRENTLY ACTIVE Secondary/Tertiary queue items.
 */
export const calculateStats = (tasks: Task[], targetDate: string, sessionTaskIds?: string[]) => {
    // 1. Get all primary tasks (these are always "today's tasks")
    const primaryTasks = tasks.filter(t => t.priority === 'primary');

    // 2. Get the currently active queue for today
    let visibleSecondary: Task[] = [];
    let visibleTertiary: Task[] = [];
    
    if (sessionTaskIds) {
        // If we have a locked session, these are the tasks that form the active queue board,
        // regardless of whether they are currently pending or have been completed today.
        const sessionTasks = tasks.filter(t => sessionTaskIds.includes(t.id));
        visibleSecondary = sessionTasks.filter(t => t.priority === 'secondary' || t.priority === 'high');
        visibleTertiary = sessionTasks.filter(t => t.priority === 'tertiary' || t.priority === 'middle' || t.priority === 'low');
    } else {
        const computed = computeVisibleQueue(tasks);
        visibleSecondary = computed.visibleSecondary;
        visibleTertiary = computed.visibleTertiary;
    }

    // 3. Combine them to represent "Today's Active Board"
    const activeTodayTasks = [
        ...primaryTasks,
        ...visibleSecondary,
        ...visibleTertiary
    ];

    const totalTasks = activeTodayTasks.length;

    // We only count completions/skips that happened within this active board on the target date.
    const completedToday = activeTodayTasks.filter((t) => getTaskStatusForDate(t, targetDate) === 'done').length;
    const skippedToday = activeTodayTasks.filter((t) => getTaskStatusForDate(t, targetDate) === 'skipped').length;

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
