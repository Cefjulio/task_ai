import React from 'react';
import { Check, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TaskActionsProps {
    onDone: () => void;
    onSkip: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isCompleted?: boolean;
}

export const TaskActions: React.FC<TaskActionsProps> = ({
    onDone,
    onSkip,
    onEdit,
    onDelete,
    isCompleted
}) => {
    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {!isCompleted && (
                <>
                    <Button size="sm" variant="primary" onClick={onDone} className="flex-1 bg-primary text-white gap-1.5 focus:ring-primary h-9">
                        <Check className="w-4 h-4" /> Done
                    </Button>
                    <Button size="sm" variant="secondary" onClick={onSkip} className="gap-1.5 h-9">
                        <X className="w-4 h-4" /> Skip
                    </Button>
                </>
            )}
            <div className="flex-1" />
            <Button size="icon" variant="ghost" onClick={onEdit} className="h-9 w-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Edit2 className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    );
};
