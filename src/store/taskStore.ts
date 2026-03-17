import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, SubStep, TaskStatus, Tag } from '@/types/Task';
import { supabaseService } from '@/services/storage/supabaseService';
import { supabase } from '@/services/supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface TaskState {
    tasks: Task[];
    tags: Tag[];
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

    // Tag actions
    addTag: (tag: Omit<Tag, 'id'>) => void;
    updateTag: (id: string, updates: Partial<Tag>) => void;
    deleteTag: (id: string) => void;

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
            tags: [],
            lastOpenedDate: new Date().toLocaleDateString('en-CA'),
            selectedDate: new Date().toLocaleDateString('en-CA'),
            dailyQueueSession: null,

            generateQueueSession: (forceRefresh, currentDate) => {
                set((state) => {
                    // Only generate a new session if forced, or if the stored session is from a different day.
                    // Also regenerate if the current session is empty but we have tasks available to fill it.
                    const isNewDay = state.dailyQueueSession?.date !== currentDate;
                    const dynamicTasks = state.tasks.filter(t => {
                        const isDynamic = ['primary', 'secondary', 'tertiary'].includes(t.priority);
                        const cat = t.category || (isDynamic ? 'dynamic' : 'random');
                        return cat === 'dynamic';
                    });
                    
                    const isEmptySession = !state.dailyQueueSession?.taskIds || state.dailyQueueSession.taskIds.length === 0;
                    const hasTasksToQueue = dynamicTasks.some(t => t.priority !== 'primary');

                    if (!forceRefresh && !isNewDay && (!isEmptySession || !hasTasksToQueue)) {
                        return state; // Session is valid, or we have nothing new to queue anyway
                    }

                    // 2. Separate into active secondary and tertiary pools
                    const secondaryPool = dynamicTasks.filter(t => t.priority === 'secondary' || t.priority === 'high');
                    const tertiaryPool = dynamicTasks.filter(t => t.priority === 'tertiary' || t.priority === 'middle' || t.priority === 'low');

                    // 3. Sort by priority (fewest completions first, then oldest)
                    const sortQueueList = (list: Task[]) => {
                        list.sort((a, b) => {
                            const compA = a.completions || 0;
                            const compB = b.completions || 0;
                            if (compA === compB) {
                                const timeA = new Date(a.lastQueuedAt || a.createdAt || 0).getTime();
                                const timeB = new Date(b.lastQueuedAt || b.createdAt || 0).getTime();
                                return timeA - timeB;
                            }
                            return compA - compB;
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
                            return { ...t, status: 'pending' as TaskStatus };
                        }
                        return t;
                    });

                    // Avoid unnecessary state updates if nothing actually changed
                    const tasksChanged = updatedTasks !== state.tasks;
                    const sessionChanged = 
                        isNewDay || 
                        isEmptySession || 
                        JSON.stringify(state.dailyQueueSession?.taskIds) !== JSON.stringify(newSessionIds);

                    if (!tasksChanged && !sessionChanged) {
                        return state;
                    }

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
                    history: [],
                    tags: taskData.tags || [],
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
                    const currentDate = state.selectedDate;
                    
                    return {
                        tasks: state.tasks.map((t) => {
                            if (t.id !== id) return t;
                            const isQueuePriority = ['secondary', 'tertiary', 'high', 'middle', 'low'].includes(t.priority);
                            
                            // Manage History Array
                            const currentHistory = t.history || [];
                            const existingDateIndex = currentHistory.findIndex(h => h.date === currentDate);
                            let newHistory = [...currentHistory];
                            
                            if (existingDateIndex >= 0) {
                                newHistory[existingDateIndex] = { date: currentDate, status };
                            } else {
                                newHistory.push({ date: currentDate, status });
                            }

                            // Only update base status for primary tasks if they are being marked on today's true date
                            // (or just rely entirely on history for primary tasks)
                            const newBaseStatus = t.priority === 'primary' ? t.status : status;

                            return {
                                ...t,
                                status: newBaseStatus, // Keep base status intact for primary to avoid global overwrites
                                history: newHistory,
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

            addTag: (tagData) => {
                const newTag: Tag = { ...tagData, id: uuidv4() };
                set((state) => ({ tags: [...state.tags, newTag] }));
            },

            updateTag: (id, updates) => {
                set((state) => ({
                    tags: state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                }));
            },

            deleteTag: (id) => {
                set((state) => ({
                    tags: state.tags.filter((t) => t.id !== id),
                    // Also strictly remove deleted tags from any Tasks that possess them
                    tasks: state.tasks.map((t) => ({
                        ...t,
                        tags: t.tags ? t.tags.filter((tagId) => tagId !== id) : [],
                    })),
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
                tags: state.tags,
                lastOpenedDate: state.lastOpenedDate,
                dailyQueueSession: state.dailyQueueSession
            }), // Do NOT persist selectedDate
        }
    )
);
