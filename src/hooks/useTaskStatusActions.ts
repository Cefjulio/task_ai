import toast from 'react-hot-toast';
import { Task } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import { triggerConfetti, playApplause } from '@/utils/soundEffects';

/** Done / skip (with undo) / reopen for a task on the selected date — shared by the card and the compact row. */
export const useTaskStatusActions = (task: Task) => {
    const { markTaskStatus } = useTasks();

    const complete = () => {
        markTaskStatus(task.id, 'done');
        triggerConfetti();
        playApplause();
        toast.success('Task Completed! 🎉', { id: task.id });
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
