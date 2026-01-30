import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { HomePage } from '../pages/HomePage';
import { CourseView } from '../pages/CourseView';
import { ProfilePage } from '../pages/ProfilePage';
import { PremiumPage } from '../pages/PremiumPage';

type Page = 'home' | 'profile' | 'premium';

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Determine current page from URL
  const getCurrentPage = (): Page => {
    const pathname = location.pathname;
    if (pathname.startsWith('/course/')) {
      return 'home'; // Course view is part of home
    }
    if (pathname === '/profile') return 'profile';
    if (pathname === '/premium') return 'premium';
    return 'home';
  };

  const currentPage = getCurrentPage();

  // Extract course ID from URL if viewing a course
  useEffect(() => {
    const pathname = location.pathname;
    const courseMatch = pathname.match(/^\/course\/(.+)$/);
    if (courseMatch) {
      setSelectedCourseId(courseMatch[1]);
    } else {
      setSelectedCourseId(null);
    }
  }, [location.pathname]);

  const goHome = () => {
    navigate('/home');
  };

  const goProfile = () => {
    navigate('/profile');
  };

  const goPremium = () => {
    navigate('/premium');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      alert('Failed to log out. Please try again.');
    }
  };

  const handleFeedback = () => {
    window.open('https://insigh.to/b/lema-ai', '_blank');
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    navigate(`/course/${courseId}`);
  };

  const handleBackFromCourse = () => {
    setSelectedCourseId(null);
    navigate('/home');
  };

  if (selectedCourseId) {
    return <CourseView courseId={selectedCourseId} onBack={handleBackFromCourse} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {currentPage === 'profile' ? (
            <>
              <button
                type="button"
                onClick={goHome}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </button>

              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={handleFeedback}
                  className="bg-transparent text-black border border-gray-300 px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-50"
                >
                  Feedback
                </button>
                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : currentPage === 'premium' ? (
            <>
              <button
                type="button"
                onClick={goHome}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goHome}
                className="focus:outline-none"
              >
                <span className="text-base sm:text-lg font-bold text-gray-900">LEMA AI</span>
              </button>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  type="button"
                  onClick={goProfile}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-200"
                  title="Profile"
                >
                  <span className="text-xs sm:text-sm font-bold text-blue-600">
                    {(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        {currentPage === 'home' && <HomePage onSelectCourse={handleSelectCourse} onUpgrade={goPremium} />}
        {currentPage === 'profile' && <ProfilePage onSelectCourse={handleSelectCourse} onUpgrade={goPremium} />}
        {currentPage === 'premium' && <PremiumPage />}
      </main>
    </div>
  );
}
