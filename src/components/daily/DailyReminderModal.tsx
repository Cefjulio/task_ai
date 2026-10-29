import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Check, Calendar, X } from 'lucide-react';
import { QuillContent } from '@/components/ui/QuillContent';
import { ReminderDisplay } from '@/utils/reminderDisplay';
import { shadeHex } from '@/utils/colorUtils';
import { stripHtml } from '@/utils/htmlUtils';
import { dailyFx } from '@/utils/dailyFx';
import { ModalShell, Sparkles } from './ModalShell';

/** How long the acknowledge button takes to unlock — a nudge to actually read it. */
const READ_MS = 2500;

interface HeaderProps {
    item: ReminderDisplay;
    eyebrow: string;
    /** "3 of 11" style progress, shown as dots when the list is short enough. */
    position?: { index: number; total: number };
    onClose?: () => void;
}

const ReminderHeader: React.FC<HeaderProps> = ({ item, eyebrow, position, onClose }) => (
    <div
        className="relative shrink-0 overflow-hidden px-6 pb-6 pt-7 text-white sm:px-8"
        style={{ background: `linear-gradient(135deg, ${shadeHex(item.color, -35)} 0%, ${item.color} 55%, ${shadeHex(item.color, 25)} 100%)` }}
    >
        <Sparkles />
        {onClose && (
            <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/30"
                aria-label="Close"
            >
                <X className="h-4 w-4" />
            </button>
        )}
        <div className="relative flex items-center gap-4">
            <div className="animate-float flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-3xl bg-white/20 text-4xl shadow-lg ring-4 ring-white/20 backdrop-blur-sm">
                {item.emoji}
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-white/80">{eyebrow}</p>
                <span className="mt-1.5 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider">
                    {item.kind === 'goal' ? '🎯 Goal' : '📝 Plan'}
                </span>
            </div>
        </div>
        {position && position.total > 0 && (
            <div className="relative mt-5 flex items-center gap-3">
                {position.total <= 14 ? (
                    <div className="flex gap-1.5" aria-hidden>
                        {Array.from({ length: position.total }, (_, i) => (
                            <span
                                key={i}
                                className={`h-2 rounded-full transition-all ${i + 1 === position.index ? 'w-6 bg-white' : i + 1 < position.index ? 'w-2 bg-white/80' : 'w-2 bg-white/30'}`}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-white/25" aria-hidden>
                        <div className="h-full rounded-full bg-white" style={{ width: `${(position.index / position.total) * 100}%` }} />
                    </div>
                )}
                <span className="text-xs font-bold text-white/85">
                    {position.index} of {position.total} this round
                </span>
            </div>
        )}
    </div>
);

const ReminderBody: React.FC<{ item: ReminderDisplay }> = ({ item }) => {
    const hasContent = stripHtml(item.html).length > 0;
    return (
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <h2 className="font-black leading-tight tracking-tight text-slate-900 dark:text-white text-2xl sm:text-3xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {item.title}
            </h2>
            {item.targetDate && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Target: {format(parseISO(item.targetDate), 'MMM d, yyyy')}
                </p>
            )}
            {hasContent ? (
                <QuillContent
                    html={item.html}
                    className="!p-0 mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300"
                />
            ) : (
                <p className="mt-4 text-base italic text-slate-400">No extra notes — just keep this front of mind today.</p>
            )}
        </div>
    );
};

interface DailyReminderModalProps {
    item: ReminderDisplay;
    /** 1-based position of this reminder within the current round. */
    index: number;
    total: number;
    onAcknowledge: () => void;
}

/** "Read this today" — closes only once you acknowledge it. */
export const DailyReminderModal: React.FC<DailyReminderModalProps> = ({ item, index, total, onAcknowledge }) => {
    const [ready, setReady] = useState(false);
    const [done, setDone] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        dailyFx.reminderAppears();
        const timer = window.setTimeout(() => setReady(true), READ_MS);
        return () => window.clearTimeout(timer);
    }, [item.key]);

    const acknowledge = () => {
        if (!ready || done) return;
        setDone(true);
        dailyFx.acknowledged(buttonRef.current, item.color);
        window.setTimeout(onAcknowledge, 900);
    };

    return (
        <ModalShell label={`Daily reminder: ${item.title}`}>
            <ReminderHeader item={item} eyebrow="Daily reminder" position={{ index, total }} />
            <ReminderBody item={item} />

            <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
                <button
                    ref={buttonRef}
                    onClick={acknowledge}
                    disabled={!ready || done}
                    autoFocus
                    className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border-b-4 px-6 py-4 text-base font-black text-white shadow-lg transition-transform active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: done ? '#10b981' : item.color,
                        borderColor: done ? '#047857' : shadeHex(item.color, -30),
                        opacity: ready || done ? 1 : 0.85,
                    }}
                >
                    {/* Fills while the unlock timer runs */}
                    {!ready && (
                        <motion.span
                            className="absolute inset-0 origin-left bg-white/30"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: READ_MS / 1000, ease: 'linear' }}
                        />
                    )}
                    <span className="relative flex items-center gap-2">
                        {done ? (
                            <motion.span
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                className="flex items-center gap-2"
                            >
                                <Check className="h-5 w-5" strokeWidth={3} /> Acknowledged!
                            </motion.span>
                        ) : ready ? (
                            <>
                                <Check className="h-5 w-5" strokeWidth={3} /> I acknowledge
                            </>
                        ) : (
                            'Take a moment to read this…'
                        )}
                    </span>
                </button>
            </div>
        </ModalShell>
    );
};

/** Read-only version, opened from the banner. */
export const ReminderViewModal: React.FC<{ item: ReminderDisplay; onClose: () => void }> = ({ item, onClose }) => (
    <ModalShell label={item.title} onBackdropClick={onClose}>
        <ReminderHeader item={item} eyebrow={item.kind === 'goal' ? 'Your goal' : 'Your plan'} onClose={onClose} />
        <ReminderBody item={item} />
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
            <button
                onClick={onClose}
                className="w-full rounded-2xl border-b-4 border-slate-300 bg-white px-6 py-3.5 text-base font-black text-slate-700 shadow transition-transform active:translate-y-0.5 active:border-b-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
                Close
            </button>
        </div>
    </ModalShell>
);
