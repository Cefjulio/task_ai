-- Daily reminder (goals & plans) + daily study picks: remembers which reminders you've acknowledged,
-- today's two study picks and any snooze, so it all carries across reloads and devices.
-- Stored as one JSON value on the existing settings row. Run once in the Supabase SQL editor.
-- Safe to re-run.

ALTER TABLE public.settings
    ADD COLUMN IF NOT EXISTS daily_state JSONB;

-- The existing policies on public.settings already cover the new column.
