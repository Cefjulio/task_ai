import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
                'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none',
                // Duolingo pressed effect
                'rounded-2xl border-b-4 active:border-b-2 active:translate-y-0.5',
                {
                    'bg-primary border-primary-dark text-white hover:brightness-105': variant === 'primary',
                    'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-600': variant === 'secondary',
                    'bg-white border-slate-300 text-primary hover:bg-primary/5 dark:bg-slate-800 dark:border-slate-600 dark:text-primary-light': variant === 'outline',
                    'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300': variant === 'ghost',
                    'bg-red-500 border-red-700 text-white hover:brightness-105': variant === 'danger',
                    'h-8 px-3 text-sm': size === 'sm',
                    'h-11 px-5 py-2 text-sm': size === 'md',
                    'h-13 px-8 text-base': size === 'lg',
                    'h-10 w-10 border-b-2': size === 'icon',
                },
                className
            )}
            {...props}
        />
    );
};
