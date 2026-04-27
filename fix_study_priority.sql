-- Run this in your Supabase SQL Editor to fix the study priority sync issue
ALTER TABLE study_items ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
