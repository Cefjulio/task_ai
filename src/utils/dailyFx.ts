import confetti from 'canvas-confetti';
import { useSettingsStore } from '@/store/settingsStore';
import {
    playAcknowledge,
    playReminderChime,
    playSnooze,
    playStudyReady,
    resumeAudio,
} from '@/utils/soundEffects';

const soundOn = () => useSettingsStore.getState().soundEnabled;

const burstFrom = (el?: Element | null, colors?: string[]) => {
    const rect = el?.getBoundingClientRect?.();
    const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
    const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.6;
    confetti({
        particleCount: 70,
        spread: 90,
        startVelocity: 30,
        gravity: 1,
        ticks: 110,
        scalar: 0.95,
        origin: { x, y },
        colors: colors ?? ['#1CB0F6', '#FFC800', '#58CC02', '#FF9600', '#CE82FF', '#FF4B4B'],
        zIndex: 200,
    });
};

/** Sound + visual cues for the daily modals, all respecting the app's sound setting. */
export const dailyFx = {
    reminderAppears() {
        if (!soundOn()) return;
        resumeAudio();
        playReminderChime();
    },
    studyAppears() {
        if (!soundOn()) return;
        resumeAudio();
        playStudyReady();
    },
    acknowledged(origin?: Element | null, accent?: string) {
        burstFrom(origin, accent ? [accent, '#FFC800', '#ffffff', '#58CC02'] : undefined);
        if (soundOn()) {
            resumeAudio();
            playAcknowledge();
        }
    },
    snoozed() {
        if (!soundOn()) return;
        resumeAudio();
        playSnooze();
    },
};
