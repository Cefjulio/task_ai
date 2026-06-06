export type HealthLogType = 'meal' | 'water' | 'exercise' | 'medicine' | 'vitals' | 'fast';

export type MealCategory = 'carbs' | 'protein' | 'fat' | 'balanced' | 'other';

export interface HealthTag {
    id: string;
    name: string;
    color: string;
    createdAt: string; // ISO string
}

export interface FastingSessionState {
    fastingHours: number; // e.g. 16
    eatingHours: number; // e.g. 8
    activeFastStart: string | null; // ISO string when current fast started
    lastFastEnd: string | null; // ISO string when last fast ended
}

export interface HealthLog {
    id: string;
    type: HealthLogType;
    loggedAt: string; // ISO string (e.g. YYYY-MM-DDTHH:mm)
    description?: string;
    mediaUrl?: string; // compressed base64 image/video or url
    createdAt: string; // ISO string
    updatedAt: string; // ISO string

    // Meal specific
    mealCategory?: MealCategory;
    tags?: string[]; // Array of health tag IDs

    // Water specific
    waterAmount?: number; // in ml

    // Exercise specific
    exerciseDuration?: number; // in minutes
    exerciseIntensity?: 'low' | 'medium' | 'high';

    // Vitals specific
    systolic?: number; // BP systolic mmHg
    diastolic?: number; // BP diastolic mmHg
    bloodSugar?: number; // glucose mg/dL

    // Medicine specific
    medicineName?: string;
    medicineDosage?: string; // e.g. "1 tablet", "500mg"

    // Fasting specific
    fastingDuration?: number; // in minutes
}
