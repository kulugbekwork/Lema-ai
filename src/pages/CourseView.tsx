import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LessonView } from './LessonView';

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
  estimated_duration_minutes: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
}

interface Progress {
  lesson_id: string;
  completed: boolean;
}

interface CourseViewProps {
  courseId: string;
  onBack: () => void;
}

export function CourseView({ courseId, onBack }: CourseViewProps) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', (modulesData || []).map((m: any) => m.id))
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lesson_id, completed')
        .eq('user_id', user!.id)
        .in('lesson_id', (lessonsData || []).map((l: any) => l.id));

      setProgress(progressData || []);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getModuleLessons = (moduleId: string) => {
    return lessons.filter(l => l.module_id === moduleId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Course not found</p>
          <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (selectedLessonId) {
    return (
      <LessonView
        lessonId={selectedLessonId}
        onBack={() => {
          setSelectedLessonId(null);
          loadCourseData();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-blue-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white mb-6 sm:mb-8">
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 break-words">{course.title}</h1>
            {course.description && (
              <p className="text-blue-100 text-base sm:text-lg break-words">{course.description}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {modules.map((module) => {
            const moduleLessons = getModuleLessons(module.id);

            return (
              <div key={module.id} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">{module.title}</h3>
                      {module.description && (
                        <p className="text-sm sm:text-base text-gray-600 break-words">{module.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    {moduleLessons.map((lesson, lessonIndex) => {
                      const completed = isLessonCompleted(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="text-left min-w-0 flex-1">
                              <div className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors break-words">
                                {lessonIndex + 1}. {lesson.title}
                              </div>
                            </div>
                          </div>
                          <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity text-sm sm:text-base flex-shrink-0 ml-2 hidden sm:inline">
                            Start →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
