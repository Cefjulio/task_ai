import React from 'react';
import { Task } from '@/types/Task';
import { getTaskProgress, getTaskStepStats } from '@/utils/taskHelpers';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SubStepItem } from './SubStepItem';
import { useTasks } from '@/hooks/useTasks';
import { X, Repeat } from 'lucide-react';
import { GoalBadge } from './GoalBadge';
import { isQuillEmpty } from '@/utils/htmlUtils';
import { getRecurrenceLabel } from '@/utils/frequencyLabel';
import { QuillContent } from '@/components/ui/QuillContent';

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
                    <div className="flex-1 pr-4 min-w-0">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white truncate">{task.title}</h2>
                        {task.goalId && (
                            <div className="mt-1.5">
                                <GoalBadge goalId={task.goalId} size="md" />
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {task.description && !isQuillEmpty(task.description) && (
                        <QuillContent
                            html={task.description}
                            className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed"
                        />
                    )}

                    {task.frequency && (
                        <div className="mb-6 flex items-center gap-2.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-2xl px-4 py-3">
                            <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                                <Repeat className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary/70 dark:text-primary-light/70">Frequency</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{getRecurrenceLabel(task)}</p>
                            </div>
                        </div>
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
