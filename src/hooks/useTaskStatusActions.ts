import toast from 'react-hot-toast';
import { Task } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import { celebrate } from '@/utils/celebrate';

/** Done / skip (with undo) / reopen for a task on the selected date — shared by the card and the compact row. */
export const useTaskStatusActions = (task: Task) => {
    const { markTaskStatus } = useTasks();

    /** `origin` is the button that was pressed, so the celebration bursts from it. */
    const complete = (origin?: Element | null) => {
        markTaskStatus(task.id, 'done');
        celebrate('task', origin);
    };

    const skip = () => {
        markTaskStatus(task.id, 'skipped');
        toast('Task Skipped.', {
            icon: '🙈',
            id: task.id,
            duration: 5000,
            action: {
                label: 'Undo',
                onClick: () => {
                    markTaskStatus(task.id, 'pending');
                    toast.dismiss(task.id);
                }
            }
        } as any);
    };

    const reopen = () => markTaskStatus(task.id, 'pending');

    return { complete, skip, reopen };
};
