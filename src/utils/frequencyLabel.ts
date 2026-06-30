import { Task } from '@/types/Task';

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getRecurrenceLabel = (task: Task): string => {
    if (!task.frequency) return 'Daily';
    if (task.frequency === 'daily') return 'Every day';
    if (task.frequency === 'every_x_days') {
        const n = task.frequencyInterval ?? 1;
        return `Every ${n} day${n > 1 ? 's' : ''}`;
    }
    if (task.frequency === 'weekly' && task.weekDays && task.weekDays.length > 0) {
        const dayNames = task.weekDays
            .slice()
            .sort((a, b) => a - b)
            .map(d => DAY_LABELS[d]);
        const interval = task.weekInterval ?? 1;
        const prefix = interval > 1 ? `Every ${interval} weeks on` : 'Weekly on';
        return `${prefix} ${dayNames.join(', ')}`;
    }
    return '—';
};
