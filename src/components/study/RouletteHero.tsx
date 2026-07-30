import React, { useState, useCallback } from 'react';
import { StudyItem } from '@/types/StudyItem';
import { Dices, Sparkles, BookOpen, ArrowRight, RotateCcw, Video, FileText, Globe, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/components/ui/Button';
import { playDiceRoll, playReveal, resumeAudio, triggerConfetti } from '@/utils/soundEffects';

const CONTENT_ICONS: Record<string, React.ReactNode> = {
    youtube: <Video className="w-5 h-5 text-red-400" />,
    pdf:     <FileText className="w-5 h-5 text-orange-400" />,
    audio:   <Headphones className="w-5 h-5 text-purple-400" />,
    webpage: <Globe className="w-5 h-5 text-sky-300" />,
};

type Phase = 'idle' | 'rolling' | 'revealed';

interface RouletteHeroProps {
    items: StudyItem[];
    onStudyNow: (item: StudyItem) => void;
}

export const RouletteHero: React.FC<RouletteHeroProps> = ({ items, onStudyNow }) => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [revealed, setRevealed] = useState<StudyItem | null>(null);

    const pendingItems = items.filter(i => i.status !== 'reviewed' && i.status !== 'completed');
    const reviewedCount = items.length - pendingItems.length;

    const roll = useCallback(() => {
        if (!pendingItems.length || phase === 'rolling') return;
        resumeAudio();
        playDiceRoll();
        setPhase('rolling');
        setRevealed(null);

        setTimeout(() => {
            const pick = pendingItems[Math.floor(Math.random() * pendingItems.length)];
            setRevealed(pick);
            setPhase('revealed');
            playReveal();
            triggerConfetti();
        }, 1400);
    }, [pendingItems, phase]);

    const reroll = useCallback(() => {
        setPhase('idle');
        setRevealed(null);
        setTimeout(roll, 80);
    }, [roll]);

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a7de0] via-primary to-cyan-400 dark:from-[#1256a8] dark:via-primary dark:to-cyan-600 p-6 sm:p-8 shadow-xl shadow-primary/25 mb-2">
            {/* Dot grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '22px 22px' }}
            />

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Label */}
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                    <span className="text-white/80 text-[11px] font-extrabold uppercase tracking-[0.2em]">Study Roulette</span>
                    <Sparkles className="w-4 h-4 text-yellow-200" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 drop-shadow">
                    What will you study today?
                </h2>
                <div className="flex items-center gap-3 mb-7">
                    <span className="text-white/80 text-sm font-bold">
                        {pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''} in play
                    </span>
                    {reviewedCount > 0 && (
                        <>
                            <span className="text-white/30">·</span>
                            <span className="text-white/50 text-xs">
                                {reviewedCount} reviewed (excluded)
                            </span>
                        </>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {phase !== 'revealed' && (
                        <motion.button
                            key="roll-btn"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={roll}
                            disabled={phase === 'rolling' || !pendingItems.length}
                            className={cn(
                                'flex items-center gap-3 px-8 py-4 rounded-2xl text-xl font-black shadow-xl border-b-4 transition-all duration-100',
                                'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-yellow-600/40',
                                'active:border-b-2 active:translate-y-0.5',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            <motion.div
                                animate={
                                    phase === 'rolling'
                                        ? { rotate: [0, 180, 360, 540, 720], scale: [1, 1.3, 0.9, 1.15, 1] }
                                        : {}
                                }
                                transition={{ duration: 1.3, ease: 'easeOut' }}
                            >
                                <Dices className="w-7 h-7" />
                            </motion.div>
                            {phase === 'rolling' ? 'Rolling…' : '🎲 Surprise Me!'}
                        </motion.button>
                    )}

                    {phase === 'revealed' && revealed && (
                        <motion.div
                            key="revealed"
                            initial={{ scale: 0.65, opacity: 0, y: 24 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                            className="w-full max-w-md"
                        >
                            {/* Revealed item card */}
                            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/30 text-left mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {CONTENT_ICONS[revealed.contentType]}
                                    <span className="text-white/70 text-[11px] font-extrabold uppercase tracking-wider">
                                        {revealed.contentType}
                                    </span>
                                    {revealed.completionPercentage > 0 && (
                                        <span className="ml-auto bg-white/25 text-white text-xs font-black px-2 py-0.5 rounded-lg">
                                            {revealed.completionPercentage}% done
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-black text-white mb-1.5 leading-snug">{revealed.title}</h3>

                                {revealed.lastPageRead ? (
                                    <p className="text-white/70 text-sm">
                                        Last left off at:{' '}
                                        <span className="font-bold text-white">{revealed.lastPageRead}</span>
                                    </p>
                                ) : (
                                    <p className="text-white/50 text-sm italic">No progress recorded yet — start fresh!</p>
                                )}

                                {/* Mini progress bar */}
                                {revealed.completionPercentage > 0 && (
                                    <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${revealed.completionPercentage}%` }}
                                            transition={{ duration: 0.8, delay: 0.3 }}
                                            className="h-full bg-white rounded-full"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => onStudyNow(revealed)}
                                    className="flex items-center gap-2 bg-white text-primary font-black px-6 py-3 rounded-2xl border-b-4 border-sky-200 shadow-lg active:border-b-2 active:translate-y-0.5 transition-all text-sm"
                                >
                                    Study This Now <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={reroll}
                                    className="flex items-center gap-2 bg-white/20 text-white font-black px-5 py-3 rounded-2xl border-b-4 border-white/25 shadow active:border-b-2 active:translate-y-0.5 transition-all text-sm"
                                >
                                    <RotateCcw className="w-4 h-4" /> Re-roll
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!pendingItems.length && phase === 'idle' && (
                    <div className="flex items-center gap-2 text-white/65 text-sm mt-2">
                        <BookOpen className="w-4 h-4" />
                        All items reviewed! Add more below to keep rolling.
                    </div>
                )}
            </div>
        </div>
    );
};
