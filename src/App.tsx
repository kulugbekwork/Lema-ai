import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardLayout } from './components/DashboardLayout';

function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingReset, setCheckingReset] = useState(true);

  useEffect(() => {
    // Check if URL contains password reset token in search params
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get('type');

    if (type === 'recovery') {
      setCheckingReset(false);
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

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onForgotPassword={() => navigate('/forgot-password')} onSignUp={() => navigate('/signup')} />} />
        <Route path="/signup" element={<SignUpPage onBackToLogin={() => navigate('/login')} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage onBackToLogin={() => navigate('/login')} />} />
        <Route path="/reset-password" element={<ResetPasswordPage onSuccess={() => navigate('/login')} />} />
        <Route path="/" element={<LandingPage onGetStarted={() => navigate('/signup')} onSignIn={() => navigate('/login')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<DashboardLayout />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
