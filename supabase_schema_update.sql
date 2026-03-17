-- Run this directly in your Supabase SQL Editor to update your schema for the new features.

-- 1. Create the new tags table to store custom user tags globally
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
);

-- 2. Add the history and tags columns to the existing tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::JSONB;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::JSONB;
