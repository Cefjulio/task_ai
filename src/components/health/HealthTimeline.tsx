import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Droplet, Activity, Heart, Pill, Edit2, Trash2, CalendarHeart } from 'lucide-react';
import { HealthLog } from '@/types/Health';
import { useHealthStore } from '@/store/healthStore';
import { cn } from '@/components/ui/Button';

interface HealthTimelineProps {
    selectedDate: string; // YYYY-MM-DD
    onEdit: (log: HealthLog) => void;
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ selectedDate, onEdit }) => {
    const { healthLogs, healthTags, deleteHealthLog } = useHealthStore();

    // Filter and sort logs for the selected day (older to newer)
    const logsForDay = healthLogs
        .filter(log => log.loggedAt.startsWith(selectedDate))
        .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this log entry?')) {
            deleteHealthLog(id);
        }
    };

    // Vitals range evaluation helper
    const getBPStatus = (sys?: number, dia?: number) => {
        if (!sys || !dia) return null;
        if (sys >= 180 || dia >= 120) return { label: 'Hypertensive Crisis', color: 'text-red-700 bg-red-100 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' };
        if (sys >= 140 || dia >= 90) return { label: 'Hypertension Stage 2', color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900' };
        if (sys >= 130 || dia >= 80) return { label: 'Hypertension Stage 1', color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900' };
        if (sys >= 120 && dia < 80) return { label: 'Elevated BP', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900' };
        return { label: 'Normal BP', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900' };
    };

    const getGlucoseStatus = (mgdl?: number) => {
        if (!mgdl) return null;
        if (mgdl < 70) return { label: 'Low Glucose (Hypoglycemia)', color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900' };
        if (mgdl >= 200) return { label: 'High Glucose (Hyperglycemia)', color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900' };
        if (mgdl >= 140) return { label: 'Elevated Glucose', color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900' };
        return { label: 'Normal Glucose', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900' };
    };

    const getLogIconConfig = (type: string) => {
        switch (type) {
            case 'meal':
                return { icon: Utensils, bg: 'bg-amber-500 text-white shadow-amber-500/25' };
            case 'water':
                return { icon: Droplet, bg: 'bg-blue-500 text-white shadow-blue-500/25' };
            case 'exercise':
                return { icon: Activity, bg: 'bg-emerald-500 text-white shadow-emerald-500/25' };
            case 'vitals':
                return { icon: Heart, bg: 'bg-rose-500 text-white shadow-rose-500/25' };
            case 'medicine':
                return { icon: Pill, bg: 'bg-purple-500 text-white shadow-purple-500/25' };
            default:
                return { icon: Heart, bg: 'bg-slate-500 text-white shadow-slate-500/25' };
        }
    };

    if (logsForDay.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <CalendarHeart className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4 stroke-[1.5]" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Timeline is Empty</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    No health activities logged for this day. Click the "+ Add Entry" button above to start tracking.
                </p>
            </div>
        );
    }

    return (
        <div className="relative pl-6 md:pl-10 space-y-6">
            {/* Vertical Line */}
            <div className="absolute left-[29px] md:left-[37px] top-4 bottom-4 w-0.5 bg-slate-200/60 dark:bg-slate-800/60" />

            {logsForDay.map((log, index) => {
                const iconConfig = getLogIconConfig(log.type);
                const Icon = iconConfig.icon;
                const bpStatus = getBPStatus(log.systolic, log.diastolic);
                const glucoseStatus = getGlucoseStatus(log.bloodSugar);

                return (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                    >
                        {/* Event Icon Pin */}
                        <div className={cn(
                            "absolute -left-[30px] md:-left-[38px] top-1.5 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-950 transition-transform group-hover:scale-110 duration-300 z-10",
                            iconConfig.bg
                        )}>
                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>

                        {/* Event Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-slate-200 dark:group-hover:border-slate-700">
                            
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        {log.type}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {formatTime(log.loggedAt)}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <button
                                        onClick={() => onEdit(log)}
                                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                        title="Edit entry"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(log.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                                        title="Delete entry"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="space-y-3">
                                {log.description && (
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                        {log.description}
                                    </p>
                                )}

                                {/* 1. Meal Details */}
                                {log.type === 'meal' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {log.mealCategory && (
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                                                    log.mealCategory === 'balanced' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
                                                    log.mealCategory === 'protein' && "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
                                                    log.mealCategory === 'carbs' && "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                                                    log.mealCategory === 'fat' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
                                                    log.mealCategory === 'other' && "bg-slate-100 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400"
                                                )}>
                                                    {log.mealCategory}
                                                </span>
                                            )}

                                            {/* Custom Tags */}
                                            {log.tags && log.tags.length > 0 && log.tags.map(tagId => {
                                                const tag = healthTags.find(t => t.id === tagId);
                                                if (!tag) return null;
                                                return (
                                                    <span
                                                        key={tag.id}
                                                        className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white", tag.color)}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        {/* Picture / Video */}
                                        {log.mediaUrl && (
                                            <div className="mt-2 rounded-xl overflow-hidden shadow-sm max-w-sm bg-slate-50 dark:bg-slate-950 relative border border-slate-100 dark:border-slate-800">
                                                {log.mediaUrl.startsWith('data:video/') || log.mediaUrl.endsWith('.mp4') ? (
                                                    <video src={log.mediaUrl} controls className="w-full max-h-56 object-contain" />
                                                ) : (
                                                    <img src={log.mediaUrl} alt="Meal logged" className="w-full max-h-56 object-cover hover:scale-102 transition-transform duration-300" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 2. Water Details */}
                                {log.type === 'water' && log.waterAmount && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                                            {log.waterAmount} <span className="text-xs font-bold text-slate-400">ml</span>
                                        </span>
                                    </div>
                                )}

                                {/* 3. Exercise Details */}
                                {log.type === 'exercise' && log.exerciseDuration && (
                                    <div className="flex items-center gap-2 flex-wrap text-xs">
                                        <span className="font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                            ⏱️ {log.exerciseDuration} mins
                                        </span>
                                        {log.exerciseIntensity && (
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                                                log.exerciseIntensity === 'high' && "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
                                                log.exerciseIntensity === 'medium' && "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                                                log.exerciseIntensity === 'low' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                            )}>
                                                {log.exerciseIntensity} Intensity
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* 4. Vitals Details */}
                                {log.type === 'vitals' && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {log.systolic && log.diastolic && (
                                                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        Blood Pressure
                                                    </span>
                                                    <span className="text-base font-black text-slate-800 dark:text-slate-100">
                                                        {log.systolic}/{log.diastolic} <span className="text-xs font-bold text-slate-400">mmHg</span>
                                                    </span>
                                                    {bpStatus && (
                                                        <span className={cn("block mt-1 text-[9px] px-1.5 py-0.5 border rounded-md font-bold uppercase tracking-wider inline-block", bpStatus.color)}>
                                                            {bpStatus.label}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {log.bloodSugar && (
                                                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        Blood Sugar (Glucose)
                                                    </span>
                                                    <span className="text-base font-black text-slate-800 dark:text-slate-100">
                                                        {log.bloodSugar} <span className="text-xs font-bold text-slate-400">mg/dL</span>
                                                    </span>
                                                    {glucoseStatus && (
                                                        <span className={cn("block mt-1 text-[9px] px-1.5 py-0.5 border rounded-md font-bold uppercase tracking-wider inline-block", glucoseStatus.color)}>
                                                            {glucoseStatus.label}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 5. Medicine Details */}
                                {log.type === 'medicine' && log.medicineName && (
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-2 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/30 dark:border-purple-900/30 rounded-xl flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                            <span className="font-extrabold text-purple-700 dark:text-purple-400">
                                                💊 {log.medicineName}
                                            </span>
                                            {log.medicineDosage && (
                                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                                    Dosage: {log.medicineDosage}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
