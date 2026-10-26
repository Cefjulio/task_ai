import { supabase } from '../supabase/supabaseClient';
import { IStorageService } from './storageInterface';

/**
 * Supabase Storage Implementation
 * Maps Zustand persist keys to specific Supabase tables.
 */
const SETTINGS_SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

export const supabaseService: IStorageService = {
    getItem: async (name: string) => {
        try {
            if (name === 'todo-ai-storage') {
                const { data: tasks, error: taskError } = await supabase.from('tasks').select('*');
                const { data: tags, error: tagsError } = await supabase.from('tags').select('*');
                const { data: goals, error: goalsError } = await supabase.from('goals').select('*');
                const { data: plans, error: plansError } = await supabase.from('plans').select('*');
                // Use maybeSingle() to avoid 406 error if the table is empty
                const { data: settings, error: settingsError } = await supabase.from('settings').select('last_opened_date, daily_queue_session').maybeSingle();
                
                if (taskError || tagsError || goalsError || plansError) {
                    console.error('Error fetching core data from Supabase:', { taskError, tagsError, goalsError, plansError });
                    return null;
                }

                if (settingsError) {
                    console.warn('Non-critical: Settings/Queue could not be loaded from Supabase (Schema might need update):', settingsError);
                }

                return {
                    state: {
                        tags: (tags || []).map((t: any) => ({
                            id: t.id,
                            name: t.name,
                            color: t.color
                        })),
                        tasks: (tasks || []).map((t: any) => ({
                            id: t.id,
                            title: t.title,
                            description: t.description,
                            priority: t.priority,
                            status: t.status,
                            subSteps: t.sub_steps || [],
                            category: t.category,
                            frequency: t.frequency,
                            frequencyInterval: t.frequency_interval,
                            weekDays: t.week_days,
                            weekInterval: t.week_interval,
                            completions: t.completions,
                            createdAt: t.created_at,
                            lastQueuedAt: t.last_queued_at,
                            focusDate: t.focus_date ?? undefined,
                            history: t.history || [],
                            tags: t.tags || [],
                            goalId: t.goal_id
                        })),
                        goals: (goals || []).map((g: any) => ({
                            id: g.id,
                            title: g.title,
                            description: g.description,
                            color: g.color,
                            emoji: g.emoji,
                            status: g.status,
                            createdAt: g.created_at,
                            targetDate: g.target_date
                        })),
                        plans: (plans || []).map((p: any) => ({
                            id: p.id,
                            title: p.title,
                            content: p.content,
                            createdAt: p.created_at,
                            updatedAt: p.updated_at
                        })),
                        lastOpenedDate: settings?.last_opened_date || new Date().toLocaleDateString('en-CA'),
                        dailyQueueSession: settings?.daily_queue_session || null
                    },
                    version: 0
                };
            }

            if (name === 'todo-ai-settings') {
                const { data, error } = await supabase.from('settings').select('*').maybeSingle();
                if (error) {
                    console.error('Error fetching settings from Supabase:', error);
                    return null;
                }
                if (!data) return null;
                return {
                    state: {
                        theme: data.theme,
                        soundEnabled: data.sound_enabled,
                        bannerPhrases: data.banner_phrases,
                        fastingState: data.fasting_state || {
                            fastingHours: 16,
                            eatingHours: 8,
                            activeFastStart: null,
                            lastFastEnd: null
                        }
                    },
                    version: 0
                };
            }

            if (name === 'todo-ai-study-storage') {
                const { data: studyItems, error } = await supabase.from('study_items').select('*');
                const { data: settings } = await supabase
                    .from('settings')
                    .select('pinned_study_ids')
                    .eq('id', SETTINGS_SINGLETON_ID)
                    .maybeSingle();
                if (error) {
                    console.error('Error fetching study items from Supabase:', error);
                    return null;
                }
                return {
                    state: {
                        studyItems: (studyItems || []).map((t: any) => ({
                            id: t.id,
                            title: t.title,
                            description: t.description,
                            contentType: t.content_type,
                            contentUrl: t.content_url,
                            completionPercentage: t.completion_percentage,
                            lastPageRead: t.last_page_read,
                            notes: t.notes,
                            status: t.status,
                            priority: t.priority || 'medium',
                            tags: t.tags || [],
                            createdAt: t.created_at,
                            updatedAt: t.updated_at
                        })),
                        pinnedItemIds: settings?.pinned_study_ids || []
                    },
                    version: 0
                };
            }

            if (name === 'todo-ai-reading-storage') {
                const { data: books, error } = await supabase.from('books').select('*');
                const { data: rSettings } = await supabase
                    .from('settings')
                    .select('reading_pages_per_session, reading_books_per_day, reading_daily_goal, reading_streak, reading_last_completed_date')
                    .eq('id', SETTINGS_SINGLETON_ID)
                    .maybeSingle();
                if (error) {
                    console.error('Error fetching books from Supabase:', error);
                    return null;
                }
                return {
                    state: {
                        books: (books || []).map((b: any) => ({
                            id: b.id,
                            title: b.title,
                            author: b.author || '',
                            totalPages: b.total_pages,
                            pdfUrl: b.pdf_url || '',
                            coverUrl: b.cover_url || '',
                            currentPage: b.current_page || 1,
                            isActive: b.is_active !== false,
                            notes: b.notes || '',
                            tags: b.tags || [],
                            createdAt: b.created_at,
                            updatedAt: b.updated_at,
                        })),
                        settings: {
                            pagesPerSession: rSettings?.reading_pages_per_session ?? 10,
                            booksPerDay: rSettings?.reading_books_per_day ?? 2,
                        },
                        todayGoal: rSettings?.reading_daily_goal ?? null,
                        streak: rSettings?.reading_streak ?? 0,
                        lastCompletedDate: rSettings?.reading_last_completed_date ?? null,
                    },
                    version: 0,
                };
            }

            if (name === 'todo-ai-lms-storage') {
                const { data: courses, error: coursesError } = await supabase.from('lms_courses').select('*');
                const { data: lessons, error: lessonsError } = await supabase.from('lms_lessons').select('*');

                if (coursesError || lessonsError) {
                    console.error('Error fetching LMS data from Supabase:', { coursesError, lessonsError });
                    return null;
                }

                return {
                    state: {
                        courses: (courses || []).map((c: any) => ({
                            id: c.id,
                            title: c.title,
                            description: c.description || '',
                            emoji: c.emoji || '',
                            color: c.color || '',
                            category: c.category || '',
                            bookmarkLessonId: c.bookmark_lesson_id ?? null,
                            createdAt: c.created_at,
                            updatedAt: c.updated_at,
                        })),
                        lessons: (lessons || []).map((l: any) => ({
                            id: l.id,
                            courseId: l.course_id,
                            title: l.title,
                            content: l.content || '',
                            resourceUrl: l.resource_url || '',
                            status: l.status || 'not_started',
                            order: l.sort_order ?? 0,
                            createdAt: l.created_at,
                            updatedAt: l.updated_at,
                        })),
                    },
                    version: 0,
                };
            }

            if (name === 'todo-ai-health-storage') {
                const { data: logs, error: logsError } = await supabase.from('health_logs').select('*');
                const { data: tags, error: tagsError } = await supabase.from('health_tags').select('*');
                
                if (logsError) {
                    console.error('Error fetching health logs from Supabase:', logsError);
                }
                if (tagsError) {
                    console.error('Error fetching health tags from Supabase:', tagsError);
                }
                
                return {
                    state: {
                        healthLogs: (logs || []).map((l: any) => ({
                            id: l.id,
                            type: l.type,
                            loggedAt: l.logged_at,
                            description: l.description,
                            mediaUrl: l.media_url,
                            mealCategory: l.meal_category,
                            tags: l.tags || [],
                            waterAmount: l.water_amount ? Number(l.water_amount) : undefined,
                            exerciseDuration: l.exercise_duration ? Number(l.exercise_duration) : undefined,
                            exerciseIntensity: l.exercise_intensity,
                            systolic: l.systolic ? Number(l.systolic) : undefined,
                            diastolic: l.diastolic ? Number(l.diastolic) : undefined,
                            bloodSugar: l.blood_sugar ? Number(l.blood_sugar) : undefined,
                            medicineName: l.medicine_name,
                            medicineDosage: l.medicine_dosage,
                            fastingDuration: l.fasting_duration ? Number(l.fasting_duration) : undefined,
                            createdAt: l.created_at,
                            updatedAt: l.updated_at
                        })),
                        healthTags: (tags || []).map((t: any) => ({
                            id: t.id,
                            name: t.name,
                            color: t.color,
                            createdAt: t.created_at
                        }))
                    },
                    version: 0
                };
            }
        } catch (err) {
            console.error('SupabaseService.getItem critical error:', err);
        }

        return null;
    },

    setItem: async (name: string, value: any) => {
        try {
            const { state } = value;

            if (name === 'todo-ai-storage') {
                // 1. We no longer actively delete orphaned tasks here.
                // This prevents a stale local tab from wiping out tasks created on another device.
                // Deletions are now handled explicitly in the store's `deleteTask` action.

                // 2. Upsert the current tasks
                if (state.tasks && state.tasks.length > 0) {
                    const taskRows = state.tasks.map((t: any) => ({
                        id: t.id,
                        title: t.title,
                        description: t.description,
                        priority: t.priority,
                        status: t.status,
                        sub_steps: t.subSteps,
                        category: t.category,
                        frequency: t.frequency,
                        frequency_interval: t.frequencyInterval,
                        week_days: t.weekDays,
                        week_interval: t.weekInterval,
                        completions: t.completions,
                        created_at: t.createdAt,
                        last_queued_at: t.lastQueuedAt,
                        focus_date: t.focusDate ?? null,
                        history: t.history || [],
                        tags: t.tags || [],
                        goal_id: t.goalId
                    }));
                    let { error } = await supabase.from('tasks').upsert(taskRows, { onConflict: 'id' });

                    // The Focus column comes from supabase_task_focus.sql — until that has been run,
                    // keep saving everything else instead of failing the whole upsert.
                    if (error && /focus_date/.test(error.message ?? '')) {
                        console.warn('tasks.focus_date is missing — run supabase_task_focus.sql to sync Focus picks.');
                        ({ error } = await supabase.from('tasks').upsert(
                            taskRows.map(({ focus_date, ...row }: any) => row),
                            { onConflict: 'id' }
                        ));
                    }
                    if (error) console.error('Error saving tasks to Supabase:', error);
                }

                if (state.goals && state.goals.length > 0) {
                    const { error } = await supabase.from('goals').upsert(
                        state.goals.map((g: any) => ({
                            id: g.id,
                            title: g.title,
                            description: g.description,
                            color: g.color,
                            emoji: g.emoji,
                            status: g.status,
                            created_at: g.createdAt,
                            target_date: g.targetDate || null
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving goals to Supabase:', error);
                }

                if (state.plans && state.plans.length > 0) {
                    const { error } = await supabase.from('plans').upsert(
                        state.plans.map((p: any) => ({
                            id: p.id,
                            title: p.title,
                            content: p.content,
                            created_at: p.createdAt,
                            updated_at: p.updatedAt
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving plans to Supabase:', error);
                }

                if (state.tags && state.tags.length > 0) {
                    const { error } = await supabase.from('tags').upsert(
                        state.tags.map((t: any) => ({
                            id: t.id,
                            name: t.name,
                            color: t.color
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving tags to Supabase:', error);
                }

                if (state.lastOpenedDate || state.dailyQueueSession) {
                    await supabase.from('settings').upsert({
                        id: SETTINGS_SINGLETON_ID,
                        last_opened_date: state.lastOpenedDate,
                        daily_queue_session: state.dailyQueueSession
                    }, { onConflict: 'id' });
                }
            }

            if (name === 'todo-ai-settings') {
                const { error } = await supabase.from('settings').upsert({
                    id: SETTINGS_SINGLETON_ID,
                    theme: state.theme,
                    sound_enabled: state.soundEnabled,
                    banner_phrases: state.bannerPhrases,
                    fasting_state: state.fastingState
                }, { onConflict: 'id' });
                if (error) console.error('Error saving settings to Supabase:', error);
            }

            if (name === 'todo-ai-study-storage') {
                if (state.studyItems && state.studyItems.length > 0) {
                    const { error } = await supabase.from('study_items').upsert(
                        state.studyItems.map((t: any) => ({
                            id: t.id,
                            title: t.title,
                            description: t.description,
                            content_type: t.contentType,
                            content_url: t.contentUrl,
                            completion_percentage: t.completionPercentage,
                            last_page_read: t.lastPageRead,
                            notes: t.notes,
                            status: t.status,
                            priority: t.priority,
                            tags: t.tags || [],
                            created_at: t.createdAt,
                            updated_at: t.updatedAt
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving study items to Supabase:', error);
                }
                // Persist pinned IDs to the settings singleton so they sync across devices
                await supabase.from('settings').upsert({
                    id: SETTINGS_SINGLETON_ID,
                    pinned_study_ids: state.pinnedItemIds || []
                }, { onConflict: 'id' });
            }

            if (name === 'todo-ai-reading-storage') {
                if (state.books && state.books.length > 0) {
                    const { error } = await supabase.from('books').upsert(
                        state.books.map((b: any) => ({
                            id: b.id,
                            title: b.title,
                            author: b.author || '',
                            total_pages: b.totalPages,
                            pdf_url: b.pdfUrl || '',
                            cover_url: b.coverUrl || '',
                            current_page: b.currentPage,
                            is_active: b.isActive,
                            notes: b.notes || '',
                            tags: b.tags || [],
                            created_at: b.createdAt,
                            updated_at: b.updatedAt,
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving books to Supabase:', error);
                }
                await supabase.from('settings').upsert({
                    id: SETTINGS_SINGLETON_ID,
                    reading_pages_per_session: state.settings?.pagesPerSession ?? 10,
                    reading_books_per_day: state.settings?.booksPerDay ?? 2,
                    reading_daily_goal: state.todayGoal ?? null,
                    reading_streak: state.streak ?? 0,
                    reading_last_completed_date: state.lastCompletedDate ?? null,
                }, { onConflict: 'id' });
            }

            if (name === 'todo-ai-lms-storage') {
                if (state.courses && state.courses.length > 0) {
                    const courseRows = state.courses.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        description: c.description || '',
                        emoji: c.emoji || '',
                        color: c.color || '',
                        category: c.category || '',
                        bookmark_lesson_id: c.bookmarkLessonId ?? null,
                        created_at: c.createdAt,
                        updated_at: c.updatedAt,
                    }));
                    let { error } = await supabase.from('lms_courses').upsert(courseRows, { onConflict: 'id' });

                    // The bookmark column comes from supabase_lms_bookmark.sql — until that has been run,
                    // keep saving everything else instead of failing the whole upsert.
                    if (error && /bookmark_lesson_id/.test(error.message ?? '')) {
                        console.warn('lms_courses.bookmark_lesson_id is missing — run supabase_lms_bookmark.sql to sync bookmarks.');
                        ({ error } = await supabase.from('lms_courses').upsert(
                            courseRows.map(({ bookmark_lesson_id, ...row }: any) => row),
                            { onConflict: 'id' }
                        ));
                    }
                    if (error) console.error('Error saving LMS courses to Supabase:', error);
                }

                if (state.lessons && state.lessons.length > 0) {
                    const { error } = await supabase.from('lms_lessons').upsert(
                        state.lessons.map((l: any) => ({
                            id: l.id,
                            course_id: l.courseId,
                            title: l.title,
                            content: l.content || '',
                            resource_url: l.resourceUrl || '',
                            status: l.status,
                            sort_order: l.order,
                            created_at: l.createdAt,
                            updated_at: l.updatedAt,
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving LMS lessons to Supabase:', error);
                }
            }

            if (name === 'todo-ai-health-storage') {
                if (state.healthLogs) {
                    const { error } = await supabase.from('health_logs').upsert(
                        state.healthLogs.map((l: any) => ({
                            id: l.id,
                            type: l.type,
                            logged_at: l.loggedAt,
                            description: l.description,
                            media_url: l.mediaUrl,
                            meal_category: l.mealCategory,
                            tags: l.tags || [],
                            water_amount: l.waterAmount,
                            exercise_duration: l.exerciseDuration,
                            exercise_intensity: l.exerciseIntensity,
                            systolic: l.systolic,
                            diastolic: l.diastolic,
                            blood_sugar: l.bloodSugar,
                            medicine_name: l.medicineName,
                            medicine_dosage: l.medicineDosage,
                            fasting_duration: l.fastingDuration,
                            created_at: l.createdAt,
                            updated_at: l.updatedAt
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving health logs to Supabase:', error);
                }

                if (state.healthTags) {
                    const { error } = await supabase.from('health_tags').upsert(
                        state.healthTags.map((t: any) => ({
                            id: t.id,
                            name: t.name,
                            color: t.color,
                            created_at: t.createdAt
                        })),
                        { onConflict: 'id' }
                    );
                    if (error) console.error('Error saving health tags to Supabase:', error);
                }
            }
        } catch (err) {
            console.error('SupabaseService.setItem critical error:', err);
        }
    },

    removeItem: async (name: string) => {
        if (name === 'todo-ai-storage') {
            await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('goals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
        if (name === 'todo-ai-settings') {
            await supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
        if (name === 'todo-ai-study-storage') {
            await supabase.from('study_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
        if (name === 'todo-ai-health-storage') {
            await supabase.from('health_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('health_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
        if (name === 'todo-ai-lms-storage') {
            await supabase.from('lms_lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('lms_courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }
    }
};
