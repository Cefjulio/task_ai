import React from 'react';
import { cn } from '@/components/ui/Button';
import { Target, Zap, LayoutList, Shuffle, BookOpen, Heart } from 'lucide-react';

export type TabType = 'goals' | 'dynamic' | 'core-tasks' | 'random' | 'study-list' | 'health';

interface TabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; shortLabel: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
    {
        id: 'goals',
        label: 'Goals & Plans',
        shortLabel: 'Goals',
        icon: <Target className="w-4 h-4" />,
        color: 'text-violet-500',
        activeColor: 'text-violet-600 dark:text-violet-400',
    },
    {
        id: 'dynamic',
        label: 'Dynamic',
        shortLabel: 'Dynamic',
        icon: <Zap className="w-4 h-4" />,
        color: 'text-primary',
        activeColor: 'text-primary dark:text-primary-light',
    },
    {
        id: 'core-tasks',
        label: 'Daily Core',
        shortLabel: 'Core',
        icon: <LayoutList className="w-4 h-4" />,
        color: 'text-teal-500',
        activeColor: 'text-teal-600 dark:text-teal-400',
    },
    {
        id: 'random',
        label: 'Random',
        shortLabel: 'Random',
        icon: <Shuffle className="w-4 h-4" />,
        color: 'text-orange-500',
        activeColor: 'text-orange-600 dark:text-orange-400',
    },
    {
        id: 'study-list',
        label: 'Study List',
        shortLabel: 'Study',
        icon: <BookOpen className="w-4 h-4" />,
        color: 'text-indigo-500',
        activeColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
        id: 'health',
        label: 'Health',
        shortLabel: 'Health',
        icon: <Heart className="w-4 h-4 fill-current" />,
        color: 'text-rose-500',
        activeColor: 'text-rose-600 dark:text-rose-400',
    },
];

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="w-full overflow-x-auto pb-1 -mx-1 px-1">
            <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all duration-200 whitespace-nowrap border-b-4 select-none',
                                isActive
                                    ? `bg-white dark:bg-slate-800 shadow-md border-slate-200 dark:border-slate-600 ${tab.activeColor} scale-105`
                                    : 'bg-slate-100/70 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 active:scale-95'
                            )}
                        >
                            <span className={isActive ? tab.activeColor : 'text-slate-400 dark:text-slate-500'}>
                                {tab.icon}
                            </span>
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.shortLabel}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
