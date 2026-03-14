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

    // Queue actions
    dailyQueueSession: { date: string, taskIds: string[] } | null;
    generateQueueSession: (forceRefresh: boolean, currentDate: string) => void;

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
            dailyQueueSession: null,

            generateQueueSession: (forceRefresh, currentDate) => {
                set((state) => {
                    // Only generate a new session if forced, or if the stored session is from a different day
                    if (!forceRefresh && state.dailyQueueSession?.date === currentDate) {
                        return state; // Session is still valid
                    }

                    // 1. Gather all dynamic tasks eligible for the queue
                    const dynamicTasks = state.tasks.filter(t => {
                        const isDynamic = ['primary', 'secondary', 'tertiary'].includes(t.priority);
                        const cat = t.category || (isDynamic ? 'dynamic' : 'random');
                        return cat === 'dynamic';
                    });

                    // 2. Separate into active secondary and tertiary pools
                    const secondaryPool = dynamicTasks.filter(t => t.priority === 'secondary' || t.priority === 'high');
                    const tertiaryPool = dynamicTasks.filter(t => t.priority === 'tertiary' || t.priority === 'middle' || t.priority === 'low');

                    // 3. Sort by priority (fewest completions first, then oldest)
                    const sortQueueList = (list: Task[]) => {
                        list.sort((a, b) => {
                            if (a.completions === b.completions) {
                                const timeA = new Date(a.lastQueuedAt || a.createdAt).getTime();
                                const timeB = new Date(b.lastQueuedAt || b.createdAt).getTime();
                                return timeA - timeB;
                            }
                            return a.completions - b.completions;
                        });
                    };

                    sortQueueList(secondaryPool);
                    sortQueueList(tertiaryPool);

                    // 4. Pick top 2 secondary, top 1 tertiary for the new session
                    const newSessionIds = [
                        ...secondaryPool.slice(0, 2).map(t => t.id),
                        ...tertiaryPool.slice(0, 1).map(t => t.id)
                    ];

                    // 5. Reset status of picked tasks to 'pending' if they were 'done' or 'skipped'
                    // This creates the rotation effect where previously completed tasks become available again.
                    const updatedTasks = state.tasks.map(t => {
                        if (newSessionIds.includes(t.id) && t.status !== 'pending') {
                            return { ...t, status: 'pending' as TaskStatus }; // Explicit case for TS
                        }
                        return t;
                    });

                    return {
                        ...state,
                        tasks: updatedTasks,
                        dailyQueueSession: {
                            date: currentDate,
                            taskIds: newSessionIds
                        }
                    };
                });
            },


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
                lastOpenedDate: state.lastOpenedDate,
                dailyQueueSession: state.dailyQueueSession
            }), // Do NOT persist selectedDate
        }
    )
);
