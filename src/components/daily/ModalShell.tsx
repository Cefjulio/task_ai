import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/Button';

interface ModalShellProps {
    label: string;
    children: React.ReactNode;
    /** Tailwind max-width for wide screens. */
    widthClass?: string;
    onBackdropClick?: () => void;
}

/** Full-screen blurred overlay with a card that is a bottom sheet on phones and centered on larger screens. */
export const ModalShell: React.FC<ModalShellProps> = ({ label, children, widthClass = 'sm:max-w-lg', onBackdropClick }) => {
    // Keep the page behind from scrolling while the modal is open
    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previous; };
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onBackdropClick} />
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className={cn(
                    'relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl dark:bg-slate-900 sm:rounded-[28px]',
                    widthClass
                )}
                initial={{ y: 70, scale: 0.94, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 40, scale: 0.97, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

const SPARKLES = [
    { top: '12%', left: '8%', size: 14, delay: '0s' },
    { top: '22%', left: '78%', size: 18, delay: '0.6s' },
    { top: '60%', left: '90%', size: 12, delay: '1.2s' },
    { top: '70%', left: '14%', size: 16, delay: '1.8s' },
    { top: '8%', left: '52%', size: 11, delay: '0.9s' },
    { top: '78%', left: '60%', size: 13, delay: '0.3s' },
];

/** A few twinkling ✦ for gradient headers. */
export const Sparkles: React.FC = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {SPARKLES.map((s, i) => (
            <span
                key={i}
                className="animate-twinkle absolute text-white"
                style={{ top: s.top, left: s.left, fontSize: s.size, animationDelay: s.delay }}
            >
                ✦
            </span>
        ))}
    </div>
);
