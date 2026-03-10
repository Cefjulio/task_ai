import { IStorageService } from './storageInterface';

/**
 * Phase 1: LocalStorage Implementation
 * This engine can be plugged directly into Zustand's persist middleware,
 * or used as a standalone service.
 */
export const localStorageService: IStorageService = {
    getItem: (name: string) => {
        const item = localStorage.getItem(name);
        try {
            return item ? JSON.parse(item) : null;
        } catch {
            return item;
        }
    },
    setItem: (name: string, value: any) => {
        localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name: string) => {
        localStorage.removeItem(name);
    }
};
