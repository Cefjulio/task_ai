import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HealthLog, HealthTag } from '../types/Health';
import { supabaseService } from '../services/storage/supabaseService';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase/supabaseClient';

interface HealthState {
    healthLogs: HealthLog[];
    healthTags: HealthTag[];

    // Log Actions
    addHealthLog: (log: Omit<HealthLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateHealthLog: (id: string, updates: Partial<HealthLog>) => void;
    deleteHealthLog: (id: string) => void;

    // Tag Actions
    addHealthTag: (tag: Omit<HealthTag, 'id' | 'createdAt'>) => void;
    updateHealthTag: (id: string, updates: Partial<HealthTag>) => void;
    deleteHealthTag: (id: string) => void;
}

export const useHealthStore = create<HealthState>()(
    persist(
        (set) => ({
            healthLogs: [],
            healthTags: [],

            addHealthLog: (logData) => {
                const now = new Date().toISOString();
                const newLog: HealthLog = {
                    ...logData,
                    id: uuidv4(),
                    createdAt: now,
                    updatedAt: now,
                };
                set((state) => ({ healthLogs: [newLog, ...state.healthLogs] }));
            },

            updateHealthLog: (id, updates) => {
                set((state) => ({
                    healthLogs: state.healthLogs.map((log) =>
                        log.id === id ? { ...log, ...updates, updatedAt: new Date().toISOString() } : log
                    ),
                }));
            },

            deleteHealthLog: async (id) => {
                // Remove locally for immediate UI update
                set((state) => ({
                    healthLogs: state.healthLogs.filter((log) => log.id !== id),
                }));

                // Delete from Supabase
                const { error } = await supabase.from('health_logs').delete().eq('id', id);
                if (error) {
                    console.error('Error explicitly deleting health log from Supabase:', error);
                }
            },

            addHealthTag: (tagData) => {
                const now = new Date().toISOString();
                const newTag: HealthTag = {
                    ...tagData,
                    id: uuidv4(),
                    createdAt: now,
                };
                set((state) => ({ healthTags: [...state.healthTags, newTag] }));
            },

            updateHealthTag: (id, updates) => {
                set((state) => ({
                    healthTags: state.healthTags.map((tag) =>
                        tag.id === id ? { ...tag, ...updates } : tag
                    ),
                }));
            },

            deleteHealthTag: async (id) => {
                // Remove locally
                set((state) => ({
                    healthTags: state.healthTags.filter((tag) => tag.id !== id),
                    // Also strip tag reference from any logs using it
                    healthLogs: state.healthLogs.map((log) => {
                        if (log.tags && log.tags.includes(id)) {
                            return {
                                ...log,
                                tags: log.tags.filter((tId) => tId !== id),
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return log;
                    })
                }));

                // Delete from Supabase
                const { error } = await supabase.from('health_tags').delete().eq('id', id);
                if (error) {
                    console.error('Error explicitly deleting health tag from Supabase:', error);
                }
            },
        }),
        {
            name: 'todo-ai-health-storage',
            storage: supabaseService as any,
            partialize: (state) => ({
                healthLogs: state.healthLogs,
                healthTags: state.healthTags,
            }),
        }
    )
);
