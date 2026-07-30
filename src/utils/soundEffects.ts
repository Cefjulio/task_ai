import confetti from 'canvas-confetti';

// ─── Confetti ────────────────────────────────────────────────────────────────

export function triggerConfetti() {
    confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.45 },
        colors: ['#1CB0F6', '#FF9600', '#FF4B4B', '#FFC800', '#CE82FF', '#00CD9C', '#58CC02'],
    });
    // Second burst slightly delayed for a richer effect
    setTimeout(() => {
        confetti({
            particleCount: 60,
            spread: 55,
            origin: { x: 0.25, y: 0.5 },
            colors: ['#1CB0F6', '#FFC800', '#CE82FF'],
        });
        confetti({
            particleCount: 60,
            spread: 55,
            origin: { x: 0.75, y: 0.5 },
            colors: ['#FF9600', '#00CD9C', '#FF4B4B'],
        });
    }, 200);
}

// ─── Web Audio engine ────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
        if (!audioCtx || audioCtx.state === 'closed') {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioCtx;
    } catch {
        return null;
    }
}

function tone(
    freq: number,
    dur: number,
    type: OscillatorType = 'sine',
    vol = 0.22,
    delay = 0
) {
    const ctx = getCtx();
    if (!ctx) return;
    try {
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + dur + 0.02);
    } catch {
        // silently ignore audio errors
    }
}

export function resumeAudio() {
    try { getCtx()?.resume(); } catch { /* ignore */ }
}

// Roulette wheel slowing down — ticks that gradually space out
export function playDiceRoll() {
    const times = [0, 0.055, 0.1, 0.14, 0.175, 0.205, 0.23, 0.25, 0.265, 0.278, 0.288, 0.296];
    times.forEach(t => tone(220 + Math.random() * 350, 0.04, 'square', 0.07, t));
}

// Ascending Duolingo-style major arpeggio + sparkle
export function playReveal() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, 'sine', 0.2, i * 0.11));
    tone(2093, 0.12, 'sine', 0.1, 0.5);
}

// Full C major run up then triumphant chord
export function playLevelUp() {
    [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) =>
        tone(f, 0.1, 'sine', 0.14, i * 0.065)
    );
    const end = 8 * 0.065;
    [1047, 1319, 1568].forEach((f, j) => tone(f, 0.55, 'sine', 0.18 - j * 0.04, end));
}

export function playSoftClick() {
    tone(900, 0.05, 'sine', 0.07);
}

// Legacy exports kept for any existing callers
export const SOUNDS = {};
export const playApplause = () => playLevelUp();
export const playBoo = () => playDiceRoll();
