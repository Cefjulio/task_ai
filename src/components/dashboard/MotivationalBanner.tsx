import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target } from 'lucide-react';

export const MotivationalBanner: React.FC = () => {
    const { goals } = useTaskStore();
    const [currentIndex, setCurrentIndex] = useState(0);

    const activeGoals = goals.filter(g => g.status === 'active');
    const displayItems = activeGoals.length > 0 
        ? activeGoals.map(g => g.title)
        : ["Set your first goal to stay focused! 🎯", "What do you want to achieve today?", "Turn your dreams into plans."];

    useEffect(() => {
        if (displayItems.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayItems.length);
        }, 6000); // Change every 6 seconds

        return () => clearInterval(interval);
    }, [displayItems.length]);

    return (
        <div className="w-full relative overflow-hidden group">
            {/* Animated Glow Effect */}
            <motion.div 
                animate={{ 
                    opacity: [0.1, 0.3, 0.1],
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-r from-primary/20 via-teal-500/20 to-primary/20 blur-xl"
            />
            
            <div className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-primary/20 py-6 px-6 md:px-12 xl:px-24 2xl:px-32 relative z-10 flex items-center justify-center min-h-[90px] transition-all duration-500">
                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none opacity-10" />

                <div className="flex items-center gap-6 relative z-10 max-w-5xl w-full justify-center">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    >
                        <Target className="w-6 h-6 text-primary shrink-0 opacity-80" />
                    </motion.div>

                    <div className="relative h-10 flex-1 flex items-center justify-center overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ y: 30, opacity: 0, filter: 'blur(10px)' }}
                                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                exit={{ y: -30, opacity: 0, filter: 'blur(10px)' }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="text-center"
                            >
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60 mb-1 block">Current Focus</span>
                                <h2 className="text-lg md:text-xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                    {displayItems[currentIndex]}
                                </h2>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Sparkles className="w-6 h-6 text-teal-500 shrink-0 opacity-80" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
