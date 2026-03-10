import React from 'react';
import { cn } from './Button';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'high' | 'middle' | 'low' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
    className,
    variant = 'outline',
    children,
    ...props
}) => {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
                {
                    'bg-primary/10 text-primary-dark dark:text-primary-light': variant === 'primary',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': variant === 'secondary',
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300': variant === 'tertiary',
                    'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300': variant === 'high',
                    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300': variant === 'middle',
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400': variant === 'low',
                    'border border-slate-200 text-slate-800 dark:border-slate-800 dark:text-slate-300': variant === 'outline',
                },
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};
