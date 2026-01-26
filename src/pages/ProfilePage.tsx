import { useEffect, useState, useRef } from 'react';
import { User, BookOpen, Globe, MoreVertical, Trash2, Edit2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserStats {
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  total_modules: number;
}

interface ProfilePageProps {
  onSelectCourse: (courseId: string) => void;
}

export function ProfilePage({ onSelectCourse }: ProfilePageProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalCourses: 0,
    activeCourses: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingCourseId, setRenamingCourseId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const totalCourses = coursesData?.length || 0;
      const activeCourses = coursesData?.filter((c: any) => c.status === 'active').length || 0;
      const completedCourses = coursesData?.filter((c: any) => c.status === 'completed').length || 0;

      setCourses(coursesData || []);

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('completed')
        .eq('user_id', user.id);

      const totalLessons = progressData?.length || 0;
      const completedLessons = progressData?.filter((p: any) => p.completed).length || 0;

      setStats({
        totalCourses,
        activeCourses,
        completedCourses,
        totalLessons,
        completedLessons,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      // Remove from local state
      setCourses(courses.filter(c => c.id !== courseId));
      setStats(prev => ({ ...prev, totalCourses: prev.totalCourses - 1 }));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const handleRenameCourse = async (courseId: string) => {
    if (!renameValue.trim()) {
      setRenamingCourseId(null);
      setRenameValue('');
      return;
    }

    try {
      const { error } = await (supabase.from('courses') as any)
        .update({ title: renameValue.trim() })
        .eq('id', courseId);

      if (error) throw error;

      // Update local state
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, title: renameValue.trim() } : c
      ));
      setRenamingCourseId(null);
      setRenameValue('');
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error renaming course:', error);
      alert('Failed to rename course. Please try again.');
    }
  };

  const startRename = (course: Course) => {
    setRenamingCourseId(course.id);
    setRenameValue(course.title);
    setOpenMenuId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="px-4 sm:px-6 pt-2 pb-6">
      <div className="flex flex-col lg:flex-row gap-6 h-full max-w-7xl mx-auto">
        {/* Left Sidebar - Profile Info */}
        <div className="w-full lg:w-96 flex-shrink-0 space-y-4">
        {/* Profile Section */}
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-3xl sm:text-4xl font-bold text-gray-600">
                {(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
              </span>
          </div>
        </div>

          {/* NAME Card */}
          <div className="bg-gray-50 rounded-md p-4 mb-3">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">NAME</p>
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
            </div>
              </div>

          {/* EMAIL Card */}
          <div className="bg-gray-50 rounded-md p-4 mb-3">
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">EMAIL</p>
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Courses Created Card */}
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Courses Created</p>
                <p className="text-sm font-medium text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - My Courses */}
      <div className="flex-1 w-full">
        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">My Courses</h1>
          <div className="w-full h-px bg-gray-200 mb-6"></div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600">Create your first course to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => {
                const isRenaming = renamingCourseId === course.id;
                return (
                  <div
                    key={course.id}
                    className="w-full bg-gray-50 rounded-md p-4 sm:p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                        {isRenaming ? (
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleRenameCourse(course.id);
                                } else if (e.key === 'Escape') {
                                  setRenamingCourseId(null);
                                  setRenameValue('');
                                }
                              }}
                              className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-base sm:text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRenameCourse(course.id)}
                              className="p-1 text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRenamingCourseId(null);
                                setRenameValue('');
                              }}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
          </div>
                        ) : (
                          <h3
                            onClick={() => onSelectCourse(course.id)}
                            className="text-base sm:text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors break-words"
                          >
                            {course.title}
                          </h3>
                        )}
              </div>
                      {!isRenaming && (
                        <div className="relative flex-shrink-0" ref={openMenuId === course.id ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === course.id ? null : course.id);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openMenuId === course.id && (
                            <div className="absolute right-0 top-8 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startRename(course);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCourse(course.id);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
            </div>
                          )}
              </div>
                      )}
            </div>
                    {course.description && !isRenaming && (
                      <p className="text-sm text-gray-500 ml-6 mt-2 break-words">{course.description}</p>
                    )}
              </div>
                );
              })}
            </div>
          )}
            </div>
          </div>
        </div>
    </div>
  );
}





