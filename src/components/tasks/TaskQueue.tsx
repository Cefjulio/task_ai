import React from 'react';
import { useQueue } from '@/hooks/useQueue';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/Button';
import { RefreshCw } from 'lucide-react';

export const TaskQueue: React.FC<{ onEdit: (t: any) => void; category?: 'dynamic' | 'random' }> = ({ onEdit, category = 'random' }) => {
    const { visibleSecondary, visibleTertiary, refreshQueue } = useQueue(category);
    const allQueue = [...visibleSecondary, ...visibleTertiary];

    if (allQueue.length === 0) {
        return (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">Your queue is empty!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Up Next</h2>
                <Button variant="ghost" size="sm" onClick={refreshQueue} className="text-slate-500 gap-1.5 h-8 font-semibold">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <div className="flex flex-col w-full gap-4">
                    {allQueue.map(t => (
                        <div key={t.id} className="animate-in fade-in slide-in-from-bottom-2">
                            <TaskCard task={t} onEdit={onEdit} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
