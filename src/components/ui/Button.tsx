import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge tailwind classes */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background-light dark:ring-offset-background-dark active:scale-95',
                {
                    'bg-primary text-white hover:bg-primary-dark': variant === 'primary',
                    'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700': variant === 'secondary',
                    'border-2 border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800': variant === 'outline',
                    'hover:bg-slate-100 dark:hover:bg-slate-800': variant === 'ghost',
                    'h-8 px-3 text-sm': size === 'sm',
                    'h-10 px-4 py-2': size === 'md',
                    'h-12 px-8 text-lg': size === 'lg',
                    'h-10 w-10': size === 'icon',
                },
                className
            )}
            {...props}
        />
    );
};
