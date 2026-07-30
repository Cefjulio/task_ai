import React from 'react';
import { StudyItem } from '@/types/StudyItem';
import { X, TrendingUp, CheckCircle, BookMarked, Video, FileText, Globe, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const CONTENT_ICONS: Record<string, React.ReactNode> = {
    youtube: <Video className="w-4 h-4 text-red-500" />,
    pdf:     <FileText className="w-4 h-4 text-orange-500" />,
    audio:   <Headphones className="w-4 h-4 text-purple-500" />,
    webpage: <Globe className="w-4 h-4 text-blue-500" />,
};

interface ActiveStudyBannerProps {
    item: StudyItem;
    onUpdateProgress: () => void;
    onMarkDone: () => void;
    onDismiss: () => void;
}

export const ActiveStudyBanner: React.FC<ActiveStudyBannerProps> = ({
    item,
    onUpdateProgress,
    onMarkDone,
    onDismiss,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            className="relative bg-white dark:bg-slate-900 border-2 border-primary/40 rounded-3xl p-5 shadow-lg shadow-primary/10 mb-2"
        >
            {/* Pulsing ring */}
            <div className="absolute -inset-px rounded-3xl border-2 border-primary/20 animate-pulse pointer-events-none" />

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-11 h-11 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                    <BookMarked className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                    {/* Status label */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Now Studying
                        </span>
                        {CONTENT_ICONS[item.contentType]}
                    </div>

                    <h3 className="font-black text-slate-800 dark:text-white text-base truncate">{item.title}</h3>

                    {item.lastPageRead && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Last at: <span className="font-bold text-slate-700 dark:text-slate-200">{item.lastPageRead}</span>
                        </p>
                    )}

                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-500"
                                style={{ width: `${item.completionPercentage}%` }}
                            />
                        </div>
                        <span className="text-xs font-black text-primary shrink-0">{item.completionPercentage}%</span>
                    </div>
                </div>

                {/* Dismiss */}
                <button
                    onClick={onDismiss}
                    className="shrink-0 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
                <button
                    onClick={onUpdateProgress}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-extrabold text-sm py-3 rounded-2xl border-b-4 border-primary-dark shadow-md shadow-primary/25 active:border-b-2 active:translate-y-0.5 transition-all"
                >
                    <TrendingUp className="w-4 h-4" />
                    Update Progress
                </button>
                <button
                    onClick={onMarkDone}
                    className="flex items-center gap-2 bg-emerald-500 text-white font-extrabold text-sm px-5 py-3 rounded-2xl border-b-4 border-emerald-700 shadow-md shadow-emerald-500/25 active:border-b-2 active:translate-y-0.5 transition-all"
                >
                    <CheckCircle className="w-4 h-4" />
                    Done!
                </button>
            </div>
        </motion.div>
    );
};
