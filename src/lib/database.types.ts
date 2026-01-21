export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          goal: string
          status: 'draft' | 'active' | 'completed'
          total_modules: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          goal: string
          status?: 'draft' | 'active' | 'completed'
          total_modules?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          goal?: string
          status?: 'draft' | 'active' | 'completed'
          total_modules?: number
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          order_index?: number
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          content: string | null
          content_generated: boolean
          order_index: number
          estimated_duration_minutes: number
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          content?: string | null
          content_generated?: boolean
          order_index: number
          estimated_duration_minutes?: number
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          content?: string | null
          content_generated?: boolean
          order_index?: number
          estimated_duration_minutes?: number
          created_at?: string
        }
      }
      lesson_slides: {
        Row: {
          id: string
          lesson_id: string
          slide_number: number
          title: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          slide_number: number
          title: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          slide_number?: number
          title?: string
          content?: string
          created_at?: string
        }
      }
      lesson_questions: {
        Row: {
          id: string
          lesson_id: string
          slide_number: number
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: 'a' | 'b' | 'c' | 'd'
          explanation: string
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          slide_number: number
          question_text: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_answer: 'a' | 'b' | 'c' | 'd'
          explanation: string
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          slide_number?: number
          question_text?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          correct_answer?: 'a' | 'b' | 'c' | 'd'
          explanation?: string
          created_at?: string
        }
      }
      user_lesson_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          selected_answer: 'a' | 'b' | 'c' | 'd'
          is_correct: boolean
          answered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          selected_answer: 'a' | 'b' | 'c' | 'd'
          is_correct: boolean
          answered_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          selected_answer?: 'a' | 'b' | 'c' | 'd'
          is_correct?: boolean
          answered_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          completed_at: string | null
          last_accessed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          completed_at?: string | null
          last_accessed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          completed_at?: string | null
          last_accessed_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          lesson_id: string | null
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          lesson_id?: string | null
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          lesson_id?: string | null
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
      }
    }
  }
}
