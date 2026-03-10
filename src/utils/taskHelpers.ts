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
