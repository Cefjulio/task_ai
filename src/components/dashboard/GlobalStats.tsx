import React from 'react';
import { calculateStats } from '@/features/tasks/statsCalculator';
import { useTaskStore } from '@/store/taskStore';
import { Card } from '@/components/ui/Card';
import { isTaskDueOn } from '@/features/tasks/frequencyEngine';

export const GlobalStats: React.FC<{ activeTab: 'dynamic' | 'random' }> = ({ activeTab }) => {
    const { tasks, selectedDate, dailyQueueSession } = useTaskStore();

    // Filter tasks based on current tab's domain and date
    const filteredTasks = tasks.filter(t => {
        const isDynamicPriority = ['primary', 'secondary', 'tertiary'].includes(t.priority);
        const category = t.category || (isDynamicPriority ? 'dynamic' : 'random');
        if (category !== activeTab) return false;

        // Strictly filter dynamic tasks by the selected date
        if (activeTab === 'dynamic') {
            return isTaskDueOn(t, selectedDate);
        }

        return true;
    });

    const sessionTaskIds = activeTab === 'dynamic' && dailyQueueSession?.date === selectedDate
        ? dailyQueueSession.taskIds
        : undefined;

    const isRandomTab = activeTab === 'random';
    const stats = calculateStats(filteredTasks, selectedDate, sessionTaskIds, isRandomTab);
    // Use "Today" for dynamic (calendar-based), omit for random (backlog-based)
    const domainLabel = activeTab === 'dynamic' ? 'Daily Core Today' : 'Random Tasks Backlog';

    return (
        <Card className="relative overflow-hidden p-8 md:p-10 flex flex-col gap-8 bg-gradient-to-br from-emerald-400 via-primary to-teal-500 border-none shadow-2xl shadow-primary/20 dark:shadow-none text-white rounded-3xl group">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-teal-800 opacity-20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-1">{domainLabel}</h2>
                    <p className="text-6xl font-display font-extrabold tracking-tighter drop-shadow-sm">{stats.totalTasks}</p>
                </div>
                <div className="flex gap-6 md:gap-10 bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-inner">
                    <div className="text-center md:text-left">
                        <p className="text-xs font-medium opacity-80 uppercase tracking-widest mb-1">Completed</p>
                        <p className="text-3xl font-bold tracking-tight">{stats.completedToday}</p>
                    </div>
                    <div className="w-px bg-white/20 self-stretch"></div>
                    <div className="text-center md:text-left">
                        <p className="text-xs font-medium opacity-80 uppercase tracking-widest mb-1">Skipped</p>
                        <p className="text-3xl font-bold tracking-tight">{stats.skippedToday}</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 w-full mt-2">
                <div className="flex justify-between text-sm font-medium text-white/90 mb-3">
                    <span className="tracking-wide">Daily Completion Rate</span>
                    <span className="font-bold text-lg">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden border border-black/10 p-0.5">
                    <div
                        className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                        style={{ width: `${stats.completionRate}%` }}
                    />
                </div>
            </div>
        </Card>
    );
};
