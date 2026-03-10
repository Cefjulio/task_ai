import React from 'react';
import { Task } from '@/types/Task';
import { getTaskProgress, getTaskStepStats } from '@/utils/taskHelpers';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SubStepItem } from './SubStepItem';
import { useTasks } from '@/hooks/useTasks';
import { X } from 'lucide-react';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, task }) => {
    const { toggleSubStep } = useTasks();
    if (!isOpen) return null;

    const progress = getTaskProgress(task);
    const stats = getTaskStepStats(task);

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-slate-900/50 backdrop-blur-sm transition-opacity p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                role="dialog"
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white truncate pr-4">
                        {task.title}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto">
                    {task.description && (
                        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">{task.description}</p>
                    )}

                    {task.subSteps.length > 0 ? (
                        <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium">
                                <span>Progress</span>
                                <span>{stats.completed}/{stats.total} steps</span>
                            </div>
                            <ProgressBar progress={progress} className="mb-6" />

                            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                                {task.subSteps.map(step => (
                                    <SubStepItem
                                        key={step.id}
                                        step={step}
                                        onToggle={() => toggleSubStep(task.id, step.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-sm">
                            This task has no sub-steps.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
