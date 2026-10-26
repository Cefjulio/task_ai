import React from 'react';
import { SubStep, Task } from '@/types/Task';
import { cn } from '@/components/ui/Button';
import { Check, Star } from 'lucide-react';

interface FocusStepRowProps {
    task: Task;
    step: SubStep;
    onToggleStep: () => void;
    onRemove: () => void;
}

/** A single sub-step sitting in the Focus lane, with the task it belongs to underneath. */
export const FocusStepRow: React.FC<FocusStepRowProps> = ({ task, step, onToggleStep, onRemove }) => {
    const isDone = step.status === 'done';

    return (
        <div
            className={cn(
                'flex items-center gap-2.5 rounded-2xl border border-l-4 border-l-primary px-3 py-2.5 transition-colors',
                isDone
                    ? 'border-amber-300/50 bg-amber-50/70 dark:border-yellow-500/30 dark:bg-yellow-900/10'
                    : 'border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900'
            )}
        >
            <button
                onClick={onToggleStep}
                aria-label={isDone ? 'Mark step as not done' : 'Mark step as done'}
                title={isDone ? 'Done — click to undo' : 'Mark step as done'}
                className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-95',
                    isDone
                        ? 'border-amber-500 bg-amber-500 text-white'
                        : 'border-slate-300 text-transparent hover:border-primary hover:text-primary/40 dark:border-slate-600'
                )}
            >
                <Check className="h-4 w-4" strokeWidth={3} />
            </button>

            <div className="min-w-0 flex-1">
                <p
                    className={cn(
                        'line-clamp-2 break-words text-[15px] font-bold leading-snug',
                        isDone ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                    )}
                >
                    {step.text}
                </p>
                <p className="truncate text-xs font-semibold text-slate-400 dark:text-slate-500">
                    Step of · {task.title}
                </p>
            </div>

            <button
                onClick={onRemove}
                aria-label="Remove this step from today's Focus"
                title="Remove from today's Focus"
                className="shrink-0 rounded-lg p-1.5 text-amber-500 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
                <Star className="h-4.5 w-4.5 fill-current" />
            </button>
        </div>
    );
};
