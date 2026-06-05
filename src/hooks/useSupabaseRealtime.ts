import { useEffect } from 'react';
import { supabase } from '@/services/supabase/supabaseClient';
import { useTaskStore } from '@/store/taskStore';
import { Task, Tag, TaskStatus } from '@/types/Task';
import { useHealthStore } from '@/store/healthStore';
import { HealthLog, HealthTag } from '@/types/Health';

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

        // 4. Subscribe to Health Logs table
        const healthLogChannel = supabase
            .channel('health-logs-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'health_logs' },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        const mappedLog: HealthLog = {
                            id: newRecord.id,
                            type: newRecord.type,
                            loggedAt: newRecord.logged_at,
                            description: newRecord.description,
                            mediaUrl: newRecord.media_url,
                            mealCategory: newRecord.meal_category,
                            tags: newRecord.tags || [],
                            waterAmount: newRecord.water_amount ? Number(newRecord.water_amount) : undefined,
                            exerciseDuration: newRecord.exercise_duration ? Number(newRecord.exercise_duration) : undefined,
                            exerciseIntensity: newRecord.exercise_intensity,
                            systolic: newRecord.systolic ? Number(newRecord.systolic) : undefined,
                            diastolic: newRecord.diastolic ? Number(newRecord.diastolic) : undefined,
                            bloodSugar: newRecord.blood_sugar ? Number(newRecord.blood_sugar) : undefined,
                            medicineName: newRecord.medicine_name,
                            medicineDosage: newRecord.medicine_dosage,
                            createdAt: newRecord.created_at,
                            updatedAt: newRecord.updated_at
                        };

                        const existingLog = useHealthStore.getState().healthLogs.find(l => l.id === mappedLog.id);
                        if (JSON.stringify(existingLog) !== JSON.stringify(mappedLog)) {
                            if (eventType === 'INSERT' && !existingLog) {
                                useHealthStore.setState((state) => ({ healthLogs: [mappedLog, ...state.healthLogs] }));
                            } else if (existingLog) {
                                useHealthStore.getState().updateHealthLog(mappedLog.id, mappedLog);
                            }
                        }
                    } else if (eventType === 'DELETE') {
                        useHealthStore.setState((state) => ({
                            healthLogs: state.healthLogs.filter(l => l.id !== oldRecord.id)
                        }));
                    }
                }
            )
            .subscribe();

        // 5. Subscribe to Health Tags table
        const healthTagChannel = supabase
            .channel('health-tags-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'health_tags' },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    if (eventType === 'INSERT' || eventType === 'UPDATE') {
                        const mappedTag: HealthTag = {
                            id: newRecord.id,
                            name: newRecord.name,
                            color: newRecord.color,
                            createdAt: newRecord.created_at
                        };

                        const existingTag = useHealthStore.getState().healthTags.find(t => t.id === mappedTag.id);
                        if (JSON.stringify(existingTag) !== JSON.stringify(mappedTag)) {
                            if (eventType === 'INSERT' && !existingTag) {
                                useHealthStore.setState((state) => ({ healthTags: [...state.healthTags, mappedTag] }));
                            } else if (existingTag) {
                                useHealthStore.getState().updateHealthTag(mappedTag.id, mappedTag);
                            }
                        }
                    } else if (eventType === 'DELETE') {
                        useHealthStore.setState((state) => ({
                            healthTags: state.healthTags.filter(t => t.id !== oldRecord.id)
                        }));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(taskChannel);
            supabase.removeChannel(tagChannel);
            supabase.removeChannel(settingsChannel);
            supabase.removeChannel(healthLogChannel);
            supabase.removeChannel(healthTagChannel);
        };
    }, []);
};
