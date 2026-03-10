import { useTaskStore } from '@/store/taskStore';

export const useTasks = () => {
    const tasks = useTaskStore((state) => state.tasks);
    const addTask = useTaskStore((state) => state.addTask);
    const updateTask = useTaskStore((state) => state.updateTask);
    const deleteTask = useTaskStore((state) => state.deleteTask);
    const markTaskStatus = useTaskStore((state) => state.markTaskStatus);
    const addSubStep = useTaskStore((state) => state.addSubStep);
    const toggleSubStep = useTaskStore((state) => state.toggleSubStep);
    const deleteSubStep = useTaskStore((state) => state.deleteSubStep);

    return {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        markTaskStatus,
        addSubStep,
        toggleSubStep,
        deleteSubStep,
    };
};
