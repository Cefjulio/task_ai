import { useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { processDailyTasks } from '@/features/tasks/frequencyEngine';

export const useDailyReset = () => {
    const { tasks, lastOpenedDate, setLastOpenedDate, setTasks } = useTaskStore();

    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];

        if (lastOpenedDate !== todayStr) {
            const updatedTasks = processDailyTasks(tasks, lastOpenedDate, todayStr);
            setTasks(updatedTasks);
            setLastOpenedDate(todayStr);
        }
    }, [tasks, lastOpenedDate, setLastOpenedDate, setTasks]);
};
