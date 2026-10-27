import { useEffect, useRef, useState } from 'react';

/** True for a moment right after `isDone` flips to true — never on first render, so already-done rows don't re-animate. */
export function useJustCompleted(isDone: boolean, ms = 700) {
    const previous = useRef(isDone);
    const [just, setJust] = useState(false);

    useEffect(() => {
        if (!previous.current && isDone) {
            previous.current = true;
            setJust(true);
            const timer = window.setTimeout(() => setJust(false), ms);
            return () => window.clearTimeout(timer);
        }
        previous.current = isDone;
        return undefined;
    }, [isDone, ms]);

    return just;
}
