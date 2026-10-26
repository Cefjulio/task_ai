import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { DailyCoreList } from '@/components/tasks/DailyCoreList';
import { TaskQueue } from '@/components/tasks/TaskQueue';
import { QueuedTasksBacklog } from '@/components/tasks/QueuedTasksBacklog';
import { Task } from '@/types/Task';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { isTaskDueOn } from '@/features/tasks/frequencyEngine';
import { getTaskStatusForDate } from '@/utils/taskHelpers';
import { SearchInput } from '@/components/ui/SearchInput';
import { TagFilter } from '@/components/tasks/TagFilter';
import { useDynamicViewStore } from '@/store/dynamicViewStore';
import { cn } from '@/components/ui/Button';
import { ChevronDown, ChevronUp, Target } from 'lucide-react';

const EXPANDED_HEIGHT = 'h-[72vh] lg:h-[calc(100vh-230px)]';

export const DynamicTasksPage: React.FC<{ onEdit: (t: Task) => void }> = ({ onEdit }) => {
    const { tasks } = useTasks();
    const { selectedDate } = useTaskStore();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
    const [isCoreOpen, setIsCoreOpen] = useState(true);
    const [isQueueOpen, setIsQueueOpen] = useState(true);

    const dynamicTasksForDate = tasks.filter(t => {
        const isDynamicPriority = ['primary', 'secondary', 'tertiary'].includes(t.priority);
        const category = t.category || (isDynamicPriority ? 'dynamic' : 'random');
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tagId => t.tags?.includes(tagId));
        return category === 'dynamic' && isTaskDueOn(t, selectedDate) && matchesSearch && matchesTags;
    });

    const dailyCoreTasks = dynamicTasksForDate.filter(t => t.priority === 'primary');
    const donePrimary = dailyCoreTasks.filter(t => getTaskStatusForDate(t, selectedDate) === 'done');

    // Same set without the search / tag filters — the Focus lane ignores them
    const allDueCore = tasks.filter(t =>
        t.priority === 'primary' && (t.category || 'dynamic') === 'dynamic' && isTaskDueOn(t, selectedDate)
    );
    const focusMode = useDynamicViewStore(s => s.focusMode);
    const toggleFocusMode = useDynamicViewStore(s => s.toggleFocusMode);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* ── Daily Core ── */}
            <motion.section
                layout
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`flex flex-col ${isCoreOpen ? EXPANDED_HEIGHT : 'h-auto'} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm`}
            >
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">Daily Core</h2>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full shrink-0">
                                {donePrimary.length}/{dailyCoreTasks.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={toggleFocusMode}
                                aria-pressed={focusMode}
                                title="Focus mode: hide everything else until today's Focus tasks are done"
                                className={cn(
                                    'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-colors',
                                    focusMode
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                )}
                            >
                                <Target className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Focus mode</span>
                            </button>
                            <button
                                onClick={() => setIsCoreOpen(o => !o)}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                aria-label={isCoreOpen ? 'Collapse Daily Core' : 'Expand Daily Core'}
                            >
                                {isCoreOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {isCoreOpen && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                            <TagFilter selectedTagIds={selectedTags} onChange={setSelectedTags} />
                            <div className="w-full sm:w-auto">
                                <SearchInput value={searchQuery} onChange={setSearchQuery} />
                            </div>
                        </div>
                    )}
                </div>

                {isCoreOpen && (
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                        <DailyCoreList
                            tasks={dailyCoreTasks}
                            allDue={allDueCore}
                            date={selectedDate}
                            onEdit={onEdit}
                            emptyMessage={searchQuery ? 'No tasks match your search.' : 'No core tasks scheduled for this day.'}
                        />
                    </div>
                )}
            </motion.section>

            {/* ── Up Next + Backlog ── */}
            <motion.section
                layout
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`flex flex-col ${isQueueOpen ? EXPANDED_HEIGHT : 'h-auto'} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden`}
            >
                <div className={isQueueOpen ? 'flex-1 flex flex-col min-h-0 overflow-hidden' : 'shrink-0'}>
                    <TaskQueue onEdit={onEdit} category="dynamic" isOpen={isQueueOpen} onToggle={() => setIsQueueOpen(o => !o)} />
                </div>
                <div className="px-5 pb-5 shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                    <QueuedTasksBacklog onEdit={onEdit} />
                </div>
            </motion.section>
        </div>
    );
};
