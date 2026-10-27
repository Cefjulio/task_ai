import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useSettingsStore } from '@/store/settingsStore';
import { useStreakStore } from '@/store/streakStore';
import { playLevelUp, playStepPop, playTaskDing, resumeAudio, triggerConfetti } from '@/utils/soundEffects';

type Level = 'step' | 'task';

const COLORS = ['#1CB0F6', '#FFC800', '#58CC02', '#FF9600', '#CE82FF', '#FF4B4B'];

/** Where on screen the effect should come from: the element you pressed, else low and central. */
const originOf = (el?: Element | null) => {
    const rect = el?.getBoundingClientRect?.();
    const px = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const py = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.75;
    return { px, py, x: px / window.innerWidth, y: py / window.innerHeight };
};

/** A "+1" (or "+1 · 🔥4") that drifts up from the tick and fades. */
function floatText(px: number, py: number, text: string, big: boolean) {
    const el = document.createElement('div');
    el.textContent = text;
    Object.assign(el.style, {
        position: 'fixed',
        left: `${px}px`,
        top: `${py}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: '9999',
        fontWeight: '900',
        fontSize: big ? '18px' : '14px',
        color: '#f59e0b',
        whiteSpace: 'nowrap',
        textShadow: '0 1px 0 #fff, 0 0 8px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.25)',
    });
    document.body.appendChild(el);

    const remove = () => el.remove();
    try {
        const animation = el.animate(
            [
                { opacity: 0, transform: 'translate(-50%, -30%) scale(0.6)' },
                { opacity: 1, transform: 'translate(-50%, -120%) scale(1.15)', offset: 0.25 },
                { opacity: 0, transform: 'translate(-50%, -280%) scale(1)' },
            ],
            { duration: 950, easing: 'ease-out' }
        );
        animation.onfinish = remove;
    } catch {
        // no Web Animations support — the safety timeout below cleans up
    }
    window.setTimeout(remove, 1600);
}

/**
 * The little hit of satisfaction for ticking something off: a burst of confetti from the tick itself,
 * a floating "+1", and a sound that climbs in pitch the longer your streak runs.
 */
export function celebrate(level: Level, origin?: Element | null) {
    const combo = useStreakStore.getState().bump();
    const { px, py, x, y } = originOf(origin);
    const isTask = level === 'task';

    confetti({
        particleCount: isTask ? 30 + Math.min(combo, 8) * 5 : 12 + Math.min(combo, 6) * 2,
        spread: isTask ? 80 : 60,
        startVelocity: isTask ? 26 : 18,
        gravity: 1.1,
        ticks: isTask ? 90 : 60,
        scalar: isTask ? 0.9 : 0.7,
        origin: { x, y },
        colors: COLORS,
    });

    if (useSettingsStore.getState().soundEnabled) {
        resumeAudio();
        (isTask ? playTaskDing : playStepPop)(combo);
    }

    floatText(px, py, combo >= 2 ? `+1 · 🔥${combo}` : '+1', isTask);
    return combo;
}

/** The big one — a whole Focus lane or the whole Daily Core finished. */
export function celebrateMilestone(message: string) {
    triggerConfetti();
    if (useSettingsStore.getState().soundEnabled) {
        resumeAudio();
        playLevelUp();
    }
    toast.success(message, { duration: 4000 });
}
