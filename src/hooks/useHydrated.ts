import { useEffect, useState } from 'react';

interface PersistedStore {
    persist: {
        hasHydrated: () => boolean;
        onFinishHydration: (listener: (state: any) => void) => () => void;
    };
}

/** True once a persisted store has finished loading from storage (Supabase loads asynchronously). */
export function useHydrated(store: PersistedStore): boolean {
    const [hydrated, setHydrated] = useState(() => store.persist.hasHydrated());

    useEffect(() => {
        const unsubscribe = store.persist.onFinishHydration(() => setHydrated(true));
        setHydrated(store.persist.hasHydrated());
        return unsubscribe;
    }, [store]);

    return hydrated;
}
