import { Task } from '@/types/Task';

export const getTaskProgress = (task: Task) => {
    if (task.subSteps.length === 0) {
        return task.status === 'done' ? 100 : 0;
    }
    const completed = task.subSteps.filter(s => s.status === 'done').length;
    return Math.round((completed / task.subSteps.length) * 100);
};

export const getTaskStepStats = (task: Task) => {
    const completed = task.subSteps.filter(s => s.status === 'done').length;
    const total = task.subSteps.length;
    return { completed, total, pending: total - completed };
};

export const getTaskStatusForDate = (task: Task, dateStr: string): Task['status'] => {
    // If the task has history, check if there's an entry for the specific date
    if (task.history && task.history.length > 0) {
        const historyEntry = task.history.find(h => h.date === dateStr);
        if (historyEntry) {
            return historyEntry.status;
        }
    }
    
    // For primary tasks, if there's no history for the date, it's pending.
    // Base status is largely for backward compatibility or one-off tasks.
    if (task.priority === 'primary') {
        return 'pending';
    }

    // Fallback to base status for random/queue tasks that don't rely heavily on date history yet,
    // or if no history exists at all.
    return task.status;
};
