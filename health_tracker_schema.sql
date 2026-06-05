-- SQL Schema Update for Health Tracker
-- Run this script in your Supabase SQL Editor to initialize the database tables.

-- 1. Create the health_tags table
CREATE TABLE IF NOT EXISTS public.health_tags (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for health_tags
ALTER TABLE public.health_tags ENABLE ROW LEVEL SECURITY;

-- Policy for health_tags
CREATE POLICY "Enable all for all users on health_tags" ON public.health_tags
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. Create the health_logs table
CREATE TABLE IF NOT EXISTS public.health_logs (
    id UUID PRIMARY KEY,
    type TEXT NOT NULL, -- 'meal', 'water', 'exercise', 'medicine', 'vitals'
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    media_url TEXT, -- Base64 DataURL or URL
    
    -- Meal specific columns
    meal_category TEXT, -- 'carbs', 'protein', 'fat', 'balanced', 'other'
    tags JSONB DEFAULT '[]'::JSONB, -- Array of health tag IDs
    
    -- Water specific columns
    water_amount NUMERIC, -- in ml
    
    -- Exercise specific columns
    exercise_duration NUMERIC, -- in minutes
    exercise_intensity TEXT, -- 'low', 'medium', 'high'
    
    -- Vitals specific columns
    systolic NUMERIC, -- BP systolic
    diastolic NUMERIC, -- BP diastolic
    blood_sugar NUMERIC, -- Blood sugar mg/dL
    
    -- Medicine specific columns
    medicine_name TEXT,
    medicine_dosage TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for health_logs
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

-- Policy for health_logs
CREATE POLICY "Enable all for all users on health_logs" ON public.health_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);
