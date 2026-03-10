import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#20E090', '#1cbd79', '#ffffff', '#b6ffdf']
    });
};

// The use-sound hook must be used inside the React component tree.
// We'll provide MP3 URLs or manage them via the components.
export const SOUNDS = {
    applause: 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3', // Example applause
    boo: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d08ce1f016.mp3',      // Example boo
};

export const playApplause = () => {
    const audio = new Audio(SOUNDS.applause);
    audio.volume = 0.5;
    audio.play().catch(e => console.error('Error playing applause:', e));
};

export const playBoo = () => {
    const audio = new Audio(SOUNDS.boo);
    audio.volume = 0.3;
    audio.play().catch(e => console.error('Error playing boo:', e));
};
