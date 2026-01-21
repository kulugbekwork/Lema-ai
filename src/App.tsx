import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardLayout } from './components/DashboardLayout';

type AuthView = 'landing' | 'login' | 'signup' | 'forgot-password';

function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'signup') {
      return <SignUpPage onBackToLogin={() => setAuthView('login')} />;
    }

    if (authView === 'forgot-password') {
      return <ForgotPasswordPage onBackToLogin={() => setAuthView('login')} />;
    }

    if (authView === 'login') {
      return (
        <LoginPage
          onForgotPassword={() => setAuthView('forgot-password')}
          onSignUp={() => setAuthView('signup')}
        />
      );
    }

    return (
      <LandingPage
        onGetStarted={() => setAuthView('signup')}
        onSignIn={() => setAuthView('login')}
      />
    );
  }

  return <DashboardLayout />;
}

export default App;
