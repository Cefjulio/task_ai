import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudyItem, StudyStatus } from '../types/StudyItem';
import { supabaseService } from '../services/storage/supabaseService';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabase/supabaseClient';

interface StudyState {
    studyItems: StudyItem[];
    
    // Actions
    addStudyItem: (item: Omit<StudyItem, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
    updateStudyItem: (id: string, updates: Partial<StudyItem>) => void;
    deleteStudyItem: (id: string) => void;
    markStudyItemStatus: (id: string, status: StudyStatus) => void;
}

export const useStudyStore = create<StudyState>()(
    persist(
        (set) => ({
            studyItems: [],

            addStudyItem: (itemData) => {
                const now = new Date().toISOString();
                const newItem: StudyItem = {
                    ...itemData,
                    id: uuidv4(),
                    createdAt: now,
                    updatedAt: now,
                    status: 'pending',
                };
                set((state) => ({ studyItems: [newItem, ...state.studyItems] }));
            },

            updateStudyItem: (id, updates) => {
                set((state) => ({
                    studyItems: state.studyItems.map((item) => 
                        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
                    ),
                }));
            },

            deleteStudyItem: async (id) => {
                // Instantly remove from local state for snappy UI
                set((state) => ({
                    studyItems: state.studyItems.filter((item) => item.id !== id),
                }));

                // Explicitly delete from Supabase so it's gone for good across all devices
                const { error } = await supabase.from('study_items').delete().eq('id', id);
                if (error) {
                    console.error('Error explicitly deleting study item from Supabase:', error);
                }
            },

            markStudyItemStatus: (id, status) => {
                set((state) => ({
                    studyItems: state.studyItems.map((item) => 
                        item.id === id 
                            ? { ...item, status, updatedAt: new Date().toISOString() } 
                            : item
                    ),
                }));
            },
        }),
        {
            name: 'todo-ai-study-storage', // local storage key
            storage: supabaseService as any,
            partialize: (state) => ({
                studyItems: state.studyItems,
            }),
        }
    )
);
