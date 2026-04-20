export type GoalStatus = 'active' | 'completed' | 'archived';

export interface Goal {
    id: string;
    title: string;
    description?: string;
    color: string;      // Tailwind bg-* class, same convention as Tag
    emoji: string;      // A single emoji for quick recognition
    status: GoalStatus;
    createdAt: string;  // ISO string
    targetDate?: string; // YYYY-MM-DD
}
