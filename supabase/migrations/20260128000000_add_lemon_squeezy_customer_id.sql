/*
  # Add Lemon Squeezy Customer ID and Subscription ID to Profiles

  Adds `lemon_squeezy_customer_id` and `lemon_squeezy_subscription_id` to `profiles` so users can manage their subscription.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'lemon_squeezy_customer_id'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN lemon_squeezy_customer_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'lemon_squeezy_subscription_id'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN lemon_squeezy_subscription_id text;
  END IF;
END $$;
