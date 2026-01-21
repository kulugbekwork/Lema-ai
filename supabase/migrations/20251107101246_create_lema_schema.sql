/*
  # Lema AI Learning Platform Schema

  ## Overview
  Complete database schema for Lema AI - an AI-powered personalized learning platform
  with course generation, progress tracking, and AI tutoring capabilities.

  ## Tables Created

  ### 1. profiles
  - `id` (uuid, references auth.users) - User profile ID
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. courses
  - `id` (uuid, primary key) - Course unique identifier
  - `user_id` (uuid, references profiles) - Course owner
  - `title` (text) - Course title (e.g., "Learn Japanese N5")
  - `description` (text) - Course description
  - `goal` (text) - Original user goal/input
  - `status` (text) - Course status: draft, active, completed
  - `total_modules` (int) - Number of modules in course
  - `created_at` (timestamptz) - Course creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. modules
  - `id` (uuid, primary key) - Module unique identifier
  - `course_id` (uuid, references courses) - Parent course
  - `title` (text) - Module title
  - `description` (text) - Module description
  - `order_index` (int) - Display order within course
  - `created_at` (timestamptz) - Module creation timestamp

  ### 4. lessons
  - `id` (uuid, primary key) - Lesson unique identifier
  - `module_id` (uuid, references modules) - Parent module
  - `title` (text) - Lesson title
  - `content` (text) - Lesson content (markdown format)
  - `order_index` (int) - Display order within module
  - `estimated_duration_minutes` (int) - Estimated time to complete
  - `created_at` (timestamptz) - Lesson creation timestamp

  ### 5. user_progress
  - `id` (uuid, primary key) - Progress record identifier
  - `user_id` (uuid, references profiles) - User
  - `lesson_id` (uuid, references lessons) - Lesson
  - `completed` (boolean) - Completion status
  - `completed_at` (timestamptz, nullable) - Completion timestamp
  - `last_accessed_at` (timestamptz) - Last access timestamp
  - Unique constraint on (user_id, lesson_id)

  ### 6. chat_messages
  - `id` (uuid, primary key) - Message unique identifier
  - `user_id` (uuid, references profiles) - Message sender
  - `course_id` (uuid, references courses, nullable) - Related course context
  - `lesson_id` (uuid, references lessons, nullable) - Related lesson context
  - `role` (text) - Message role: user or assistant
  - `content` (text) - Message content
  - `created_at` (timestamptz) - Message timestamp

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access their own data
  - Policies enforce user ownership through auth.uid()
  - Separate policies for SELECT, INSERT, UPDATE, DELETE operations

  ### RLS Policies
  Each table has restrictive policies that:
  - Verify user authentication
  - Check ownership via user_id or related course ownership
  - Prevent unauthorized access to other users' data

  ## Important Notes
  - All timestamps use timestamptz for timezone awareness
  - UUIDs are used for all primary keys with gen_random_uuid()
  - Foreign keys use ON DELETE CASCADE for data integrity
  - Default values are set for booleans and timestamps
  - Indexes are created on foreign keys for query performance
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  goal text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  total_modules int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own courses"
  ON courses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses"
  ON courses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index int NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view modules of own courses"
  ON modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert modules for own courses"
  ON modules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update modules of own courses"
  ON modules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete modules of own courses"
  ON modules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  order_index int NOT NULL,
  estimated_duration_minutes int DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lessons of own courses"
  ON lessons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lessons for own courses"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update lessons of own courses"
  ON lessons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND courses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete lessons of own courses"
  ON lessons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM modules
      JOIN courses ON courses.id = modules.course_id
      WHERE modules.id = lessons.module_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  last_accessed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON user_progress(lesson_id);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_course_id ON chat_messages(course_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_lesson_id ON chat_messages(lesson_id);