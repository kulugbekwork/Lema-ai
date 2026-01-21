import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SlideViewer } from '../components/SlideViewer';

interface Lesson {
  id: string;
  title: string;
  estimated_duration_minutes: number;
}

interface Module {
  title: string;
  description: string;
}

interface Course {
  title: string;
  description: string;
}

interface LessonViewProps {
  lessonId: string;
  onBack: () => void;
}

export function LessonView({ lessonId, onBack }: LessonViewProps) {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('id, title, estimated_duration_minutes, module_id')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      const { data: moduleData } = await supabase
        .from('modules')
        .select('title, description, course_id')
        .eq('id', (lessonData as any).module_id)
        .single();

      if (moduleData) {
        setModule(moduleData);

        const { data: courseData } = await supabase
          .from('courses')
          .select('title, description')
          .eq('id', (moduleData as any).course_id)
          .single();

        if (courseData) {
          setCourse(courseData);
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: user!.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
        } as any, {
          onConflict: 'user_id,lesson_id',
        });

      onBack();
    } catch (error) {
      console.error('Error marking complete:', error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !course || !module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lesson not found</p>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <SlideViewer
      lessonId={lessonId}
      lessonTitle={lesson.title}
      courseContext={`Course: ${course.title} - ${course.description}`}
      moduleContext={`Module: ${module.title} - ${module.description}`}
      estimatedDuration={lesson.estimated_duration_minutes}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
