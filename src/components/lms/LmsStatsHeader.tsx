import React from 'react';
import { GraduationCap, BookMarked, CheckCircle2, TrendingUp } from 'lucide-react';
import { Course, Lesson } from '@/types/Lms';

interface LmsStatsHeaderProps {
    courses: Course[];
    lessons: Lesson[];
}

export const LmsStatsHeader: React.FC<LmsStatsHeaderProps> = ({ courses, lessons }) => {
    const totalCourses = courses.length;
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(l => l.status === 'completed').length;
    const inProgressLessons = lessons.filter(l => l.status === 'in_progress').length;

    const weighted = completedLessons + inProgressLessons * 0.5;
    const rate = totalLessons > 0 ? Math.round((weighted / totalLessons) * 100) : 0;
    const rateColor = rate >= 80 ? 'text-emerald-400' : rate >= 50 ? 'text-amber-400' : 'text-primary-light';

    return (
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col gap-6"
            style={{
                background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 50%, #a78bfa 100%)',
            }}
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-900/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-4 h-4 text-violet-200" />
                        <span className="text-white/70 text-xs font-extrabold uppercase tracking-widest">Learning Management</span>
                    </div>
                    <p className="text-6xl font-black text-white tracking-tighter leading-none drop-shadow">{totalCourses}</p>
                    <p className="text-white/60 text-sm font-semibold mt-1">{totalCourses === 1 ? 'course' : 'courses'}</p>
                </div>

                <div className="flex gap-4 sm:gap-6">
                    <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20 min-w-[90px]">
                        <BookMarked className="w-5 h-5 text-violet-200 mx-auto mb-1" />
                        <p className="text-3xl font-black text-white">{totalLessons}</p>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wide mt-0.5">Lessons</p>
                    </div>
                    <div className="text-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20 min-w-[90px]">
                        <CheckCircle2 className="w-5 h-5 text-emerald-300 mx-auto mb-1" />
                        <p className="text-3xl font-black text-white">{completedLessons}</p>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-wide mt-0.5">Done</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Overall Progress
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
                                : 'linear-gradient(90deg, #ffffff, #ede9fe)',
                            boxShadow: '0 0 12px rgba(255,255,255,0.4)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
