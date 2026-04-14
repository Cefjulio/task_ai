import React from 'react';
import { cn } from '@/components/ui/Button';
import { LayoutList } from 'lucide-react';

export type TabType = 'dynamic' | 'random' | 'core-tasks';

interface TabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex p-1.5 space-x-2 bg-slate-200/50 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl mb-8 w-full md:w-auto md:inline-flex border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
                onClick={() => onTabChange('dynamic')}
                className={cn(
                    'flex-1 md:w-44 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-out',
                    activeTab === 'dynamic'
                        ? 'bg-white text-primary shadow-md dark:bg-slate-700 dark:text-primary-light scale-100'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 scale-[0.98]'
                )}
            >
                Dynamic Tasks
            </button>
            <button
                onClick={() => onTabChange('random')}
                className={cn(
                    'flex-1 md:w-44 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-out',
                    activeTab === 'random'
                        ? 'bg-white text-primary shadow-md dark:bg-slate-700 dark:text-primary-light scale-100'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 scale-[0.98]'
                )}
            >
                Random Tasks
            </button>
            <button
                onClick={() => onTabChange('core-tasks')}
                className={cn(
                    'flex-1 md:w-44 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2',
                    activeTab === 'core-tasks'
                        ? 'bg-white text-primary shadow-md dark:bg-slate-700 dark:text-primary-light scale-100'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 scale-[0.98]'
                )}
            >
                <LayoutList className="w-4 h-4 shrink-0" />
                Daily Core
            </button>
        </div>
    );
};
