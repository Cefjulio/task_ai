import React from 'react';
import { useTaskStore } from '@/store/taskStore';

interface GoalBadgeProps {
    goalId?: string;
    size?: 'sm' | 'md';
}

/**
 * Renders a pill badge showing the linked goal name + color.
 * Returns null if no goalId or the goal is not found.
 */
export const GoalBadge: React.FC<GoalBadgeProps> = ({ goalId, size = 'sm' }) => {
    const { goals } = useTaskStore();

    if (!goalId) return null;

    const goal = goals.find(g => g.id === goalId);
    if (!goal) return null;

    const sizeClasses = size === 'sm'
        ? 'text-[10px] px-2 py-0.5 gap-1'
        : 'text-xs px-2.5 py-1 gap-1.5';

    return (
        <span
            className={`inline-flex items-center rounded-full font-bold text-white ${goal.color} ${sizeClasses} shadow-sm`}
            title={`Goal: ${goal.title}`}
        >
            <span>{goal.emoji}</span>
            <span className="max-w-[100px] truncate">{goal.title}</span>
        </span>
    );
};
