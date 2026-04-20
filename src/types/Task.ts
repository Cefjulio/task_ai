export interface SubStep {
    id: string;
    text: string;
    status: 'pending' | 'done';
}

export type TaskPriority = 'primary' | 'secondary' | 'tertiary' | 'high' | 'middle' | 'low';
export type TaskStatus = 'pending' | 'done' | 'skipped';
export type TaskFrequency = 'daily' | 'every_x_days' | 'weekly';

export interface Tag {
    id: string;
    name: string;
    color: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    createdAt: string; // ISO string
    status: TaskStatus;
    subSteps: SubStep[];
    frequency?: TaskFrequency;
    frequencyInterval?: number; // Days for every_x_days
    weekDays?: number[]; // [0-6] where 0 is Sunday
    weekInterval?: number; // 1 = weekly, 2 = bi-weekly, etc.
    completions: number;
    category: 'dynamic' | 'random';
    lastQueuedAt?: string; // ISO string for rotation
    history?: { date: string; status: TaskStatus }[]; // ISO strings of dates (YYYY-MM-DD)
    tags?: string[]; // Array of Tag IDs
    goalId?: string; // Optional reference to a Goal ID
}
