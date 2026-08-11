import React from 'react';
import { motion } from 'framer-motion';
import { Course, Lesson } from '@/types/Lms';
import { QuillContent } from '@/components/ui/QuillContent';
import { PlayCircle } from 'lucide-react';

interface ContinueLearningBannerProps {
    course: Course;
    lesson: Lesson;
    onResume: () => void;
}

export const ContinueLearningBanner: React.FC<ContinueLearningBannerProps> = ({ course, lesson, onResume }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl px-6 py-5 border border-violet-200 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-900/20"
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-violet-500/15 flex items-center justify-center text-xl shrink-0">
                    {course.emoji || '📚'}
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-violet-500">Continue Learning</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{course.title}</p>
                    <QuillContent
                        html={lesson.title}
                        className="!p-0 text-xs text-slate-500 dark:text-slate-400 truncate [&_p]:m-0"
                    />
                </div>
            </div>
            <button
                onClick={onResume}
                className="shrink-0 flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-3 rounded-2xl border-b-4 border-violet-700 shadow-lg shadow-violet-500/30 active:border-b-2 active:translate-y-0.5 transition-all"
            >
                <PlayCircle className="w-4 h-4" />
                Resume
            </button>
        </motion.div>
    );
};
