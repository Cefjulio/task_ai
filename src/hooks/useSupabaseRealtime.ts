import { useEffect } from 'react';
import { supabase } from '@/services/supabase/supabaseClient';
import { useTaskStore } from '@/store/taskStore';
import { Task, Tag, TaskStatus } from '@/types/Task';

export const useSupabaseRealtime = () => {
    useEffect(() => {
        // 1. Subscribe to Tasks table
        const taskChannel = supabase
            .channel('tasks-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tasks' },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        const mappedTask: Task = {
                            id: newRecord.id,
                            title: newRecord.title,
                            description: newRecord.description,
                            priority: newRecord.priority,
                            status: newRecord.status as TaskStatus,
                            subSteps: newRecord.sub_steps || [],
                            category: newRecord.category,
                            frequency: newRecord.frequency,
                            frequencyInterval: newRecord.frequency_interval,
                            weekDays: newRecord.week_days,
                            weekInterval: newRecord.week_interval,
                            completions: newRecord.completions,
                            createdAt: newRecord.created_at,
                            lastQueuedAt: newRecord.last_queued_at,
                            history: newRecord.history || [],
                            tags: newRecord.tags || []
                        };

                        // Check if task already exists in local state to avoid redundant updates
                        const existingTask = useTaskStore.getState().tasks.find(t => t.id === mappedTask.id);
                        if (JSON.stringify(existingTask) !== JSON.stringify(mappedTask)) {
                            if (eventType === 'INSERT' && !existingTask) {
                                useTaskStore.setState((state) => ({ tasks: [...state.tasks, mappedTask] }));
                            } else if (existingTask) {
                                useTaskStore.getState().updateTask(mappedTask.id, mappedTask);
                            }
                        }
                    } else if (eventType === 'DELETE') {
                        useTaskStore.setState((state) => ({
                            tasks: state.tasks.filter(t => t.id !== oldRecord.id)
                        }));
                    }
                }
            )
            .subscribe();

        // 2. Subscribe to Tags table
        const tagChannel = supabase
            .channel('tags-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tags' },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        const mappedTag: Tag = {
                            id: newRecord.id,
                            name: newRecord.name,
                            color: newRecord.color
                        };

                        const existingTag = useTaskStore.getState().tags.find(t => t.id === mappedTag.id);
                        if (JSON.stringify(existingTag) !== JSON.stringify(mappedTag)) {
                            if (eventType === 'INSERT' && !existingTag) {
                                useTaskStore.setState((state) => ({ tags: [...state.tags, mappedTag] }));
                            } else if (existingTag) {
                                useTaskStore.getState().updateTag(mappedTag.id, mappedTag);
                            }
                        }
                    } else if (eventType === 'DELETE') {
                        useTaskStore.setState((state) => ({
                            tags: state.tags.filter(t => t.id !== oldRecord.id)
                        }));
                    }
                }
            )
            .subscribe();

        // 3. Subscribe to Settings table (Queue Session)
        const settingsChannel = supabase
            .channel('settings-realtime')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'settings' },
                (payload) => {
                    const { new: newRecord } = payload;
                    
                    const currentSession = useTaskStore.getState().dailyQueueSession;
                    const newSession = newRecord.daily_queue_session;

                    if (JSON.stringify(currentSession) !== JSON.stringify(newSession)) {
                        useTaskStore.setState({ 
                            dailyQueueSession: newSession,
                            lastOpenedDate: newRecord.last_opened_date
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(taskChannel);
            supabase.removeChannel(tagChannel);
            supabase.removeChannel(settingsChannel);
        };
    }, []);
};
