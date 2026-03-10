import { useMemo } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { computeVisibleQueue, QueueState } from '@/features/tasks/taskQueue';
import { isTaskDueOn } from '@/features/tasks/frequencyEngine';

export const useQueue = (category: 'dynamic' | 'random' = 'random'): QueueState & { refreshQueue: () => void } => {
    const { tasks, selectedDate } = useTaskStore();

    const queue = useMemo(() => {
        const filteredTasks = tasks.filter(t => {
            const isDynamicPriority = ['primary', 'secondary', 'tertiary'].includes(t.priority);
            const tCategory = t.category || (isDynamicPriority ? 'dynamic' : 'random');
            if (tCategory !== category) return false;

            // Only apply date filtering for dynamic tasks
            if (category === 'dynamic') {
                return isTaskDueOn(t, selectedDate);
            }

            return true;
        });
        return computeVisibleQueue(filteredTasks);
    }, [tasks, category, selectedDate]);

    const refreshQueue = () => {
        // In a deterministic queue based on completions, refresh is just re-evaluating.
        // However, if we want "skip" to send back to queue, we would increment a hidden 
        // "skipCount" parameter or randomize ties. Since we sort by creation date as well,
        // we can artificially bump a skipped item's timestamp or completions to cycle it.
    };

    return {
        ...queue,
        refreshQueue
    };
};
