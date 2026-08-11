export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface Course {
    id: string;
    title: string;
    description: string; // HTML rich text
    emoji: string;
    color: string; // hex accent
    category: string; // free-text label used for filter chips
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
}

export interface Lesson {
    id: string;
    courseId: string;
    title: string; // HTML rich text
    content: string; // HTML rich text
    resourceUrl: string; // Gemini NotebookLM share link
    status: LessonStatus;
    order: number;
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
}
