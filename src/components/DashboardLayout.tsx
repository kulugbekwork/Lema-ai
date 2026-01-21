import { useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { HomePage } from '../pages/HomePage';
import { CourseView } from '../pages/CourseView';
import { ProfilePage } from '../pages/ProfilePage';

type Page = 'home' | 'profile';

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const goHome = () => {
    setSelectedCourseId(null);
    setCurrentPage('home');
  };

  const goProfile = () => {
    setSelectedCourseId(null);
    setCurrentPage('profile');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (selectedCourseId) {
    return <CourseView courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

              <button
                type="button"
                onClick={handleSignOut}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={goHome}
                className="focus:outline-none"
              >
                <span className="text-lg font-bold text-gray-900 hidden sm:inline">LEMA AI</span>
              </button>

              <button
                type="button"
                onClick={goProfile}
                className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-200"
                title="Profile"
              >
                <span className="text-sm font-bold text-blue-600">
                  {(user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                </span>
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        {currentPage === 'home' && <HomePage onSelectCourse={setSelectedCourseId} />}
        {currentPage === 'profile' && <ProfilePage onSelectCourse={setSelectedCourseId} />}
      </main>
    </div>
  );
}
