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
                'rounded-3xl border border-slate-100 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 relative overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
Card.displayName = 'Card';
