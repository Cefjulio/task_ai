import React, { useState, useEffect } from 'react';
import { StudyItem } from '@/types/StudyItem';
import { useStudyStore } from '@/store/studyStore';
import { X, TrendingUp, BookMarked } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playLevelUp, resumeAudio, triggerConfetti } from '@/utils/soundEffects';

interface ProgressLogModalProps {
    item: StudyItem | null;
    onClose: () => void;
    onSaved?: () => void;
}

export const ProgressLogModal: React.FC<ProgressLogModalProps> = ({ item, onClose, onSaved }) => {
    const { updateStudyItem } = useStudyStore();
    const [lastPageRead, setLastPageRead] = useState('');
    const [percentage, setPercentage] = useState(0);
    const [showXP, setShowXP] = useState(false);

    useEffect(() => {
        if (item) {
            setLastPageRead(item.lastPageRead || '');
            setPercentage(item.completionPercentage || 0);
        }
    }, [item]);

    const handleSave = () => {
        if (!item) return;
        resumeAudio();
        updateStudyItem(item.id, { lastPageRead, completionPercentage: percentage });
        playLevelUp();
        setShowXP(true);
        if (percentage >= 100) triggerConfetti();
        setTimeout(() => {
            setShowXP(false);
            onSaved?.();
            onClose();
        }, 1900);
    };

    if (!item) return null;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center bg-slate-900/50 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1a7de0] to-cyan-400 p-5 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <BookMarked className="w-4 h-4 text-white/80" />
                        <span className="text-white/80 text-[10px] font-extrabold uppercase tracking-widest">Update Progress</span>
                    </div>
                    <h3 className="text-lg font-black text-white truncate pr-8">{item.title}</h3>
                </div>

                <div className="p-5 space-y-5">
                    {/* Where did you leave off */}
                    <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                            Where did you leave off?
                        </label>
                        <input
                            type="text"
                            value={lastPageRead}
                            onChange={e => setLastPageRead(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                            placeholder="e.g. Page 47 · Chapter 3 · Video 12 · 1:23:00"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:text-white placeholder:text-slate-400"
                        />
                    </div>

                    {/* Completion slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                Completion
                            </label>
                            <span className="text-2xl font-black text-primary tabular-nums">{percentage}%</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={percentage}
                            onChange={e => setPercentage(Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                        />
                        <div className="mt-2 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all duration-200"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        {percentage >= 100 && (
                            <p className="text-center text-emerald-500 font-extrabold text-sm mt-2">
                                🎉 Completed! Amazing work!
                            </p>
                        )}
                    </div>

                    {/* Save button */}
                    <div className="relative overflow-visible">
                        <button
                            onClick={handleSave}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black py-4 rounded-2xl border-b-4 border-primary-dark shadow-lg shadow-primary/30 active:border-b-2 active:translate-y-0.5 transition-all"
                        >
                            <TrendingUp className="w-5 h-5" />
                            Save Progress
                        </button>

                        {/* Floating XP animation */}
                        <AnimatePresence>
                            {showXP && (
                                <motion.div
                                    initial={{ y: 0, opacity: 1, scale: 0.6 }}
                                    animate={{ y: -90, opacity: 0, scale: 1.4 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.6, ease: 'easeOut' }}
                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                    <span className="text-3xl font-black text-yellow-400 drop-shadow-lg select-none">
                                        +XP ⭐
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
