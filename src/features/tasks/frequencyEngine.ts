import { Task, TaskStatus } from '@/types/Task';
import { differenceInDays, differenceInWeeks, startOfWeek, getDay } from 'date-fns';

/**
 * Processes the daily reset logic for recurrent primary tasks.
 * Unfinished tasks from the previous day are considered skipped (their stats tracked).
 * Then they are reset to 'pending' for the new day if they are due.
 */
export const processDailyTasks = (
    tasks: Task[],
    lastOpenedDateStr: string,
    currentDateStr: string
): Task[] => {
    if (lastOpenedDateStr === currentDateStr) {
        return tasks; // Already processed today
    }

    const current = new Date(currentDateStr);
    const lastOpen = new Date(lastOpenedDateStr);
    const daysPassed = differenceInDays(current, lastOpen);

    if (daysPassed <= 0) return tasks;

    return tasks.map(task => {
        if (isTaskDueOn(task, currentDateStr)) {
            return {
                ...task,
                status: 'pending' as TaskStatus,
                subSteps: task.subSteps.map(step => ({ ...step, status: 'pending' }))
            };
        }
        return task;
    });
};

/**
 * Determines if a specific task is scheduled to appear on a given date.
 */
export const isTaskDueOn = (task: Task, dateStr: string): boolean => {
    // Only primary recurrent tasks are subject to frequency generation
    if (task.priority !== 'primary' || !task.frequency) return true;

    const current = new Date(dateStr);
    const createdAtStr = new Date(task.createdAt).toLocaleDateString('en-CA');
    const createdAt = new Date(createdAtStr);

    if (current < createdAt) return false;

    if (task.frequency === 'daily') {
        return true;
    }

    if (task.frequency === 'every_x_days' && task.frequencyInterval) {
        const totalDaysSinceCreation = differenceInDays(current, createdAt);
        return totalDaysSinceCreation >= 0 && totalDaysSinceCreation % task.frequencyInterval === 0;
    }

    if (task.frequency === 'weekly' && task.weekDays && task.weekDays.length > 0) {
        const todayDayIndex = getDay(current);
        if (task.weekDays.includes(todayDayIndex)) {
            const startOfCreationWeek = startOfWeek(createdAt, { weekStartsOn: 0 });
            const startOfCurrentWeek = startOfWeek(current, { weekStartsOn: 0 });
            const weeksPassed = differenceInWeeks(startOfCurrentWeek, startOfCreationWeek);

            return weeksPassed >= 0 && weeksPassed % (task.weekInterval || 1) === 0;
        }
    }

    return false;
};
