import React, { useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export const DateFilter: React.FC = () => {
    const { selectedDate, setSelectedDate } = useTaskStore();
    const dateInputRef = useRef<HTMLInputElement>(null);

    // Parse the date safely to avoid timezone shifts
    const current = parseISO(selectedDate);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        const prev = subDays(current, 1);
        setSelectedDate(format(prev, 'yyyy-MM-dd'));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const next = addDays(current, 1);
        setSelectedDate(format(next, 'yyyy-MM-dd'));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            setSelectedDate(e.target.value);
        }
    };

    const triggerDatePicker = () => {
        // showPicker() is the modern web standard for triggering the native picker
        if (dateInputRef.current && 'showPicker' in dateInputRef.current) {
            try {
                dateInputRef.current.showPicker();
            } catch (err) {
                console.error("Native showPicker failed", err);
            }
        } else {
            // Fallback for older browsers
            (dateInputRef.current as any)?.focus();
            (dateInputRef.current as any)?.click();
        }
    };

    // Generate a small range of days around the selected date for a scroller-like feel
    const daysRange = [-3, -2, -1, 0, 1, 2, 3].map(offset => addDays(current, offset));

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Hidden native date input */}
            <input
                type="date"
                ref={dateInputRef}
                className="sr-only"
                onChange={handleDateChange}
                value={selectedDate}
            />

            <div className="flex items-center justify-between w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[24px] p-1.5 shadow-lg shadow-slate-200/40 dark:shadow-none border border-slate-200/60 dark:border-slate-800/60 transition-all duration-300">
                <button
                    onClick={handlePrev}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90 text-slate-500 hover:text-primary"
                    aria-label="Previous Day"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    className="flex-1 flex items-center justify-center gap-2.5 group cursor-pointer px-4 py-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                    onClick={triggerDatePicker}
                >
                    <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-100 tracking-tight">
                        {isSameDay(current, new Date()) ? 'Today' : format(current, 'MMMM d, yyyy')}
                    </span>
                </button>

                <button
                    onClick={handleNext}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90 text-slate-500 hover:text-primary"
                    aria-label="Next Day"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="flex justify-center gap-3 w-full px-2 overflow-x-auto pb-1 no-scrollbar select-none">
                {daysRange.map((date, i) => {
                    const isSelected = isSameDay(date, current);
                    const isToday = isSameDay(date, new Date());
                    const fmtDate = format(date, 'yyyy-MM-dd');

                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedDate(fmtDate)}
                            className={`flex flex-col items-center min-w-[48px] py-2.5 rounded-[20px] transition-all duration-500 ${isSelected
                                ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110 ring-4 ring-primary/10 z-10'
                                : 'bg-white/50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-500 border border-slate-100/50 dark:border-slate-800/50 hover:border-primary/40 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            <span className={`text-[9px] uppercase font-black tracking-widest mb-1 ${isSelected ? 'opacity-90' : 'opacity-50'}`}>
                                {format(date, 'EEE')}
                            </span>
                            <span className="text-sm font-black tracking-tighter">
                                {format(date, 'd')}
                            </span>
                            {isToday && !isSelected && (
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
