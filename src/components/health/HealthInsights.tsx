import React from 'react';
import { useHealthStore } from '@/store/healthStore';
import { Droplet, Activity, Heart, Pill, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { cn } from '@/components/ui/Button';

interface HealthInsightsProps {
    selectedDate: string; // YYYY-MM-DD
}

export const HealthInsights: React.FC<HealthInsightsProps> = ({ selectedDate }) => {
    const { healthLogs, healthTags } = useHealthStore();

    // Filter logs for the selected day
    const logsForDay = healthLogs.filter(log => log.loggedAt.startsWith(selectedDate));

    // 1. Water Stats
    const totalWater = logsForDay
        .filter(log => log.type === 'water')
        .reduce((sum, log) => sum + (log.waterAmount || 0), 0);
    const WATER_TARGET = 2000; // ml
    const waterPercentage = Math.min(100, Math.round((totalWater / WATER_TARGET) * 100));

    // 2. Exercise Stats
    const exerciseLogs = logsForDay.filter(log => log.type === 'exercise');
    const totalExerciseMinutes = exerciseLogs.reduce((sum, log) => sum + (log.exerciseDuration || 0), 0);
    const exerciseSessions = exerciseLogs.length;

    // 3. Medicine Stats
    const medicineLogs = logsForDay.filter(log => log.type === 'medicine');

    // 4. Vitals Summary
    const vitalsLogs = logsForDay.filter(log => log.type === 'vitals');
    const bloodSugarValues = vitalsLogs.map(l => l.bloodSugar).filter((v): v is number => v !== undefined);
    const systolicValues = vitalsLogs.map(l => l.systolic).filter((v): v is number => v !== undefined);
    const diastolicValues = vitalsLogs.map(l => l.diastolic).filter((v): v is number => v !== undefined);

    // 5. Meals Tag-based Warnings/Benefits
    const mealLogs = logsForDay.filter(log => log.type === 'meal');
    const activeTagsForDay = mealLogs.flatMap(m => m.tags || []).map(tagId => healthTags.find(t => t.id === tagId)).filter(Boolean);

    // Scan tags for glucose/cholesterol impacts
    const negativeTags = activeTagsForDay.filter(tag => 
        tag?.name.toLowerCase().includes('negative') || 
        tag?.name.toLowerCase().includes('bad') || 
        tag?.name.toLowerCase().includes('avoid') ||
        tag?.name.toLowerCase().includes('warning')
    );

    const positiveTags = activeTagsForDay.filter(tag => 
        tag?.name.toLowerCase().includes('positive') || 
        tag?.name.toLowerCase().includes('good') || 
        tag?.name.toLowerCase().includes('healthy') ||
        tag?.name.toLowerCase().includes('benefit')
    );

    // Generate dynamic health insights based on the day's events
    const getGeneralInsight = () => {
        if (logsForDay.length === 0) {
            return {
                message: "No logs today. Logging meals, water, and exercise helps you build awareness of your body's patterns.",
                type: 'info'
            };
        }

        if (negativeTags.length > 0) {
            const tagNames = negativeTags.map(t => t?.name).join(', ');
            return {
                message: `Watch out! You've logged meals with caution tags: "${tagNames}". Consider monitoring your vitals (blood sugar or blood pressure) later today to see their response.`,
                type: 'warning'
            };
        }

        if (totalWater >= WATER_TARGET && totalExerciseMinutes >= 30) {
            return {
                message: "Fantastic job today! You've reached your water hydration goal and completed at least 30 minutes of exercise. Your body is loving this!",
                type: 'success'
            };
        }

        if (positiveTags.length > 0) {
            return {
                message: "Excellent food choices! You logged meals marked with positive health impacts. This supports long-term glucose and cardiovascular health.",
                type: 'success'
            };
        }

        if (totalWater < 1000 && logsForDay.length > 0) {
            return {
                message: "Your water intake is a bit low today. Try to drink a glass or two of water soon to boost energy and metabolism.",
                type: 'warning'
            };
        }

        return {
            message: "Keep tracking! Seeing your daily timeline helps visualize how nutrition, active time, and medicine dosage link with your energy and vitals.",
            type: 'info'
        };
    };

    const insight = getGeneralInsight();

    return (
        <div className="space-y-6">
            
            {/* Header / Dynamic Tip Card */}
            <div className={cn(
                "p-5 rounded-3xl border flex gap-4 items-start shadow-sm transition-all duration-300",
                insight.type === 'warning' && "bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50",
                insight.type === 'success' && "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50",
                insight.type === 'info' && "bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800/80"
            )}>
                {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
                {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                {insight.type === 'info' && <Heart className="w-5 h-5 text-rose-500 fill-rose-500/10 shrink-0 mt-0.5 animate-pulse" />}
                
                <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        {insight.type === 'warning' ? 'Health Caution' : insight.type === 'success' ? 'Great Progress' : 'Daily Insight'}
                    </h4>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                        {insight.message}
                    </p>
                </div>
            </div>

            {/* Grid of Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Hydration Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                <Droplet className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Hydration</h4>
                                <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                                    {totalWater} <span className="text-xs font-bold text-slate-400">/ {WATER_TARGET} ml</span>
                                </span>
                            </div>
                        </div>
                        <span className="text-sm font-black text-blue-500">{waterPercentage}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${waterPercentage}%` }}
                        />
                    </div>
                </div>

                {/* 2. Fitness / Exercise Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Activity</h4>
                                <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                                    {totalExerciseMinutes} <span className="text-xs font-bold text-slate-400">mins</span>
                                </span>
                            </div>
                        </div>
                        {exerciseSessions > 0 && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                {exerciseSessions} {exerciseSessions === 1 ? 'Session' : 'Sessions'}
                            </span>
                        )}
                    </div>
                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        {totalExerciseMinutes >= 30 
                            ? '🎉 Met recommended daily exercise duration.' 
                            : exerciseSessions > 0 
                            ? `Active today. Try to hit 30 minutes total.` 
                            : 'No workouts logged today yet.'}
                    </div>
                </div>

                {/* 3. Vitals Range Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                            <Heart className="w-5 h-5 fill-current" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Vitals Summary</h4>
                    </div>

                    <div className="space-y-3">
                        {/* Blood Pressure Summary */}
                        <div className="flex justify-between items-center py-1.5 border-b border-dashed border-slate-100 dark:border-slate-850">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Blood Pressure Range</span>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                                {systolicValues.length > 0 
                                    ? `${Math.min(...systolicValues)}-${Math.max(...systolicValues)} / ${Math.min(...diastolicValues)}-${Math.max(...diastolicValues)} mmHg`
                                    : 'No records'}
                            </span>
                        </div>

                        {/* Glucose Summary */}
                        <div className="flex justify-between items-center py-1.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Blood Sugar (Glucose) Range</span>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                                {bloodSugarValues.length > 0 
                                    ? `${Math.min(...bloodSugarValues)} - ${Math.max(...bloodSugarValues)} mg/dL`
                                    : 'No records'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Medicines Taken Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                            <Pill className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Medicines Taken ({medicineLogs.length})</h4>
                    </div>

                    {medicineLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 font-semibold py-2">
                            No medicines logged for today.
                        </p>
                    ) : (
                        <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                            {medicineLogs.map(log => {
                                const logTime = new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                return (
                                    <div key={log.id} className="flex justify-between items-center text-xs p-1.5 bg-slate-50 dark:bg-slate-950 rounded-lg">
                                        <span className="font-bold text-slate-700 dark:text-slate-350">
                                            💊 {log.medicineName} {log.medicineDosage ? `(${log.medicineDosage})` : ''}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400">
                                            {logTime}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};
