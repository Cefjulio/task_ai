import React, { useState } from 'react';
import { Task } from '@/types/Task';
import { getTaskProgress, getTaskStepStats, getTaskStatusForDate } from '@/utils/taskHelpers';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TaskActions } from './TaskActions';
import { useTasks } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/taskStore';
import { triggerConfetti, playApplause } from '@/utils/soundEffects';
import toast from 'react-hot-toast';
import { TaskDetailsModal } from './TaskDetailsModal';

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
    const { markTaskStatus, deleteTask } = useTasks();
    const { selectedDate, tags: allTags } = useTaskStore();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const taskTags = (task.tags || []).map(tagId => allTags.find(t => t.id === tagId)).filter(Boolean);

    const progress = getTaskProgress(task);
    const stats = getTaskStepStats(task);
    const currentStatus = getTaskStatusForDate(task, selectedDate);
    const isCompleted = currentStatus === 'done';

    const handleDone = () => {
        markTaskStatus(task.id, 'done');
        triggerConfetti();
        playApplause();
        toast.success('Task Completed! 🎉', { id: task.id });
    };

    const handleSkip = () => {
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

    return (
        <>
            <Card className={`relative group p-5 md:p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-none hover:-translate-y-1 border flex flex-col min-h-[180px] h-auto w-full ${isCompleted ? 'bg-gradient-to-br from-[#FFD700]/35 via-[#FFB300]/35 to-[#FF8F00]/35 border-amber-400/50 dark:from-yellow-600/35 dark:via-orange-600/35 dark:to-orange-700/35 dark:border-yellow-500/50 shadow-yellow-500/10' : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 shadow-sm'}`}>
                <div
                    className="cursor-pointer flex-1 flex flex-col"
                    onClick={() => setIsDetailsOpen(true)}
                >
                    <div className="flex justify-between items-start gap-4 mb-2 shrink-0">
                        <h3 className={`font-bold text-xl leading-tight tracking-tight line-clamp-2 flex-1 ${isCompleted ? 'line-through text-amber-950 dark:text-yellow-100 opacity-90' : 'text-slate-800 dark:text-slate-100'}`}>
                            {task.title}
                        </h3>
                        <div onClick={e => e.stopPropagation()} className="shrink-0 flex flex-col items-end gap-2">
                            <Badge variant={task.priority}>
                                {task.priority}
                            </Badge>
                            {taskTags.length > 0 && (
                                <div className="flex gap-1 flex-wrap justify-end max-w-[120px]">
                                    {taskTags.map(tag => tag && (
                                        <div 
                                            key={tag.id} 
                                            className={`w-2.5 h-2.5 rounded-full ${tag.color} shadow-sm`}
                                            title={tag.name}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {task.description && (
                        <p className={`text-sm mb-3 line-clamp-1 shrink-0 ${isCompleted ? 'text-amber-900/80 dark:text-yellow-200' : 'text-slate-500 dark:text-slate-400'}`}>{task.description}</p>
                    )}

                    {task.subSteps.length > 0 && (
                        <div className="mt-auto shrink-0 transition-opacity duration-300">
                            <div className={`flex justify-between text-xs mb-1.5 font-medium ${isCompleted ? 'text-amber-900/70 dark:text-yellow-200/80' : 'text-slate-500'}`}>
                                <span>Progress</span>
                                <span>{stats.completed}/{stats.total} steps</span>
                            </div>
                            <ProgressBar progress={progress} className="mb-1" />
                        </div>
                    )}
                </div>

                <div className={`mt-3 pt-3 border-t shrink-0 ${isCompleted ? 'border-amber-400/40 dark:border-yellow-500/30' : 'border-slate-100 dark:border-slate-800'}`}>
                    <TaskActions
                        isCompleted={isCompleted}
                        onDone={handleDone}
                        onSkip={handleSkip}
                        onEdit={() => onEdit?.(task)}
                        onDelete={() => {
                            if (confirm('Delete this task?')) deleteTask(task.id);
                        }}
                    />
                </div>
            </Card>

            <TaskDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                task={task}
            />
        </>
    );
};
