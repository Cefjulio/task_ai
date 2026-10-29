import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { ReminderDisplay, buildReminderDisplays } from '@/utils/reminderDisplay';
import { shadeHex } from '@/utils/colorUtils';
import { ReminderViewModal } from '@/components/daily/DailyReminderModal';

const SLIDE_MS = 9000;

interface Slide {
    key: string;
    label: string;
    emoji: string;
    title: string;
    snippet: string;
    color: string;
    /** Present for real goals/plans — lets you open them in full. */
    display?: ReminderDisplay;
}

const MOTTOS: Slide[] = [
    { key: 'm1', label: 'Daily motto', emoji: '🎯', title: 'Set your first goal to stay focused!', snippet: 'Add goals and plans in the Goals & Plans tab and they will show up here every day.', color: '#1a7de0' },
    { key: 'm2', label: 'Daily motto', emoji: '🚀', title: 'What do you want to achieve today?', snippet: 'Small steps, every day.', color: '#0ea5e9' },
    { key: 'm3', label: 'Daily motto', emoji: '💡', title: 'Turn your dreams into actionable plans.', snippet: 'Write the plan down and make it real.', color: '#6366f1' },
];

const slideFrom = (d: ReminderDisplay): Slide => ({
    key: d.key,
    label: d.kind === 'goal' ? 'Goal' : 'Plan',
    emoji: d.emoji,
    title: d.title,
    snippet: d.snippet,
    color: d.color,
    display: d,
});

export const MotivationalBanner: React.FC = () => {
    const goals = useTaskStore(s => s.goals);
    const plans = useTaskStore(s => s.plans);

    const slides = useMemo<Slide[]>(() => {
        const items = buildReminderDisplays(goals, plans);
        return items.length > 0 ? items.map(slideFrom) : MOTTOS;
    }, [goals, plans]);

    const [index, setIndex] = useState(0);
    const [manuallyPaused, setManuallyPaused] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [viewing, setViewing] = useState<ReminderDisplay | null>(null);

    const paused = manuallyPaused || hovering || viewing !== null;
    const safeIndex = Math.min(index, slides.length - 1);
    const slide = slides[safeIndex];

    // Keep the index valid if the list shrinks
    useEffect(() => {
        if (index > slides.length - 1) setIndex(0);
    }, [index, slides.length]);

    // Auto-advance; the timer restarts whenever the slide changes or it is un-paused
    useEffect(() => {
        if (slides.length <= 1 || paused) return undefined;
        const timer = window.setTimeout(() => setIndex(i => (i + 1) % slides.length), SLIDE_MS);
        return () => window.clearTimeout(timer);
    }, [safeIndex, paused, slides.length]);

    const go = (delta: number) => setIndex(i => (Math.min(i, slides.length - 1) + delta + slides.length) % slides.length);

    const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if ((event as PointerEvent).pointerType === 'mouse') return;
        if (Math.abs(info.offset.x) < 50 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
        go(info.offset.x < 0 ? 1 : -1);
    };

    const multiple = slides.length > 1;
    const background = `linear-gradient(120deg, ${shadeHex(slide.color, -58)} 0%, ${shadeHex(slide.color, -32)} 50%, ${shadeHex(slide.color, -8)} 100%)`;

    return (
        <>
            <section
                aria-label="Goals and plans"
                aria-roledescription="carousel"
                className="relative min-h-[156px] w-full overflow-hidden text-white sm:min-h-[128px]"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
            >
                <AnimatePresence initial={false}>
                    <motion.div
                        key={slide.key}
                        className="absolute inset-0 flex items-center gap-3 px-3 pb-11 pt-3 sm:gap-5 sm:pb-4 md:px-10 xl:px-20"
                        style={{ background, touchAction: 'pan-y' }}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        onPanEnd={handlePanEnd}
                        aria-live="polite"
                    >
                        {/* Soft light and texture so the colour feels rich, not flat */}
                        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 12% 20%, rgba(255,255,255,0.35), transparent 45%)' }} />
                        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                        <div className="animate-float relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-lg ring-2 ring-white/25 backdrop-blur-sm sm:h-16 sm:w-16 sm:text-4xl">
                            {slide.emoji}
                        </div>

                        <button
                            type="button"
                            disabled={!slide.display}
                            onClick={() => slide.display && setViewing(slide.display)}
                            className="relative flex min-w-0 flex-1 flex-col items-start text-left disabled:cursor-default"
                            aria-label={slide.display ? `Read in full: ${slide.title}` : undefined}
                        >
                            <span className="flex items-center gap-2">
                                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em]">
                                    {slide.label}
                                </span>
                                {multiple && (
                                    <span className="text-[11px] font-bold text-white/70">
                                        {safeIndex + 1} / {slides.length}
                                    </span>
                                )}
                            </span>
                            <span
                                className="mt-1 line-clamp-2 text-xl font-black leading-tight tracking-tight drop-shadow-sm sm:text-2xl md:text-[1.7rem]"
                                style={{ fontFamily: 'Nunito, sans-serif' }}
                            >
                                {slide.title}
                            </span>
                            {slide.snippet && (
                                <span className="mt-0.5 line-clamp-1 text-sm leading-snug text-white/85 sm:line-clamp-2 sm:text-[15px]">
                                    {slide.snippet}
                                </span>
                            )}
                            {slide.display && (
                                <span className="mt-1 hidden text-[11px] font-extrabold uppercase tracking-wider text-white/60 sm:block">
                                    Tap to read in full ›
                                </span>
                            )}
                        </button>
                    </motion.div>
                </AnimatePresence>

                {/* Controls */}
                {multiple && (
                    <div className="absolute bottom-1.5 right-2 z-10 flex items-center gap-1 sm:bottom-auto sm:right-4 sm:top-2 md:right-10 xl:right-20">
                        <button
                            onClick={() => setManuallyPaused(p => !p)}
                            className="rounded-full bg-black/20 p-2 text-white/90 transition-colors hover:bg-black/35"
                            aria-label={manuallyPaused ? 'Resume slideshow' : 'Pause slideshow'}
                            title={manuallyPaused ? 'Resume' : 'Pause'}
                        >
                            {manuallyPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </button>
                        <button onClick={() => go(-1)} className="rounded-full bg-black/20 p-2 text-white/90 transition-colors hover:bg-black/35" aria-label="Previous">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={() => go(1)} className="rounded-full bg-black/20 p-2 text-white/90 transition-colors hover:bg-black/35" aria-label="Next">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Timer bar + dots */}
                {multiple && (
                    <>
                        {slides.length <= 12 && (
                            <div className="absolute bottom-4 left-3 z-10 flex gap-1.5 sm:bottom-2 sm:left-1/2 sm:-translate-x-1/2">
                                {slides.map((s, i) => (
                                    <button
                                        key={s.key}
                                        onClick={() => setIndex(i)}
                                        aria-label={`Go to ${i + 1}`}
                                        className={`h-1.5 rounded-full transition-all ${i === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/20">
                            <div
                                key={`${slide.key}:${paused}`}
                                className="h-full origin-left bg-white/80"
                                style={paused ? { transform: 'scaleX(0)' } : { animation: `banner-fill ${SLIDE_MS}ms linear forwards` }}
                            />
                        </div>
                    </>
                )}
            </section>

            <AnimatePresence>
                {viewing && <ReminderViewModal key="view" item={viewing} onClose={() => setViewing(null)} />}
            </AnimatePresence>
        </>
    );
};
