import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTaskStore } from '@/store/taskStore';
import { Task } from '@/types/Task';
import { SearchInput } from '@/components/ui/SearchInput';
import { TagFilter } from '@/components/tasks/TagFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, CalendarDays, Repeat2, LayoutList, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface CoreTasksPageProps {
    onEdit: (task: Task) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getRecurrenceLabel = (task: Task): string => {
    if (!task.frequency) return 'Daily';
    if (task.frequency === 'daily') return 'Every day';
    if (task.frequency === 'every_x_days') {
        const n = task.frequencyInterval ?? 1;
        return `Every ${n} day${n > 1 ? 's' : ''}`;
    }
    if (task.frequency === 'weekly' && task.weekDays && task.weekDays.length > 0) {
        const dayNames = task.weekDays
            .slice()
            .sort((a, b) => a - b)
            .map(d => DAY_LABELS[d]);
        const interval = task.weekInterval ?? 1;
        const prefix = interval > 1 ? `Every ${interval} weeks on` : 'Weekly on';
        return `${prefix} ${dayNames.join(', ')}`;
    }
    return '—';
};

const getWeekDayDots = (task: Task) => {
    if (task.frequency !== 'weekly' || !task.weekDays) return null;
    return (
        <div className="flex gap-1 mt-1.5 flex-wrap">
            {DAY_LABELS.map((label, idx) => {
                const active = task.weekDays!.includes(idx);
                return (
                    <span
                        key={idx}
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold border transition-all ${
                            active
                                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        {label[0]}
                    </span>
                );
            })}
        </div>
    );
};

export const CoreTasksPage: React.FC<CoreTasksPageProps> = ({ onEdit }) => {
    const { tasks, deleteTask } = useTasks();
    const { tags } = useTaskStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sortField, setSortField] = useState<'title' | 'frequency' | null>(null);
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const coreTasks = tasks.filter(t => {
        const isPrimary = t.priority === 'primary';
        const isDynamic = t.category === 'dynamic';
        const matchesSearch =
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags =
            selectedTags.length === 0 || selectedTags.some(id => t.tags?.includes(id));
        return isPrimary && isDynamic && matchesSearch && matchesTags;
    });

    const sorted = [...coreTasks].sort((a, b) => {
        if (!sortField) return 0;
        let valA = '', valB = '';
        if (sortField === 'title') { valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); }
        if (sortField === 'frequency') { valA = getRecurrenceLabel(a); valB = getRecurrenceLabel(b); }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: 'title' | 'frequency') => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const handleDelete = (task: Task) => {
        if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
            deleteTask(task.id);
            toast.success('Task deleted');
        }
    };

    const SortIcon = ({ field }: { field: 'title' | 'frequency' }) => {
        if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 opacity-30" />;
        return sortDir === 'asc'
            ? <ChevronUp className="w-3.5 h-3.5 text-primary" />
            : <ChevronDown className="w-3.5 h-3.5 text-primary" />;
    };

    return (
        <div className="space-y-6">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <LayoutList className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Daily Core Tasks</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {coreTasks.length} task{coreTasks.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:max-w-xl">
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by title or description..."
                    />
                </div>
            </div>

            {/* Tag filter row */}
            {tags.length > 0 && (
                <div className="px-1">
                    <TagFilter selectedTagIds={selectedTags} onChange={setSelectedTags} />
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
                {sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <CalendarDays className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-semibold text-base">
                            {searchQuery || selectedTags.length > 0
                                ? 'No tasks match your filters.'
                                : 'No Daily Core tasks yet.'}
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                            {!(searchQuery || selectedTags.length > 0) &&
                                'Create a "Primary" dynamic task to see it here.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs w-10">#</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                                        <button
                                            onClick={() => handleSort('title')}
                                            className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                        >
                                            Title <SortIcon field="title" />
                                        </button>
                                    </th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs hidden md:table-cell">Description</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                                        <button
                                            onClick={() => handleSort('frequency')}
                                            className="flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                        >
                                            Recurrence <SortIcon field="frequency" />
                                        </button>
                                    </th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs hidden lg:table-cell">Tags</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence initial={false}>
                                    {sorted.map((task, idx) => {
                                        const taskTags = (task.tags ?? [])
                                            .map(tid => tags.find(t => t.id === tid))
                                            .filter(Boolean);
                                        const isExpanded = expandedRow === task.id;
                                        const hasDescription = !!task.description?.trim();

                                        return (
                                            <React.Fragment key={task.id}>
                                                <motion.tr
                                                    layout
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className={`border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors group cursor-pointer ${
                                                        isExpanded
                                                            ? 'bg-primary/5 dark:bg-primary/10'
                                                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                                                    }`}
                                                    onClick={() => setExpandedRow(isExpanded ? null : task.id)}
                                                >
                                                    {/* # */}
                                                    <td className="px-5 py-4 text-slate-400 dark:text-slate-500 text-xs font-mono w-10">
                                                        {idx + 1}
                                                    </td>

                                                    {/* Title */}
                                                    <td className="px-5 py-4">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{task.title}</div>
                                                        {task.subSteps.length > 0 && (
                                                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                                {task.subSteps.length} sub-step{task.subSteps.length !== 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Description (hidden on small) */}
                                                    <td className="px-5 py-4 hidden md:table-cell">
                                                        {hasDescription ? (
                                                            <span className="text-slate-600 dark:text-slate-400 line-clamp-2 text-xs leading-relaxed">
                                                                {task.description}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-600 text-xs italic">No description</span>
                                                        )}
                                                    </td>

                                                    {/* Recurrence */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <Repeat2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                                {getRecurrenceLabel(task)}
                                                            </span>
                                                        </div>
                                                        {getWeekDayDots(task)}
                                                    </td>

                                                    {/* Tags (hidden on small/medium) */}
                                                    <td className="px-5 py-4 hidden lg:table-cell">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {taskTags.length > 0 ? taskTags.map(tag => (
                                                                <span
                                                                    key={tag!.id}
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${tag!.color}`}
                                                                >
                                                                    {tag!.name}
                                                                </span>
                                                            )) : (
                                                                <span className="text-xs text-slate-300 dark:text-slate-600 italic">—</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => onEdit(task)}
                                                                className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all duration-150"
                                                                title="Edit task"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(task)}
                                                                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
                                                                title="Delete task"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>

                                                {/* Expanded row — shows details on mobile or full info */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.tr
                                                            key={`${task.id}-expanded`}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.15 }}
                                                        >
                                                            <td colSpan={6} className="bg-primary/5 dark:bg-primary/10 border-b border-slate-100 dark:border-slate-800">
                                                                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    {/* Description always shown in expanded */}
                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Description</p>
                                                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                            {task.description?.trim() || <span className="italic text-slate-400">None</span>}
                                                                        </p>
                                                                    </div>

                                                                    {/* Tags on mobile */}
                                                                    <div className="lg:hidden">
                                                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Tags</p>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {taskTags.length > 0 ? taskTags.map(tag => (
                                                                                <span key={tag!.id} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${tag!.color}`}>
                                                                                    {tag!.name}
                                                                                </span>
                                                                            )) : <span className="text-xs text-slate-400 italic">No tags</span>}
                                                                        </div>
                                                                    </div>

                                                                    {/* Sub-steps */}
                                                                    {task.subSteps.length > 0 && (
                                                                        <div>
                                                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Sub-steps</p>
                                                                            <ul className="space-y-1">
                                                                                {task.subSteps.map(step => (
                                                                                    <li key={step.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                                                        {step.text}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}

                                                                    {/* Completions count */}
                                                                    <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Stats</p>
                                                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                                                            <span className="font-bold text-primary">{task.completions}</span> completion{task.completions !== 1 ? 's' : ''}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    )}
                                                </AnimatePresence>
                                            </React.Fragment>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
