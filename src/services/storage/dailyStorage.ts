import { supabase } from '../supabase/supabaseClient';
import { IStorageService } from './storageInterface';

const SETTINGS_SINGLETON_ID = '00000000-0000-0000-0000-000000000001';
const LOCAL_KEY = 'todo-ai-daily-state';

let warnedAboutMissingColumn = false;
const warnMissingColumn = () => {
    if (warnedAboutMissingColumn) return;
    warnedAboutMissingColumn = true;
    console.warn('settings.daily_state is missing — run supabase_daily_state.sql to sync daily reminders across devices. Using this browser only for now.');
};

const readLocal = (): any | null => {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const writeLocal = (state: any) => {
    try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    } catch {
        // storage full / blocked — the Supabase copy still works
    }
};

/**
 * Daily reminder / study state: one JSON value on the settings row, mirrored in localStorage so it keeps
 * working offline (or before the column exists). Whichever copy was saved most recently wins.
 */
export const dailyStorage: IStorageService = {
    getItem: async () => {
        let remote: any | null = null;
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('daily_state')
                .eq('id', SETTINGS_SINGLETON_ID)
                .maybeSingle();

            if (error) {
                if (/daily_state/.test(error.message ?? '')) warnMissingColumn();
                else console.error('Error fetching daily state from Supabase:', error);
            } else {
                remote = (data as any)?.daily_state ?? null;
            }
        } catch (err) {
            console.error('Error fetching daily state from Supabase:', err);
        }

        const local = readLocal();
        const chosen = remote && local
            ? ((remote.savedAt ?? 0) >= (local.savedAt ?? 0) ? remote : local)
            : remote ?? local;

        return chosen ? { state: chosen, version: 0 } : null;
    },

    setItem: async (_name: string, value: any) => {
        const state = value?.state;
        if (!state) return;

        const stamped = { ...state, savedAt: Date.now() };
        writeLocal(stamped);

        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ id: SETTINGS_SINGLETON_ID, daily_state: stamped }, { onConflict: 'id' });
            if (error) {
                if (/daily_state/.test(error.message ?? '')) warnMissingColumn();
                else console.error('Error saving daily state to Supabase:', error);
            }
        } catch (err) {
            console.error('Error saving daily state to Supabase:', err);
        }
    },

    removeItem: async () => {
        try {
            localStorage.removeItem(LOCAL_KEY);
        } catch {
            // ignore
        }
    },
};
