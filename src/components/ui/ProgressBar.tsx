import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
    progress: number; // 0 to 100
    className?: string;
    colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    className = '',
    colorClass = 'bg-primary'
}) => {
    return (
        <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden ${className}`}>
            <motion.div
                className={`h-full rounded-full ${colorClass}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            />
        </div>
    );
};
