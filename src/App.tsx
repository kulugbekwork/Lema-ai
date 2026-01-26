import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardLayout } from './components/DashboardLayout';
import { supabase } from './lib/supabase';

type AuthView = 'landing' | 'login' | 'signup' | 'forgot-password' | 'reset-password';

function App() {
  const { user, loading, session } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [checkingReset, setCheckingReset] = useState(true);

  useEffect(() => {
    // Check if URL contains password reset token
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    if (type === 'recovery' && accessToken) {
      // User clicked password reset link - Supabase will automatically process this
      // Wait a moment for Supabase to process the hash
      setTimeout(() => {
        setAuthView('reset-password');
        setCheckingReset(false);
      }, 500);
    } else {
      setCheckingReset(false);
    }
  }, []);

  if (loading || checkingReset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show reset password page if user has recovery session (clicked reset link)
  if (authView === 'reset-password') {
    return (
      <ResetPasswordPage
        onSuccess={() => {
          // Clear hash and redirect to login
          window.history.replaceState(null, '', window.location.pathname);
          setAuthView('login');
        }}
      />
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
