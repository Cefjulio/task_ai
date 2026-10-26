-- Daily Focus lane: remembers which tasks you picked as today's Focus (max 3 per day).
-- A task is "in Focus" on the day stored here, so the lane empties itself the next day.
-- Run once in the Supabase SQL editor. Safe to re-run.

ALTER TABLE public.tasks
    ADD COLUMN IF NOT EXISTS focus_date DATE;

-- Existing "all users" policies on public.tasks already cover the new column.
