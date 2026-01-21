import { useEffect, useState } from 'react';
import { Loader2, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  activeCourses: number;
  totalCourses: number;
}

interface GeneratedCourse {
  title: string;
  description: string;
  modules: Array<{
    title: string;
    description: string;
    lessons: Array<{
      title: string;
      estimatedDurationMinutes: number;
    }>;
  }>;
}

interface HomePageProps {
  onSelectCourse: (courseId: string) => void;
}

export function HomePage({ onSelectCourse }: HomePageProps) {
  const { user } = useAuth();
  const [, setStats] = useState<ProgressStats>({
    totalLessons: 0,
    completedLessons: 0,
    activeCourses: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHomeData();
  }, [user]);

  const loadHomeData = async () => {
    if (!user) return;

    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      const totalCourses = coursesData?.length || 0;
      const activeCourses = coursesData?.filter((c: any) => c.status === 'active').length || 0;

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('completed')
        .eq('user_id', user.id);

      const completedLessons = progressData?.filter((p: any) => p.completed).length || 0;
      const totalLessons = progressData?.length || 0;

      setStats({
        totalLessons,
        completedLessons,
        activeCourses,
        totalCourses,
      });
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!goal.trim()) {
      setError('Please describe what you want to learn');
      return;
    }

    setCreating(true);

    try {
      // Get the user's session token (JWT)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to create a course');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-course`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate course';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let courseData: GeneratedCourse;
      try {
        courseData = await response.json();
      } catch (err) {
        throw new Error('Invalid response from server');
      }

      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          user_id: user!.id,
          title: courseData.title,
          description: courseData.description,
          goal: goal,
          status: 'active',
          total_modules: courseData.modules.length,
        } as any)
        .select()
        .single();

      if (courseError) throw courseError;

      for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
        const moduleData = courseData.modules[moduleIndex];

        const { data: module, error: moduleError } = await supabase
          .from('modules')
          .insert({
            course_id: (course as any).id,
            title: moduleData.title,
            description: moduleData.description,
            order_index: moduleIndex,
          } as any)
          .select()
          .single();

        if (moduleError) throw moduleError;

        for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
          const lessonData = moduleData.lessons[lessonIndex];

          const { error: lessonError } = await supabase
            .from('lessons')
            .insert({
              module_id: (module as any).id,
              title: lessonData.title,
              content: null,
              content_generated: false,
              order_index: lessonIndex,
              estimated_duration_minutes: lessonData.estimatedDurationMinutes || 15,
            } as any);

          if (lessonError) throw lessonError;
        }
      }

      setGoal('');
      onSelectCourse((course as any).id);
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.message || 'Failed to create course. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center pt-12 min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center pt-20">
          <h2 className="text-4xl font-bold mb-3 text-gray-900">
            What will you <span className="italic text-blue-600">learn</span> today?
          </h2>
          <p className="text-gray-600 text-xl">
            Create courses with <span className="text-blue-600 font-semibold">AI</span>
          </p>
        </div>

        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-200">
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
                placeholder="Let's learn conversational Japanese"
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base resize-none min-h-[120px]"
                rows={6}
                disabled={creating}
              />
            </div>
            <div className="p-3 flex items-center justify-end bg-white">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create now</span>
                    <Play className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {creating && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
              <p className="text-sm text-center text-blue-700">
                AI is creating your personalized course. This may take 30-60 seconds...
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
