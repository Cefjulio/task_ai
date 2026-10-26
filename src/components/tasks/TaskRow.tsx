import React, { useState } from 'react';
import { Task } from '@/types/Task';
import { getTaskProgress, getTaskStatusForDate, getTaskStepStats } from '@/utils/taskHelpers';
import { stripHtml } from '@/utils/htmlUtils';
import { useTasks } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/taskStore';
import { useTaskStatusActions } from '@/hooks/useTaskStatusActions';
import { cn } from '@/components/ui/Button';
import { TaskActions } from './TaskActions';
import { SubStepItem } from './SubStepItem';
import { GoalBadge } from './GoalBadge';
import { Check, ChevronDown, Star, X } from 'lucide-react';

interface TaskRowProps {
    task: Task;
    onEdit: (task: Task) => void;
    isFocus: boolean;
    /** False when today's Focus lane is full (and this task isn't in it). */
    canAddFocus: boolean;
    onToggleFocus: () => void;
    defaultExpanded?: boolean;
}

/** One-line task: tick it off, see its step progress, or expand it to work through the sub-steps. */
export const TaskRow: React.FC<TaskRowProps> = ({ task, onEdit, isFocus, canAddFocus, onToggleFocus, defaultExpanded = false }) => {
    const { toggleSubStep, deleteTask } = useTasks();
    const { selectedDate, tags: allTags } = useTaskStore();
    const { complete, skip, reopen } = useTaskStatusActions(task);
    const [expanded, setExpanded] = useState(defaultExpanded);

    const status = getTaskStatusForDate(task, selectedDate);
    const isDone = status === 'done';
    const isSkipped = status === 'skipped';
    const stats = getTaskStepStats(task);
    const progress = getTaskProgress(task);
    const taskTags = (task.tags || []).map(id => allTags.find(t => t.id === id)).filter(Boolean);
    const description = task.description ? stripHtml(task.description) : '';

    const starLabel = isFocus
        ? "Remove from today's Focus"
        : canAddFocus
            ? "Add to today's Focus"
            : 'Focus is full (3) — remove one first';

    return (
        <div
            className={cn(
                'rounded-2xl border transition-colors',
                isDone
                    ? 'border-amber-300/50 bg-amber-50/70 dark:border-yellow-500/30 dark:bg-yellow-900/10'
                    : 'border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900',
                isFocus && !isDone && 'border-l-4 border-l-primary'
            )}
        >
            <div className="flex items-center gap-2.5 px-3 py-2.5">
                <button
                    onClick={isDone || isSkipped ? reopen : complete}
                    aria-label={isDone ? 'Mark as not done' : isSkipped ? 'Reopen skipped task' : 'Mark as done'}
                    title={isDone ? 'Done — click to undo' : isSkipped ? 'Skipped — click to reopen' : 'Mark as done'}
                    className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-95',
                        isDone
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : isSkipped
                                ? 'border-dashed border-slate-300 text-slate-400 dark:border-slate-600'
                                : 'border-slate-300 text-transparent hover:border-primary hover:text-primary/40 dark:border-slate-600'
                    )}
                >
                    {isSkipped ? <X className="h-3.5 w-3.5" strokeWidth={3} /> : <Check className="h-4 w-4" strokeWidth={3} />}
                </button>

                <button
                    onClick={() => setExpanded(v => !v)}
                    aria-expanded={expanded}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                    <span
                        className={cn(
                            'min-w-0 flex-1 line-clamp-2 break-words text-[15px] font-bold leading-snug',
                            isDone || isSkipped ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                        )}
                    >
                        {task.title}
                    </span>

                    {taskTags.length > 0 && (
                        <span className="hidden shrink-0 items-center gap-1 sm:flex">
                            {taskTags.map(tag => tag && (
                                <span key={tag.id} className={`h-2.5 w-2.5 rounded-full ${tag.color}`} title={tag.name} />
                            ))}
                        </span>
                    )}

                    {stats.total > 0 && (
                        <span className="flex shrink-0 items-center gap-2" title={`${stats.completed} of ${stats.total} steps done`}>
                            <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:block">
                                <span
                                    className="block h-full rounded-full bg-primary transition-[width] duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </span>
                            <span className="text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                                {stats.completed}/{stats.total}
                            </span>
                        </span>
                    )}
                </button>

                <button
                    onClick={onToggleFocus}
                    aria-pressed={isFocus}
                    aria-label={starLabel}
                    title={starLabel}
                    className={cn(
                        'shrink-0 rounded-lg p-1.5 transition-colors',
                        isFocus
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : canAddFocus
                                ? 'text-slate-300 hover:bg-slate-100 hover:text-amber-500 dark:text-slate-600 dark:hover:bg-slate-800'
                                : 'cursor-not-allowed text-slate-200 dark:text-slate-700'
                    )}
                >
                    <Star className={cn('h-4.5 w-4.5', isFocus && 'fill-current')} />
                </button>

                <button
                    onClick={() => setExpanded(v => !v)}
                    aria-label={expanded ? 'Collapse task' : 'Expand task'}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
                </button>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 px-4 pb-3 pt-3 dark:border-slate-800">
                    {task.goalId && (
                        <div className="mb-2">
                            <GoalBadge goalId={task.goalId} />
                        </div>
                    )}
                    {description && (
                        <p className="mb-3 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                    )}
                    {task.subSteps.length > 0 && (
                        <div className="space-y-0.5 rounded-2xl border border-slate-200/50 bg-slate-50 px-4 py-2 dark:border-slate-700/50 dark:bg-slate-800/50">
                            {task.subSteps.map(step => (
                                <SubStepItem key={step.id} step={step} onToggle={() => toggleSubStep(task.id, step.id)} />
                            ))}
                        </div>
                    )}
                    <TaskActions
                        isCompleted={isDone}
                        onDone={complete}
                        onSkip={skip}
                        onEdit={() => onEdit(task)}
                        onDelete={() => {
                            if (confirm('Delete this task?')) deleteTask(task.id);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
