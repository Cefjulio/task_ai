import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

export const MotivationalBanner: React.FC = () => {
    const { goals } = useTaskStore();
    const [currentIndex, setCurrentIndex] = useState(0);

    const activeGoals = goals.filter(g => g.status === 'active');
    const displayItems = activeGoals.length > 0
        ? activeGoals.map(g => `${g.emoji} ${g.title}`)
        : [
            "Set your first goal to stay focused! 🎯",
            "What do you want to achieve today?",
            "Turn your dreams into plans.",
          ];

    useEffect(() => {
        if (displayItems.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayItems.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [displayItems.length]);

    return (
        <div className="w-full bg-primary py-3 px-4 md:px-10 xl:px-20 2xl:px-28 flex items-center justify-center gap-3 min-h-[52px] overflow-hidden relative">
            {/* Subtle shimmer */}
            <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            />

            <Flame className="w-4 h-4 text-orange-200 shrink-0" />

            <div className="relative h-6 flex-1 flex items-center justify-center overflow-hidden max-w-2xl">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="text-white font-extrabold text-sm text-center truncate"
                    >
                        {displayItems[currentIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* Dot indicators */}
            {displayItems.length > 1 && (
                <div className="flex gap-1 shrink-0">
                    {displayItems.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`rounded-full transition-all ${i === currentIndex ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
