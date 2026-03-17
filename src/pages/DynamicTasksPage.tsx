import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskQueue } from '@/components/tasks/TaskQueue';
import { QueuedTasksBacklog } from '@/components/tasks/QueuedTasksBacklog';
import { Task } from '@/types/Task';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { isTaskDueOn } from '@/features/tasks/frequencyEngine';
import { getTaskStatusForDate } from '@/utils/taskHelpers';
import { SearchInput } from '@/components/ui/SearchInput';
import { TagFilter } from '@/components/tasks/TagFilter';

export const DynamicTasksPage: React.FC<{ onEdit: (t: Task) => void }> = ({ onEdit }) => {
    const { tasks } = useTasks();
    const { selectedDate } = useTaskStore();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

    const dynamicTasksForDate = tasks.filter(t => {
        const isDynamicPriority = ['primary', 'secondary', 'tertiary'].includes(t.priority);
        const category = t.category || (isDynamicPriority ? 'dynamic' : 'random');
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tagId => t.tags?.includes(tagId));
        return category === 'dynamic' && isTaskDueOn(t, selectedDate) && matchesSearch && matchesTags;
    });

    const dailyCoreTasks = dynamicTasksForDate.filter(t => t.priority === 'primary');
    const pendingPrimary = dailyCoreTasks.filter(t => getTaskStatusForDate(t, selectedDate) === 'pending');
    const donePrimary = dailyCoreTasks.filter(t => getTaskStatusForDate(t, selectedDate) === 'done');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[calc(100vh-320px)]">
            <section className="flex flex-col h-[500px] lg:h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex flex-col gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">Daily Core</h2>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                {donePrimary.length}/{dailyCoreTasks.length}
                            </span>
                        </div>
                        <TagFilter selectedTagIds={selectedTags} onChange={setSelectedTags} />
                    </div>
                    <div className="w-full sm:w-auto">
                        <SearchInput value={searchQuery} onChange={setSearchQuery} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {dailyCoreTasks.length === 0 ? (
                        <div className="text-center py-12 px-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl h-full flex flex-col justify-center">
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {searchQuery ? 'No tasks match your search.' : 'No core tasks scheduled for this day.'}
                            </p>
                        </div>
                    ) : (
                        <motion.div layout className="flex flex-col w-full gap-4">
                            {pendingPrimary.map(t => (
                                <motion.div key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <TaskCard task={t} onEdit={onEdit} />
                                </motion.div>
                            ))}
                            {donePrimary.length > 0 && (
                                <div className="relative py-4">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Completed</span>
                                    </div>
                                </div>
                            )}
                            {donePrimary.map(t => (
                                <motion.div key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <TaskCard task={t} onEdit={onEdit} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            <section className="flex flex-col h-[500px] lg:h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <TaskQueue onEdit={onEdit} category="dynamic" />
                </div>
                <div className="px-5 pb-5 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                    <QueuedTasksBacklog onEdit={onEdit} />
                </div>
            </section>
        </div>
    );
};
