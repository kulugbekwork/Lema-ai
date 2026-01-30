/*
  # Add Premium Flag to Profiles

  Adds `is_premium` to `profiles` so the app can enforce free-plan limits and unlock premium features.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN is_premium boolean NOT NULL DEFAULT false;
  END IF;
END $$;

