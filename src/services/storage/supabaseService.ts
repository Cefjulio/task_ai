import { supabase } from '../supabase/supabaseClient';
import { IStorageService } from './storageInterface';

/**
 * Supabase Storage Implementation
 * Maps Zustand persist keys to specific Supabase tables.
 */
const SETTINGS_SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

export const supabaseService: IStorageService = {
    getItem: async (name: string) => {
        try {
            if (name === 'todo-ai-storage') {
                const { data: tasks, error: taskError } = await supabase.from('tasks').select('*');
                const { data: tags, error: tagsError } = await supabase.from('tags').select('*');
                // Use maybeSingle() to avoid 406 error if the table is empty
                const { data: settings, error: settingsError } = await supabase.from('settings').select('last_opened_date, daily_queue_session').maybeSingle();
                
                if (taskError || settingsError || tagsError) {
                    console.error('Error fetching data from Supabase:', { taskError, settingsError, tagsError });
                    return null;
                }

                return {
                    state: {
                        tags: (tags || []).map((t: any) => ({
                            id: t.id,
                            name: t.name,
                            color: t.color
                        })),
                        tasks: (tasks || []).map((t: any) => ({
                            id: t.id,
                            title: t.title,
                            description: t.description,
                            priority: t.priority,
                            status: t.status,
                            subSteps: t.sub_steps || [],
                            category: t.category,
                            frequency: t.frequency,
                            frequencyInterval: t.frequency_interval,
                            weekDays: t.week_days,
                            weekInterval: t.week_interval,
                            completions: t.completions,
                            createdAt: t.created_at,
                            lastQueuedAt: t.last_queued_at,
                            history: t.history || [],
                            tags: t.tags || []
                        })),
                        lastOpenedDate: settings?.last_opened_date || new Date().toISOString().split('T')[0],
                        dailyQueueSession: settings?.daily_queue_session || null
                    },
                    version: 0
                };
            }

            if (name === 'todo-ai-settings') {
                const { data, error } = await supabase.from('settings').select('*').maybeSingle();
                if (error) {
                    console.error('Error fetching settings from Supabase:', error);
                    return null;
                }
                if (!data) return null;
                return {
                    state: {
                        theme: data.theme,
                        soundEnabled: data.sound_enabled,
                        bannerPhrases: data.banner_phrases
                    },
                    version: 0
                };
            }
        } catch (err) {
            console.error('SupabaseService.getItem critical error:', err);
        }

        return null;
    },

    setItem: async (name: string, value: any) => {
        try {
            const { state } = value;

            if (name === 'todo-ai-storage') {
                // 1. We no longer actively delete orphaned tasks here.
                // This prevents a stale local tab from wiping out tasks created on another device.
                // Deletions are now handled explicitly in the store's `deleteTask` action.

                // 2. Upsert the current tasks
                if (state.tasks && state.tasks.length > 0) {
                    const { error } = await supabase.from('tasks').upsert(
                        state.tasks.map((t: any) => ({
                            id: t.id,
                            title: t.title,
                            description: t.description,
                            priority: t.priority,
                            status: t.status,
                            sub_steps: t.subSteps,
                            category: t.category,
                            frequency: t.frequency,
                            frequency_interval: t.frequencyInterval,
                            week_days: t.weekDays,
                            week_interval: t.weekInterval,
                            completions: t.completions,
                            created_at: t.createdAt,
                            last_queued_at: t.lastQueuedAt,
                            history: t.history || [],
                            tags: t.tags || []
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving tasks to Supabase:', error);
                }

                if (state.tags && state.tags.length > 0) {
                    const { error } = await supabase.from('tags').upsert(
                        state.tags.map((t: any) => ({
                            id: t.id,
                            name: t.name,
                            color: t.color
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving tags to Supabase:', error);
                }

                if (state.lastOpenedDate || state.dailyQueueSession) {
                    await supabase.from('settings').upsert({
                        id: SETTINGS_SINGLETON_ID,
                        last_opened_date: state.lastOpenedDate,
                        daily_queue_session: state.dailyQueueSession
                    }, { onConflict: 'id' });
                }
            }

            if (name === 'todo-ai-settings') {
                const { error } = await supabase.from('settings').upsert({
                    id: SETTINGS_SINGLETON_ID,
                    theme: state.theme,
                    sound_enabled: state.soundEnabled,
                    banner_phrases: state.bannerPhrases
                }, { onConflict: 'id' });
                if (error) console.error('Error saving settings to Supabase:', error);
            }
        } catch (err) {
            console.error('SupabaseService.setItem critical error:', err);
        }
    },

    removeItem: async (name: string) => {
        if (name === 'todo-ai-storage') {
            await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
        if (name === 'todo-ai-settings') {
            await supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
    }
};
