import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const MotivationalBanner: React.FC = () => {
    const { bannerPhrases } = useSettingsStore();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (bannerPhrases.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % bannerPhrases.length);
        }, 8000); // Change phrase every 8 seconds

        return () => clearInterval(interval);
    }, [bannerPhrases]);

    if (bannerPhrases.length === 0) return null;

    return (
        <div className="w-full bg-gradient-to-r from-primary/10 via-teal-500/10 to-primary/10 border-b border-primary/20 py-3 px-6 md:px-12 xl:px-24 2xl:px-32 relative overflow-hidden flex items-center justify-center min-h-[56px]">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none opacity-20" />

            <div className="flex items-center gap-3 relative z-10 max-w-4xl w-full justify-center">
                <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />

                <div className="relative h-6 flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 text-center italic"
                        >
                            "{bannerPhrases[currentIndex]}"
                        </motion.p>
                    </AnimatePresence>
                </div>

                <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />
            </div>
        </div>
    );
};
