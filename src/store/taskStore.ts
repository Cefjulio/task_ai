import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, SubStep, TaskStatus } from '@/types/Task';
import { supabaseService } from '@/services/storage/supabaseService';
import { supabase } from '@/services/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface TaskState {
    tasks: Task[];
    lastOpenedDate: string;
    selectedDate: string; // ISO string YYYY-MM-DD
    // Core Actions
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status' | 'completions'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    markTaskStatus: (id: string, status: TaskStatus) => void;

    // Sub-step actions
    addSubStep: (taskId: string, text: string) => void;
    toggleSubStep: (taskId: string, stepId: string) => void;
    deleteSubStep: (taskId: string, stepId: string) => void;

    // Utility actions
    setSelectedDate: (date: string) => void;
    setLastOpenedDate: (dateStr: string) => void;
    setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [],
            lastOpenedDate: new Date().toLocaleDateString('en-CA'),
            selectedDate: new Date().toLocaleDateString('en-CA'),

            addTask: (taskData) => {
                const isDynamicPriority = ['primary', 'secondary', 'tertiary'].includes(taskData.priority);
                const newTask: Task = {
                    ...taskData,
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                    lastQueuedAt: new Date().toISOString(),
                    status: 'pending',
                    completions: 0,
                    category: taskData.category || (isDynamicPriority ? 'dynamic' : 'random'),
                } as Task;
                set((state) => ({ tasks: [...state.tasks, newTask] }));
            },

            updateTask: (id, updates) => {
                set((state) => ({
                    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                }));
            },

            deleteTask: async (id) => {
                // Instantly remove from local state for snappy UI
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                }));

                // Explicitly delete from Supabase so it's gone for good across all devices
                const { error } = await supabase.from('tasks').delete().eq('id', id);
                if (error) {
                    console.error('Error explicitly deleting task from Supabase:', error);
                }
            },

            markTaskStatus: (id, status) => {
                set((state) => {
                    const now = new Date().toISOString();
                    return {
                        tasks: state.tasks.map((t) => {
                            if (t.id !== id) return t;
                            const isQueuePriority = ['secondary', 'tertiary', 'high', 'middle', 'low'].includes(t.priority);
                            return {
                                ...t,
                                status,
                                completions: status === 'done' ? t.completions + 1 : t.completions,
                                lastQueuedAt: isQueuePriority && (status === 'done' || status === 'skipped') ? now : t.lastQueuedAt
                            };
                        }),
                    };
                });
            },

            addSubStep: (taskId, text) => {
                set((state) => ({
                    tasks: state.tasks.map((t) => {
                        if (t.id !== taskId) return t;
                        const newStep: SubStep = { id: uuidv4(), text, status: 'pending' };
                        return { ...t, subSteps: [...t.subSteps, newStep] };
                    }),
                }));
            },

            toggleSubStep: (taskId, stepId) => {
                set((state) => ({
                    tasks: state.tasks.map((t) => {
                        if (t.id !== taskId) return t;
                        return {
                            ...t,
                            subSteps: t.subSteps.map((s) =>
                                s.id === stepId ? { ...s, status: s.status === 'pending' ? 'done' : 'pending' } : s
                            ),
                        };
                    }),
                }));
            },

            deleteSubStep: (taskId, stepId) => {
                set((state) => ({
                    tasks: state.tasks.map((t) => {
                        if (t.id !== taskId) return t;
                        return {
                            ...t,
                            subSteps: t.subSteps.filter((s) => s.id !== stepId),
                        };
                    }),
                }));
            },

            setLastOpenedDate: (dateStr) => set({ lastOpenedDate: dateStr }),
            setSelectedDate: (date) => set({ selectedDate: date }),
            setTasks: (tasks) => set({ tasks }),
        }),
        {
            name: 'todo-ai-storage', // local storage key
            storage: supabaseService as any,
            partialize: (state) => ({
                tasks: state.tasks,
                lastOpenedDate: state.lastOpenedDate
            }), // Do NOT persist selectedDate
        }
    )
);
