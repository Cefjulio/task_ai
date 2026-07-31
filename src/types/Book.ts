export interface Book {
    id: string;
    title: string;
    author: string;
    totalPages: number;
    pdfUrl: string;
    coverUrl: string;
    currentPage: number;  // next unread page, 1-indexed
    isActive: boolean;    // include in daily rotation
    notes: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface BookAssignment {
    bookId: string;
    startPage: number;
    endPage: number;
    completedAt?: string;
    isExtra?: boolean;
}

export interface DailyReadingGoal {
    date: string;                  // 'YYYY-MM-DD'
    assignments: BookAssignment[];
}

export interface ReadingSettings {
    pagesPerSession: number;  // pages per book per daily session
    booksPerDay: number;      // how many books per day
}
