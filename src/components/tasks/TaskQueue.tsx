import React from 'react';
import { useQueue } from '@/hooks/useQueue';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/Button';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';

interface TaskQueueProps {
    onEdit: (t: any) => void;
    category?: 'dynamic' | 'random';
    isOpen: boolean;
    onToggle: () => void;
}

export const TaskQueue: React.FC<TaskQueueProps> = ({ onEdit, category = 'random', isOpen, onToggle }) => {
    const { visibleSecondary, visibleTertiary, refreshQueue } = useQueue(category);
    const [searchQuery, setSearchQuery] = React.useState('');

    const totalCount = visibleSecondary.length + visibleTertiary.length;
    const allQueue = [...visibleSecondary, ...visibleTertiary].filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`flex flex-col ${isOpen ? 'h-full' : ''} overflow-hidden`}>
            <div className="flex flex-col gap-4 p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 whitespace-nowrap">Up Next</h2>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full shrink-0">
                            {totalCount}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {isOpen && (
                            <Button variant="ghost" size="sm" onClick={refreshQueue} className="text-slate-400 hover:text-primary gap-1.5 h-8 font-semibold transition-colors">
                                <RefreshCw className="w-3.5 h-3.5" /> Refresh
                            </Button>
                        )}
                        <button
                            onClick={onToggle}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                            aria-label={isOpen ? 'Collapse Up Next' : 'Expand Up Next'}
                        >
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                {isOpen && <SearchInput value={searchQuery} onChange={setSearchQuery} />}
            </div>

            {isOpen && (
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {allQueue.length === 0 ? (
                        <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-slate-500 dark:text-slate-400">
                                {searchQuery ? 'No tasks found in queue.' : 'Your queue is empty!'}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col w-full gap-4">
                            {allQueue.map(t => (
                                <div key={t.id} className="animate-in fade-in slide-in-from-bottom-2">
                                    <TaskCard task={t} onEdit={onEdit} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
