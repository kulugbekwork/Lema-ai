-- Add permanent course creation counter to profiles
-- This tracks total courses ever created, not current courses
-- Used to enforce free plan limits

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'total_courses_created'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN total_courses_created integer NOT NULL DEFAULT 0;
  END IF;
END $$;
