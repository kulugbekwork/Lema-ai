import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

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
  onUpgrade?: () => void;
}

interface InsertBuilder<T> {
  insert(value: T): InsertResult;
}

interface InsertResult {
  select(): SelectResult;
}

interface SelectResult {
  single(): Promise<{
    data: Record<string, unknown> | null;
    error: Error | null;
  }>;
  insert(value: Record<string, unknown>): Promise<{ error: Error | null }>;
}

export function HomePage({ onSelectCourse, onUpgrade }: HomePageProps) {
  const { user } = useAuth();
  const [, setStats] = useState<ProgressStats>({
    totalLessons: 0,
    completedLessons: 0,
    activeCourses: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [courseCount, setCourseCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const loadHomeData = useCallback(async () => {
    if (!user) return;

    try {
      const [
        { data: coursesData },
        { data: profileData },
      ] = await Promise.all([
        supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("profiles")
          .select("is_premium, total_courses_created")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      const profile = profileData as unknown as { is_premium: boolean; total_courses_created: number };
      const totalCourses = coursesData?.length ?? 0;
      const activeCourses =
        (coursesData || []).filter(
          (c: Record<string, unknown>) => c.status === "active",
        ).length || 0;
      const premium = Boolean(profile?.is_premium ?? false);
      const totalCoursesCreated = profile?.total_courses_created ?? 0;
      setIsPremium(premium);
      setCourseCount(totalCoursesCreated);

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("completed")
        .eq("user_id", user.id);

      const completedLessons =
        progressData?.filter((p: Record<string, unknown>) => p.completed)
          .length || 0;
      const totalLessons = progressData?.length || 0;

      setStats({
        totalLessons,
        completedLessons,
        activeCourses,
        totalCourses,
      });
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData, user]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!goal.trim()) {
      setError("Please describe what you want to learn");
      return;
    }

    try {
      // Enforce free plan limit: 1 course total unless premium
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_premium, total_courses_created")
          .eq("id", user.id)
          .maybeSingle();

        const profile = profileData as unknown as { is_premium: boolean; total_courses_created: number };
        const premium = Boolean(profile?.is_premium ?? false);
        const totalCoursesCreated = profile?.total_courses_created ?? 0;
        setIsPremium(premium);
        setCourseCount(totalCoursesCreated);

        if (!premium && totalCoursesCreated >= 1) {
          setShowUpgradeModal(true);
          return;
        }
        if (premium && totalCoursesCreated >= 10) {
          setShowUpgradeModal(true);
          setError("You've reached your 10 course limit for the premium plan.");
          return;
        }
      }

      setCreating(true);

      // Get the user's session token (JWT)
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("You must be logged in to create a course");
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-course`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to generate course";
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
      } catch {
        throw new Error("Invalid response from server");
      }

      const { data: course, error: courseError } = await (
        supabase.from("courses") as unknown as InsertBuilder<
          Record<string, unknown>
        >
      )
        .insert({
          user_id: user!.id,
          title: courseData.title,
          description: courseData.description,
          goal: goal,
          status: "active",
          total_modules: courseData.modules.length,
        })
        .select()
        .single();

      if (courseError) throw courseError;

      for (
        let moduleIndex = 0;
        moduleIndex < courseData.modules.length;
        moduleIndex++
      ) {
        const moduleData = courseData.modules[moduleIndex];

        const { data: module, error: moduleError } = await (
          supabase.from("modules") as unknown as InsertBuilder<
            Record<string, unknown>
          >
        )
          .insert({
            course_id: (course as unknown as { id: string }).id,
            title: moduleData.title,
            description: moduleData.description,
            order_index: moduleIndex,
          })
          .select()
          .single();

        if (moduleError) throw moduleError;

        for (
          let lessonIndex = 0;
          lessonIndex < moduleData.lessons.length;
          lessonIndex++
        ) {
          const lessonData = moduleData.lessons[lessonIndex];

          const result = await ((
            supabase.from("lessons") as unknown as InsertBuilder<
              Record<string, unknown>
            >
          ).insert({
            module_id: (module as unknown as { id: string }).id,
            title: lessonData.title,
            content: null,
            content_generated: false,
            order_index: lessonIndex,
            estimated_duration_minutes:
              lessonData.estimatedDurationMinutes || 15,
          }) as unknown as Promise<{ error: Error | null }>);

          const lessonError = result.error;

          if (lessonError) throw lessonError;
        }
      }

      // Increment the permanent courses created counter
      await supabase
        .from("profiles")
        .update({ total_courses_created: (parseInt(courseCount.toString()) + 1) })
        .eq("id", user!.id);

      setGoal("");
      setCourseCount((c) => c + 1);
      onSelectCourse((course as unknown as { id: string }).id);
    } catch (err) {
      console.error("Error creating course:", err);
      setError(
        (err as Error).message || "Failed to create course. Please try again.",
      );
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
    <>
      <div className="flex items-start justify-center pt-4 sm:pt-6 min-h-[calc(100vh-8rem)] px-4 sm:px-0">
        <div className="w-full max-w-3xl min-h-[calc(100vh-8rem)] flex flex-col">
          <div className="space-y-6">
            <div className="text-center pt-12 sm:pt-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-900 px-4 sm:px-0 mt-20">
                What will you{" "}
                <span className="italic text-blue-600">learn</span> today?
              </h2>
              <p className="text-gray-600 text-lg sm:text-xl px-4 sm:px-0">
                Create courses with{" "}
                <span className="text-blue-600 font-semibold">AI</span>
              </p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-3 border-b border-gray-200">
                  <textarea
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      target.style.height = "auto";
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                    placeholder="Describe what you want to learn and your goals..."
                    className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm sm:text-base resize-none min-h-[120px]"
                    rows={6}
                    disabled={creating}
                  />
                </div>
                <div className="p-3 flex items-center justify-end bg-white">
                  <button
                    type={!isPremium && courseCount >= 1 ? "button" : "submit"}
                    onClick={() => {
                      if (!isPremium && courseCount >= 1) {
                        setShowUpgradeModal(true);
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium w-full sm:w-auto"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {!isPremium && courseCount >= 1
                            ? "Upgrade to generate more"
                            : "Generate Course"}
                        </span>
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
                    AI is creating your personalized course. This may take 30-60
                    seconds...
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              You’ve created your first course
            </h2>
            <p className="text-gray-600 text-base mb-6">
              That's the free plan. Upgrade to create up to 10 courses and keep
              learning without limits.
            </p>
            <button
              onClick={() => {
                setShowUpgradeModal(false);
                onUpgrade?.();
              }}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              Upgrade to Premium
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full mt-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-200 transition-colors font-semibold"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </>
  );
}
