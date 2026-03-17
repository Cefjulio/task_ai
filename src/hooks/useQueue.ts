import { useMemo, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { computeVisibleQueue, QueueState } from '@/features/tasks/taskQueue';

export const useQueue = (category: 'dynamic' | 'random' = 'random'): QueueState & { refreshQueue: () => void } => {
    const { tasks, selectedDate, dailyQueueSession, generateQueueSession } = useTaskStore();

    // Ensure the queue session is generated/validated whenever tasks or date change
    useEffect(() => {
        if (category === 'dynamic') {
            generateQueueSession(false, selectedDate);
        }
    }, [category, selectedDate, generateQueueSession, tasks]); // React to full task list changes (e.g., initial load)

    const queue = useMemo(() => {
        const filteredTasks = tasks.filter(t => {
            const isDynamicPriority = ['primary', 'secondary', 'tertiary'].includes(t.priority);
            const tCategory = t.category || (isDynamicPriority ? 'dynamic' : 'random');
            if (tCategory !== category) return false;

            // Date filtering for dynamic tasks is handled mostly by the queue generator now,
            // but we still apply it for primary tasks if this hook is ever broad.
            return true; 
        });

        const computed = computeVisibleQueue(filteredTasks);

        // If we are looking at dynamic tasks, OVERRIDE the visible queues with our locked session
        if (category === 'dynamic' && dailyQueueSession?.date === selectedDate) {
            const sessionTasks = filteredTasks.filter(t => dailyQueueSession.taskIds.includes(t.id));
            const sessionIds = sessionTasks.map(t => t.id);

            // The backlog should include all tasks NOT in the current session,
            // PLUS tasks that ARE in the current session but are NO LONGER pending (to show them in the queue backlog immediately).
            const backlogSecondary = filteredTasks.filter(t => 
                (t.priority === 'secondary' || t.priority === 'high') && (!sessionIds.includes(t.id) || t.status !== 'pending')
            );
            const backlogTertiary = filteredTasks.filter(t => 
                (t.priority === 'tertiary' || t.priority === 'middle' || t.priority === 'low') && (!sessionIds.includes(t.id) || t.status !== 'pending')
            );

            const sortByPriority = (list: any[]) => {
                list.sort((a, b) => {
                    const compA = a.completions || 0;
                    const compB = b.completions || 0;
                    if (compA === compB) {
                        const timeA = new Date(a.lastQueuedAt || a.createdAt || 0).getTime();
                        const timeB = new Date(b.lastQueuedAt || b.createdAt || 0).getTime();
                        return timeA - timeB;
                    }
                    return compA - compB;
                });
            };

            sortByPriority(backlogSecondary);
            sortByPriority(backlogTertiary);

            // Visible tasks must STILL BE PENDING to remain in the "Up Next" UI.
            const visibleSecondary = sessionTasks.filter(t => (t.priority === 'secondary' || t.priority === 'high') && t.status === 'pending');
            const visibleTertiary = sessionTasks.filter(t => (t.priority === 'tertiary' || t.priority === 'middle' || t.priority === 'low') && t.status === 'pending');
            sortByPriority(visibleSecondary);
            sortByPriority(visibleTertiary);
            
            return {
                visibleSecondary,
                visibleTertiary,
                fullSecondary: backlogSecondary,
                fullTertiary: backlogTertiary
            };
        }

        return computed;
    }, [tasks, category, selectedDate, dailyQueueSession]);

    const refreshQueue = () => {
        if (category === 'dynamic') {
            generateQueueSession(true, selectedDate);
        }
    };

    return {
        ...queue,
        refreshQueue
    };
};
