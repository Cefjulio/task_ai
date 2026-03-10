import React, { useState } from 'react';
import { useQueue } from '@/hooks/useQueue';
import { ChevronDown, ChevronUp, Layers, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueuedTasksBacklogProps {
    onEdit: (task: any) => void;
    category?: 'dynamic' | 'random';
}

export const QueuedTasksBacklog: React.FC<QueuedTasksBacklogProps> = ({ onEdit, category = 'dynamic' }) => {
    const { fullSecondary, fullTertiary } = useQueue(category);
    const [isExpanded, setIsExpanded] = useState(false);

    const allQueued = [
        ...fullSecondary.map((t, i) => ({ ...t, turn: i + 1, group: 'Secondary' })),
        ...fullTertiary.map((t, i) => ({ ...t, turn: i + 1, group: 'Tertiary' }))
    ].sort((a, b) => {
        // Sort by turn then group if needed, but the user wants to see them as "queued and pending"
        // Let's show them grouped by priority as that's how they are processed.
        return a.turn - b.turn;
    });

    if (allQueued.length === 0) return null;

    return (
        <div className="mt-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-300">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                            Queue Backlog
                            <span className="text-[10px] font-black bg-slate-200 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {allQueued.length} Tasks
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Secondary & Tertiary tasks waiting for their turn</p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 pt-0 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar font-display">
                            <div className="space-y-3">
                                {allQueued.map((t) => (
                                    <div key={t.id} className="relative group/item flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="flex flex-col items-center justify-center min-w-[32px] h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] ring-1 ring-slate-200 dark:ring-slate-700">
                                            Q{t.turn}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover/item:text-primary transition-colors">{t.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${t.priority === 'secondary'
                                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                                                            : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'
                                                        }`}>
                                                        {t.priority}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onEdit(t); }}
                                                        className="p-1.5 opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                        title="Edit Task"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            {t.description && (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate opacity-80">{t.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
