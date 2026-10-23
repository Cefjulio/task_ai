-- LMS book bookmarks: remembers which lesson ("page") is bookmarked in each course ("book").
-- Run once in the Supabase SQL editor. Safe to re-run.

ALTER TABLE public.lms_courses
    ADD COLUMN IF NOT EXISTS bookmark_lesson_id UUID;

-- Deliberately no foreign key to lms_lessons: the two tables already reference each other
-- (lessons -> courses), and a circular key would make saving a new lesson + bookmark in one
-- go fail. The app clears the bookmark when its lesson is deleted and ignores stale ones.

-- The existing "Enable all for all users" policy on lms_courses already covers the new column.
