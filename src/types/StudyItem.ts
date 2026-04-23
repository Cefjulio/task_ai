export type StudyContentType = 'pdf' | 'youtube' | 'webpage' | 'audio';
export type StudyStatus = 'pending' | 'reviewed' | 'completed'; // 'completed' kept for backward compat
export type StudyPriority = 'high' | 'medium' | 'low';

export interface StudyItem {
    id: string;
    title: string;
    description: string; // HTML rich text
    contentType: StudyContentType;
    contentUrl: string;
    completionPercentage: number;
    lastPageRead: string; // can be page number or timestamp for an audio/video
    notes: string; // HTML rich text
    status: StudyStatus;
    priority: StudyPriority;
    tags: string[]; // array of Tag IDs from TaskStore (reusing tags)
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
}
