import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';

export const MotivationalBanner: React.FC = () => {
    const { goals } = useTaskStore();
    const [currentIndex, setCurrentIndex] = useState(0);

    const activeGoals = goals.filter(g => g.status === 'active');
    const displayItems = activeGoals.length > 0
        ? activeGoals.map(g => ({ label: 'Current Focus', text: `${g.emoji}  ${g.title}` }))
        : [
            { label: 'Daily Motto', text: '🎯  Set your first goal to stay focused!' },
            { label: 'Daily Motto', text: '🚀  What do you want to achieve today?' },
            { label: 'Daily Motto', text: '💡  Turn your dreams into actionable plans.' },
          ];

    useEffect(() => {
        if (displayItems.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % displayItems.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [displayItems.length]);

    const prev = () => setCurrentIndex(i => (i - 1 + displayItems.length) % displayItems.length);
    const next = () => setCurrentIndex(i => (i + 1) % displayItems.length);

    return (
        <div
            className="w-full relative overflow-hidden flex items-center justify-center px-4 md:px-10 xl:px-20"
            style={{
                minHeight: '90px',
                background: 'linear-gradient(135deg, #1a7de0 0%, #1CB0F6 60%, #0dd4f0 100%)',
            }}
        >
            {/* Animated shimmer */}
            <motion.div
                animate={{ x: ['-120%', '220%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
            />

            {/* Prev button */}
            {displayItems.length > 1 && (
                <button onClick={prev} className="shrink-0 text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 z-10">
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[72px] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ y: 24, opacity: 0, filter: 'blur(6px)' }}
                        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                        exit={{ y: -24, opacity: 0, filter: 'blur(6px)' }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center gap-1 text-center px-2"
                    >
                        <span className="flex items-center gap-1.5 text-white/60 text-[10px] font-extrabold uppercase tracking-[0.25em]">
                            <Flame className="w-3 h-3 text-orange-300" />
                            {displayItems[currentIndex].label}
                        </span>
                        <p className="text-white font-black text-lg sm:text-xl md:text-2xl leading-tight tracking-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            {displayItems[currentIndex].text}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Next + dots */}
            {displayItems.length > 1 && (
                <div className="flex flex-col items-center gap-2 shrink-0 z-10">
                    <button onClick={next} className="text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="flex gap-1">
                        {displayItems.map((_, i) => (
                            <button
                                key={i} onClick={() => setCurrentIndex(i)}
                                className={`rounded-full transition-all ${i === currentIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/35'}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
