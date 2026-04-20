import React, { useMemo, useState } from 'react';
import { useStudyStore } from '@/store/studyStore';
import { useTaskStore } from '@/store/taskStore';
import { StudyItemCard } from '@/components/study/StudyItemCard';
import { StudyItem } from '@/types/StudyItem';
import { Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyListPageProps {
    onEdit: (item: StudyItem) => void;
}

export const StudyListPage: React.FC<StudyListPageProps> = ({ onEdit }) => {
    const { studyItems } = useStudyStore();
    const { tags } = useTaskStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTagFitler, setSelectedTagFilter] = useState<string | null>(null);

    const filteredItems = useMemo(() => {
        let items = studyItems;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(t => t.title.toLowerCase().includes(q));
        }

        if (selectedTagFitler) {
            items = items.filter(t => t.tags.includes(selectedTagFitler));
        }

        // Sort pending top, completed bottom
        return [...items].sort((a, b) => {
            if (a.status === 'pending' && b.status === 'completed') return -1;
            if (a.status === 'completed' && b.status === 'pending') return 1;
            // then by updated at
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
    }, [studyItems, searchQuery, selectedTagFitler]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
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

                <div className="flex w-full md:w-auto items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                        onClick={() => setSelectedTagFilter(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            selectedTagFitler === null
                                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md scale-100'
                                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 scale-95 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        All
                    </button>
                    {tags.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => setSelectedTagFilter(tag.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap"
                            style={{
                                backgroundColor: selectedTagFitler === tag.id ? tag.color : `${tag.color}15`,
                                color: selectedTagFitler === tag.id ? '#ffffff' : tag.color,
                                boxShadow: selectedTagFitler === tag.id ? `0 4px 14px 0 ${tag.color}40` : 'none',
                                transform: selectedTagFitler === tag.id ? 'scale(1)' : 'scale(0.95)'
                            }}
                        >
                            {tag.name}
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
