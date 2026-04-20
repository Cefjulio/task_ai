export type StudyContentType = 'pdf' | 'youtube' | 'webpage' | 'audio';
export type StudyStatus = 'pending' | 'completed';

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
    tags: string[]; // array of Tag IDs from TaskStore (reusing tags)
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
}
