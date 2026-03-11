import { supabase } from '../supabase/supabaseClient';
import { IStorageService } from './storageInterface';

/**
 * Supabase Storage Implementation
 * Maps Zustand persist keys to specific Supabase tables.
 */
export const supabaseService: IStorageService = {
    getItem: async (name: string) => {
        if (name === 'todo-ai-storage') {
            const { data: tasks, error: taskError } = await supabase.from('tasks').select('*');
            const { data: settings, error: settingsError } = await supabase.from('settings').select('last_opened_date').single();
            
            if (taskError || settingsError) {
                console.error('Error fetching data from Supabase:', { taskError, settingsError });
                return null;
            }

            return {
                state: {
                    tasks: tasks || [],
                    lastOpenedDate: settings?.last_opened_date || new Date().toISOString().split('T')[0]
                },
                version: 0
            };
        }

        if (name === 'todo-ai-settings') {
            const { data, error } = await supabase.from('settings').select('*').single();
            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
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

        return null;
    },

    setItem: async (name: string, value: any) => {
        const { state } = value;

        if (name === 'todo-ai-storage') {
            if (state.tasks) {
                // This is a simplified "sync all" approach. 
                // Better approach would be individual UPSERTS in useTaskStore actions.
                // But for a drop-in replacement, we'll UPSERT all tasks.
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
                        last_queued_at: t.lastQueuedAt
                    }))
                );
                if (error) console.error('Error saving tasks to Supabase:', error);
            }

            if (state.lastOpenedDate) {
                await supabase.from('settings').upsert({
                    last_opened_date: state.lastOpenedDate
                }, { onConflict: 'user_id' });
            }
        }

        if (name === 'todo-ai-settings') {
            const { error } = await supabase.from('settings').upsert({
                theme: state.theme,
                sound_enabled: state.soundEnabled,
                banner_phrases: state.bannerPhrases
            }, { onConflict: 'user_id' }); // user_id is null for now but unique
            if (error) console.error('Error saving settings to Supabase:', error);
        }
    },

    removeItem: async (name: string) => {
        if (name === 'todo-ai-storage') {
            await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
        if (name === 'todo-ai-settings') {
            await supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
    }
};
