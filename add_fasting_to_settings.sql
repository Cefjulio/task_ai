-- SQL Migration to support Fasting tracking settings
-- Run this script in your Supabase SQL Editor.

ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS fasting_state JSONB DEFAULT '{"fastingHours": 16, "eatingHours": 8, "activeFastStart": null, "lastFastEnd": null}'::JSONB;

ALTER TABLE public.health_logs
ADD COLUMN IF NOT EXISTS fasting_duration NUMERIC;
