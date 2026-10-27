import { SubStep, Task } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import { celebrate } from '@/utils/celebrate';

/** Toggle a sub-step, with the small celebration when it goes from pending to done. */
export const useSubStepToggle = () => {
    const { toggleSubStep } = useTasks();

    return (task: Task, step: SubStep, origin?: Element | null) => {
        if (step.status === 'pending') celebrate('step', origin);
        toggleSubStep(task.id, step.id);
    };
};
