-- Create the study_items table
CREATE TABLE public.study_items (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL,
    content_url TEXT,
    completion_percentage NUMERIC DEFAULT 0,
    last_page_read TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.study_items ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Enable all for all users" ON public.study_items
    FOR ALL
    USING (true)
    WITH CHECK (true);
