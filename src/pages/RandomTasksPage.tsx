import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Task } from '@/types/Task';
import { motion, AnimatePresence } from 'framer-motion';
import { computeVisibleQueue } from '@/features/tasks/taskQueue';
import { List, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';

type RandomSubTab = 'queue' | 'all' | 'done';

export const RandomTasksPage: React.FC<{ onEdit: (t: Task) => void }> = ({ onEdit }) => {
    const { tasks } = useTasks();
    const [subTab, setSubTab] = useState<RandomSubTab>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter by category and search
    const randomTasksAvailable = tasks.filter(t => {
        const category = t.category || (t.priority === 'primary' ? 'dynamic' : 'random');
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return category === 'random' && matchesSearch;
    });

    const { visibleSecondary, visibleTertiary } = computeVisibleQueue(randomTasksAvailable);
    const queueTasks = [...visibleSecondary, ...visibleTertiary];

    const allRandomTasks = [...randomTasksAvailable].sort((a, b) => {
        // ... sort logic remains the same ...
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (b.status === 'done' && a.status !== 'done') return -1;
        const priorityScore = { high: 3, middle: 2, low: 1, primary: 0, secondary: 0, tertiary: 0 };
        const scoreA = priorityScore[a.priority as keyof typeof priorityScore] || 0;
        const scoreB = priorityScore[b.priority as keyof typeof priorityScore] || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const doneTasks = randomTasksAvailable.filter(t => t.status === 'done');

    const tabs = [
        { id: 'all', label: 'All Tasks', icon: List },
        { id: 'queue', label: 'Up Next', icon: LayoutGrid },
        { id: 'done', label: 'Archive', icon: CheckCircle2 },
    ];

    return (
        <div className="space-y-6 pb-10">
            {/* Sub-Tabs Navigation & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl w-fit shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = subTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSubTab(tab.id as RandomSubTab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm scale-105'
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-50'}`} />
                                <span className="hidden sm:block">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="w-full md:max-w-xs">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Filter random tasks..." />
                </div>
            </div>

            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={subTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {subTab === 'queue' && (
                            <>
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Current Queue</h3>
                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        Top 5
                                    </span>
                                </div>
                                {queueTasks.length === 0 ? (
                                    <EmptyState message="The queue is empty. Ready for more?" />
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {queueTasks.map(t => (
                                            <TaskCard key={t.id} task={t} onEdit={onEdit} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {subTab === 'all' && (
                            <>
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Master List</h3>
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
                            </>
                        )}

                        {subTab === 'done' && (
                            <>
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Completed</h3>
                                    <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                        {doneTasks.length} Done
                                    </span>
                                </div>
                                {doneTasks.length === 0 ? (
                                    <EmptyState message="No completed tasks yet. Get to work!" />
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {doneTasks.map(t => (
                                            <TaskCard key={t.id} task={t} onEdit={onEdit} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
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

import { Sparkles } from 'lucide-react';
