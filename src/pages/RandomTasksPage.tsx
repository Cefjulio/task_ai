import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Task } from '@/types/Task';
import { SearchInput } from '@/components/ui/SearchInput';
import { Sparkles } from 'lucide-react';

export const RandomTasksPage: React.FC<{ onEdit: (t: Task) => void }> = ({ onEdit }) => {
    const { tasks } = useTasks();
    const [searchQuery, setSearchQuery] = useState('');

    // Filter by category and search
    const randomTasksAvailable = tasks.filter(t => {
        const category = t.category || (t.priority === 'primary' ? 'dynamic' : 'random');
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return category === 'random' && matchesSearch;
    });

    const allRandomTasks = [...randomTasksAvailable].sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (b.status === 'done' && a.status !== 'done') return -1;
        const priorityScore = { high: 3, middle: 2, low: 1, primary: 0, secondary: 0, tertiary: 0 };
        const scoreA = priorityScore[a.priority as keyof typeof priorityScore] || 0;
        const scoreB = priorityScore[b.priority as keyof typeof priorityScore] || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return (
        <div className="space-y-6 pb-10">
            {/* Search */}
            <div className="flex justify-end">
                <div className="w-full md:max-w-xs">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Filter random tasks..." />
                </div>
            </div>

            <div className="min-h-[400px] space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">All Random Tasks</h3>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                        {allRandomTasks.length} Total
                    </span>
                </div>
                {allRandomTasks.length === 0 ? (
                    <EmptyState message="No random tasks found." />
                ) : (
                    <div className="flex flex-col gap-4">
                        {allRandomTasks.map(t => (
                            <TaskCard key={t.id} task={t} onEdit={onEdit} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-20 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50/50 dark:bg-slate-900/20">
        <Sparkles className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">{message}</p>
    </div>
);
