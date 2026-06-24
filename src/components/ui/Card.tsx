import React from 'react';
import { cn } from './Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'rounded-2xl border border-slate-200 bg-white text-slate-950 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-50 relative overflow-hidden',
                'shadow-[0_4px_0_0_#e2e8f0] dark:shadow-[0_4px_0_0_#1e293b]',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
Card.displayName = 'Card';
