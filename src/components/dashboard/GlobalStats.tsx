import React from 'react';
import { calculateStats } from '@/features/tasks/statsCalculator';
import { useTaskStore } from '@/store/taskStore';
import { isTaskDueOn } from '@/features/tasks/frequencyEngine';
import { Flame, CheckCircle2, SkipForward, TrendingUp } from 'lucide-react';

export const GlobalStats: React.FC<{ activeTab: 'dynamic' | 'random' }> = ({ activeTab }) => {
    const { tasks, selectedDate, dailyQueueSession } = useTaskStore();

    const filteredTasks = tasks.filter(t => {
        const isDynamicPriority = ['primary', 'secondary', 'tertiary'].includes(t.priority);
        const category = t.category || (isDynamicPriority ? 'dynamic' : 'random');
        if (category !== activeTab) return false;
        if (activeTab === 'dynamic') return isTaskDueOn(t, selectedDate);
        return true;
    });

    const sessionTaskIds = activeTab === 'dynamic' && dailyQueueSession?.date === selectedDate
        ? dailyQueueSession.taskIds
        : undefined;

    const stats = calculateStats(filteredTasks, selectedDate, sessionTaskIds, activeTab === 'random');
    const domainLabel = activeTab === 'dynamic' ? 'Today\'s Tasks' : 'Random Tasks';

    const rate = stats.completionRate;
    const rateColor = rate >= 80 ? 'text-emerald-400' : rate >= 50 ? 'text-amber-400' : 'text-primary-light';

    return (
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col gap-6"
            style={{
                background: 'linear-gradient(135deg, #1a7de0 0%, #1CB0F6 50%, #0dd4f0 100%)',
            }}
        >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-900/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />

            {/* Top row */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Flame className="w-4 h-4 text-orange-300" />
                        <span className="text-white/70 text-xs font-extrabold uppercase tracking-widest">{domainLabel}</span>
                    </div>
                    <p className="text-6xl font-black text-white tracking-tighter leading-none drop-shadow">{stats.totalTasks}</p>
                    <p className="text-white/60 text-sm font-semibold mt-1">total tasks</p>
                </div>

                <div className="flex gap-4 sm:gap-6">
                    <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20 min-w-[90px]">
                        <CheckCircle2 className="w-5 h-5 text-emerald-300 mx-auto mb-1" />
                        <p className="text-3xl font-black text-white">{stats.completedToday}</p>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wide mt-0.5">Done</p>
                    </div>
                    <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20 min-w-[90px]">
                        <SkipForward className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                        <p className="text-3xl font-black text-white">{stats.skippedToday}</p>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wide mt-0.5">Skipped</p>
                    </div>
                </div>
            </div>

            {/* XP-style progress bar */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Completion Rate
                    </span>
                    <span className={`text-xl font-black ${rateColor}`}>{rate}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-4 border border-black/10 p-0.5">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${rate}%`,
                            background: rate >= 80
                                ? 'linear-gradient(90deg, #34d399, #10b981)'
                                : rate >= 50
                                ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                : 'linear-gradient(90deg, #ffffff, #e0f2fe)',
                            boxShadow: '0 0 12px rgba(255,255,255,0.4)',
                        }}
                    />
                </div>
                {/* XP milestone dots */}
                <div className="flex justify-between mt-1 px-0.5">
                    {[25, 50, 75, 100].map(milestone => (
                        <span key={milestone} className={`text-[10px] font-extrabold ${rate >= milestone ? 'text-white/80' : 'text-white/30'}`}>
                            {milestone}%
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
