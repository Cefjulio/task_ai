import React, { useMemo, useState } from 'react';
import { useStudyStore } from '@/store/studyStore';
import { useTaskStore } from '@/store/taskStore';
import { StudyItemCard } from '@/components/study/StudyItemCard';
import { StudyItem, StudyPriority } from '@/types/StudyItem';
import { Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/components/ui/Button';

interface StudyListPageProps {
    onEdit: (item: StudyItem) => void;
}

type PriorityFilter = StudyPriority | 'all';

const PRIORITY_FILTERS: { value: PriorityFilter; label: string; dot: string }[] = [
    { value: 'all',    label: 'All',    dot: 'bg-slate-400' },
    { value: 'high',   label: 'High',   dot: 'bg-red-500' },
    { value: 'medium', label: 'Medium', dot: 'bg-amber-500' },
    { value: 'low',    label: 'Low',    dot: 'bg-green-500' },
];

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export const StudyListPage: React.FC<StudyListPageProps> = ({ onEdit }) => {
    const { studyItems } = useStudyStore();
    const { tags } = useTaskStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

    const filteredItems = useMemo(() => {
        let items = studyItems;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(t => t.title.toLowerCase().includes(q));
        }

        if (selectedTagFilter) {
            items = items.filter(t => t.tags.includes(selectedTagFilter));
        }

        if (priorityFilter !== 'all') {
            items = items.filter(t => (t.priority || 'medium') === priorityFilter);
        }

        // Sort: pending before reviewed, then by priority (high > medium > low), then by updated date
        return [...items].sort((a, b) => {
            const aReviewed = a.status === 'reviewed' || a.status === 'completed';
            const bReviewed = b.status === 'reviewed' || b.status === 'completed';
            if (!aReviewed && bReviewed) return -1;
            if (aReviewed && !bReviewed) return 1;
            const pa = PRIORITY_ORDER[a.priority || 'medium'] ?? 1;
            const pb = PRIORITY_ORDER[b.priority || 'medium'] ?? 1;
            if (pa !== pb) return pa - pb;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
    }, [studyItems, searchQuery, selectedTagFilter, priorityFilter]);

    return (
        <div className="space-y-6">
            {/* Search + Priority Filters row */}
            <div className="flex flex-col gap-4 mb-2">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:text-white"
                        />
                    </div>

                    {/* Tag filters */}
                    <div className="flex w-full md:w-auto items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => setSelectedTagFilter(null)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                selectedTagFilter === null
                                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md scale-100'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 scale-95 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            All Tags
                        </button>
                        {tags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => setSelectedTagFilter(tag.id)}
                                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap"
                                style={{
                                    backgroundColor: selectedTagFilter === tag.id ? tag.color : `${tag.color}15`,
                                    color: selectedTagFilter === tag.id ? '#ffffff' : tag.color,
                                    boxShadow: selectedTagFilter === tag.id ? `0 4px 14px 0 ${tag.color}40` : 'none',
                                    transform: selectedTagFilter === tag.id ? 'scale(1)' : 'scale(0.95)'
                                }}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority filters */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Priority:</span>
                    {PRIORITY_FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setPriorityFilter(f.value)}
                            className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                priorityFilter === f.value
                                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md"
                                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                            )}
                        >
                            <span className={cn("w-2 h-2 rounded-full", f.dot)} />
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Info className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No items found</h3>
                    <p className="text-slate-500 max-w-md">Try adjusting your filters or click the button down below to add a new study item.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                                <StudyItemCard item={item} onEdit={onEdit} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
