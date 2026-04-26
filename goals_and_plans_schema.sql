-- Run this in your Supabase SQL Editor to support Goals and Plans persistence

-- 1. Create the goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    emoji TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    target_date DATE
);

-- 2. Create the plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- 3. Add goal_id to tasks for association
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES goals(id) ON DELETE SET NULL;
