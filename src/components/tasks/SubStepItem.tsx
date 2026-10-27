import React from 'react';
import { SubStep } from '@/types/Task';
import { cn } from '@/components/ui/Button';
import { Check, Star } from 'lucide-react';

interface SubStepItemProps {
    step: SubStep;
    onToggle: () => void;
    /** Optional ☆ to put just this step in today's Focus lane. */
    focus?: {
        active: boolean;
        onToggle: () => void;
    };
}

export const SubStepItem: React.FC<SubStepItemProps> = ({ step, onToggle, focus }) => {
    const isDone = step.status === 'done';
    const starLabel = focus?.active
        ? "Remove this step from today's Focus"
        : "Add this step to today's Focus";

    return (
        <div
            className="flex items-center gap-3 py-2 cursor-pointer group"
            onClick={onToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                // Keys pressed on the ☆ inside belong to the ☆, not to the step
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') onToggle();
            }}
        >
            <div className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                isDone
                    ? "bg-primary border-primary text-white"
                    : "border-slate-300 dark:border-slate-600 text-transparent group-hover:border-primary/50"
            )}>
                <Check className="w-3 h-3" strokeWidth={3} />
            </div>
            <span className={cn(
                "min-w-0 flex-1 break-words text-sm transition-all",
                isDone
                    ? "text-slate-400 dark:text-slate-500 line-through"
                    : "text-slate-700 dark:text-slate-200"
            )}>
                {step.text}
            </span>
            {focus && (
                <button
                    onClick={(e) => { e.stopPropagation(); focus.onToggle(); }}
                    aria-pressed={focus.active}
                    aria-label={starLabel}
                    title={starLabel}
                    className={cn(
                        'shrink-0 rounded-lg p-1 transition-colors',
                        focus.active
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500 dark:text-slate-600 dark:hover:bg-slate-800'
                    )}
                >
                    <Star className={cn('h-4 w-4', focus.active && 'fill-current')} />
                </button>
            )}
        </div>
    );
};
