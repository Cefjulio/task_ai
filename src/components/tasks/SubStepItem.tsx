import React from 'react';
import { SubStep } from '@/types/Task';
import { cn } from '@/components/ui/Button';
import { Check } from 'lucide-react';

interface SubStepItemProps {
    step: SubStep;
    onToggle: () => void;
}

export const SubStepItem: React.FC<SubStepItemProps> = ({ step, onToggle }) => {
    const isDone = step.status === 'done';

    return (
        <div
            className="flex items-center gap-3 py-2 cursor-pointer group"
            onClick={onToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
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
                "text-sm transition-all",
                isDone
                    ? "text-slate-400 dark:text-slate-500 line-through"
                    : "text-slate-700 dark:text-slate-200"
            )}>
                {step.text}
            </span>
        </div>
    );
};
