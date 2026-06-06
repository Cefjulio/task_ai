import React, { useState } from 'react';
import { HealthTimeline } from '@/components/health/HealthTimeline';
import { HealthInsights } from '@/components/health/HealthInsights';
import { HealthFormModal } from '@/components/health/HealthFormModal';
import { ManageHealthTagsModal } from '@/components/health/ManageHealthTagsModal';
import { FastingCard } from '@/components/health/FastingCard';
import { HealthLog } from '@/types/Health';
import { Button } from '@/components/ui/Button';
import { Plus, Tag, ChevronLeft, ChevronRight, Calendar, Heart } from 'lucide-react';

export const HealthPage: React.FC = () => {
    const getTodayDateString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isTagsOpen, setIsTagsOpen] = useState(false);
    const [logToEdit, setLogToEdit] = useState<HealthLog | null>(null);

    const handlePrevDay = () => {
        const d = new Date(selectedDate + 'T12:00:00');
        d.setDate(d.getDate() - 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const d = new Date(selectedDate + 'T12:00:00');
        d.setDate(d.getDate() + 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const handleEditLog = (log: HealthLog) => {
        setLogToEdit(log);
        setIsFormOpen(true);
    };

    const handleAddClick = () => {
        setLogToEdit(null);
        setIsFormOpen(true);
    };

    // Generate days of the week surrounding the selected date
    const getWeekDays = () => {
        const days = [];
        const baseDate = new Date(selectedDate + 'T12:00:00');
        
        // Go 3 days back and 3 days forward
        for (let i = -3; i <= 3; i++) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString([], { weekday: 'short' });
            const dayNum = d.getDate();
            days.push({ dateStr, dayName, dayNum });
        }
        return days;
    };

    const weekDays = getWeekDays();

    const formatDateHeading = (dateStr: string) => {
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Heart className="w-7 h-7 text-rose-500 fill-rose-500/20" />
                        Health & Vitals Tracker
                    </h1>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                        Track Meals, Water, Active time, Blood glucose, BP & medicines
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        onClick={() => setIsTagsOpen(true)}
                        variant="outline"
                        className="flex-1 md:flex-none border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200"
                        size="sm"
                    >
                        <Tag className="w-4 h-4 mr-2" />
                        Manage Tags
                    </Button>
                    <Button
                        onClick={handleAddClick}
                        className="flex-1 md:flex-none bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10"
                        size="sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Log Entry
                    </Button>
                </div>
            </div>

            {/* Premium Date Navigator & Week view */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/40 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={handlePrevDay}
                        className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 text-center">
                        <Calendar className="w-4 h-4 text-rose-500 hidden sm:inline" />
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                            {formatDateHeading(selectedDate)}
                        </h2>
                    </div>

                    <button
                        onClick={handleNextDay}
                        className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Horizontal week view */}
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map(({ dateStr, dayName, dayNum }) => {
                        const isSelected = dateStr === selectedDate;
                        const isToday = dateStr === getTodayDateString();

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={`flex flex-col items-center py-2.5 rounded-2xl border transition-all duration-300 ${
                                    isSelected
                                        ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20 scale-100'
                                        : 'bg-white border-slate-150 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 scale-[0.97]'
                                }`}
                            >
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {dayName}
                                </span>
                                <span className="text-base font-black tracking-tight mt-0.5">
                                    {dayNum}
                                </span>
                                {isToday && !isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Dashboard Contents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Daily Timeline (Left on large screen) */}
                <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 pl-2">
                        Daily Activity Feed
                    </h3>
                    <HealthTimeline selectedDate={selectedDate} onEdit={handleEditLog} />
                </div>

                {/* Health Metrics and insights (Right on large screen) */}
                <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 pl-2">
                        Daily Metrics & Insights
                    </h3>
                    <FastingCard />
                    <HealthInsights selectedDate={selectedDate} />
                </div>

            </div>

            {/* Form Modal */}
            <HealthFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                logToEdit={logToEdit}
                defaultDate={selectedDate}
            />

            {/* Manage Tags Modal */}
            <ManageHealthTagsModal
                isOpen={isTagsOpen}
                onClose={() => setIsTagsOpen(false)}
            />

        </div>
    );
};
export default HealthPage;
