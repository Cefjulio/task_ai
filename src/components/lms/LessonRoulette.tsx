import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course, Lesson } from '@/types/Lms';
import { QuillContent } from '@/components/ui/QuillContent';
import { cn } from '@/components/ui/Button';
import { Dices, ExternalLink, RotateCcw, GraduationCap } from 'lucide-react';
import { playDiceRoll, playReveal, resumeAudio, triggerConfetti } from '@/utils/soundEffects';

type Phase = 'idle' | 'rolling' | 'revealed';

interface LessonRouletteProps {
    courses: Course[];
    lessons: Lesson[];
    onGoToLesson: (course: Course, lesson: Lesson) => void;
}

export const LessonRoulette: React.FC<LessonRouletteProps> = ({ courses, lessons, onGoToLesson }) => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [revealed, setRevealed] = useState<Lesson | null>(null);

    const courseById = new Map(courses.map(c => [c.id, c]));
    const pool = lessons.filter(l => l.status !== 'completed' && courseById.has(l.courseId));
    const revealedCourse = revealed ? courseById.get(revealed.courseId) : null;

    const roll = useCallback(() => {
        if (!pool.length || phase === 'rolling') return;
        resumeAudio();
        playDiceRoll();
        setPhase('rolling');
        setRevealed(null);

        setTimeout(() => {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            setRevealed(pick);
            setPhase('revealed');
            playReveal();
            triggerConfetti();
        }, 1100);
    }, [pool, phase]);

    const reroll = useCallback(() => {
        setPhase('idle');
        setRevealed(null);
        setTimeout(roll, 80);
    }, [roll]);

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600 dark:from-violet-700 dark:via-fuchsia-700 dark:to-purple-900 p-5 shadow-lg shadow-violet-500/25">
            <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            <div className="relative z-10 flex items-center gap-3 mb-4">
                <motion.div
                    animate={phase === 'rolling' ? { rotate: [0, 180, 360, 540, 720], scale: [1, 1.25, 0.9, 1.1, 1] } : {}}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0"
                >
                    <Dices className="w-5 h-5 text-white" />
                </motion.div>
                <div className="min-w-0">
                    <p className="text-white text-sm font-black leading-tight">Lesson Roulette</p>
                    <p className="text-white/70 text-[11px] font-bold">
                        {pool.length} lesson{pool.length !== 1 ? 's' : ''} ready to roll
                    </p>
                </div>
            </div>

            <div className="relative z-10">
                <AnimatePresence mode="wait">
                    {phase !== 'revealed' && (
                        <motion.button
                            key="roll-btn"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={roll}
                            disabled={phase === 'rolling' || !pool.length}
                            className={cn(
                                'w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black shadow-lg border-b-4 transition-all duration-100',
                                'bg-yellow-400 border-yellow-600 text-yellow-900 shadow-yellow-600/30',
                                'active:border-b-2 active:translate-y-0.5',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            {phase === 'rolling' ? 'Rolling…' : '🎲 Spin for a Lesson'}
                        </motion.button>
                    )}

                    {phase === 'revealed' && revealed && revealedCourse && (
                        <motion.div
                            key="revealed"
                            initial={{ scale: 0.7, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                        >
                            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/30 text-left mb-3">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="text-base leading-none">{revealedCourse.emoji || '📚'}</span>
                                    <span className="text-white/70 text-[11px] font-extrabold uppercase tracking-wider truncate">
                                        {revealedCourse.title}
                                    </span>
                                </div>
                                <QuillContent
                                    html={revealed.title}
                                    className="!p-0 text-base font-black text-white leading-snug [&_p]:m-0"
                                />
                            </div>

                            <div className="flex gap-2 justify-center">
                                {revealed.resourceUrl ? (
                                    <a
                                        href={revealed.resourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => onGoToLesson(revealedCourse, revealed)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white text-violet-600 font-black px-4 py-2.5 rounded-xl border-b-4 border-violet-100 shadow active:border-b-2 active:translate-y-0.5 transition-all text-xs"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Do It Now
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => onGoToLesson(revealedCourse, revealed)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white text-violet-600 font-black px-4 py-2.5 rounded-xl border-b-4 border-violet-100 shadow active:border-b-2 active:translate-y-0.5 transition-all text-xs"
                                    >
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        Do It Now
                                    </button>
                                )}
                                <button
                                    onClick={reroll}
                                    className="flex items-center justify-center gap-1.5 bg-white/20 text-white font-black px-3.5 py-2.5 rounded-xl border-b-4 border-white/25 shadow active:border-b-2 active:translate-y-0.5 transition-all text-xs"
                                    title="Re-roll"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!pool.length && phase === 'idle' && (
                    <p className="text-white/65 text-xs text-center">
                        Add a lesson to start rolling.
                    </p>
                )}
            </div>
        </div>
    );
};
