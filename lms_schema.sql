-- Create the lms_courses table
CREATE TABLE public.lms_courses (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    color TEXT,
    category TEXT,
    bookmark_lesson_id UUID, -- lesson bookmarked in this book (see supabase_lms_bookmark.sql)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the lms_lessons table
CREATE TABLE public.lms_lessons (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    resource_url TEXT,
    status TEXT DEFAULT 'not_started',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for all operations
CREATE POLICY "Enable all for all users" ON public.lms_courses
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for all users" ON public.lms_lessons
    FOR ALL
    USING (true)
    WITH CHECK (true);
