/*
  # Add Lesson Slides and Quiz System

  ## Overview
  This migration adds support for slide-based lessons with quiz questions.
  Lessons now store only basic info, while detailed content is generated on-demand
  and stored as slides with associated quiz questions.

  ## Changes Made

  ### 1. Modified lessons table
  - Changed `content` column to nullable (content generated on first access)
  - Added `content_generated` boolean flag (default false)
  
  ### 2. New lesson_slides table
  - `id` (uuid, primary key) - Slide unique identifier
  - `lesson_id` (uuid, references lessons) - Parent lesson
  - `slide_number` (int) - Order of slide in lesson
  - `title` (text) - Slide title
  - `content` (text) - Slide content in markdown
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. New lesson_questions table
  - `id` (uuid, primary key) - Question unique identifier
  - `lesson_id` (uuid, references lessons) - Parent lesson
  - `slide_number` (int) - Which slide this question appears after
  - `question_text` (text) - The question
  - `option_a` (text) - First answer option
  - `option_b` (text) - Second answer option
  - `option_c` (text) - Third answer option
  - `option_d` (text) - Fourth answer option
  - `correct_answer` (text) - Correct option (a, b, c, or d)
  - `explanation` (text) - Explanation of correct answer
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. New user_lesson_answers table
  - `id` (uuid, primary key) - Answer record identifier
  - `user_id` (uuid, references profiles) - User who answered
  - `question_id` (uuid, references lesson_questions) - Question answered
  - `selected_answer` (text) - User's selected option (a, b, c, or d)
  - `is_correct` (boolean) - Whether answer was correct
  - `answered_at` (timestamptz) - When answered
  - Unique constraint on (user_id, question_id)

  ## Security
  - All new tables have RLS enabled
  - Users can only access slides/questions for their own courses
  - Users can only view/insert their own answers
*/

-- Modify lessons table to support on-demand content generation
DO $$
BEGIN
  -- Make content nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'content'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE lessons ALTER COLUMN content DROP NOT NULL;
  END IF;

  -- Add content_generated flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'content_generated'
  ) THEN
    ALTER TABLE lessons ADD COLUMN content_generated boolean DEFAULT false;
  END IF;
END $$;

-- Create lesson_slides table
CREATE TABLE IF NOT EXISTS lesson_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  slide_number int NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(lesson_id, slide_number)
);

ALTER TABLE lesson_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view slides of own courses"
  ON lesson_slides FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_slides.lesson_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert slides for own courses"
  ON lesson_slides FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_slides.lesson_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete slides of own courses"
  ON lesson_slides FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_slides.lesson_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_lesson_slides_lesson_id ON lesson_slides(lesson_id);

-- Create lesson_questions table
CREATE TABLE IF NOT EXISTS lesson_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  slide_number int NOT NULL,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions of own courses"
  ON lesson_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_questions.lesson_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert questions for own courses"
  ON lesson_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_questions.lesson_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions of own courses"
  ON lesson_questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      JOIN modules ON modules.id = lessons.module_id
      JOIN courses ON courses.id = modules.course_id
      WHERE lessons.id = lesson_questions.lesson_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_lesson_questions_lesson_id ON lesson_questions(lesson_id);

-- Create user_lesson_answers table
CREATE TABLE IF NOT EXISTS user_lesson_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES lesson_questions(id) ON DELETE CASCADE,
  selected_answer text NOT NULL CHECK (selected_answer IN ('a', 'b', 'c', 'd')),
  is_correct boolean NOT NULL,
  answered_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE user_lesson_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own answers"
  ON user_lesson_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON user_lesson_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers"
  ON user_lesson_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_lesson_answers_user_id ON user_lesson_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_answers_question_id ON user_lesson_answers(question_id);