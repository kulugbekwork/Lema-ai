import { useState } from 'react';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      // Show more detailed error messages
      if (error.message) {
        setError(error.message);
      } else if (error.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (error.status === 400) {
        setError('Invalid email address. Please check and try again.');
      } else {
        setError('Failed to send reset email. Please check your email address and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <button
            onClick={onBackToLogin}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to login</span>
          </button>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
                <p className="text-gray-600">
                  No worries, we'll send you reset instructions.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Reset password'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Check your email</h1>
                <p className="text-gray-600">
                  We sent a password reset link to{' '}
                  <span className="font-medium text-gray-900">{email}</span>
                </p>
              </div>

              <button
                onClick={onBackToLogin}
                className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
              >
                Back to login
              </button>

              <p className="text-sm text-gray-600 text-center mt-6">
                Didn't receive the email?{' '}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setError('');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Click to resend
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 p-4">
        <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl items-center justify-center overflow-hidden flex">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/10 rounded-3xl rotate-12"></div>
            <div className="absolute bottom-32 right-32 w-48 h-48 border border-white/10 rounded-3xl -rotate-12"></div>
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/20 rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/20 rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white/20 rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-xl text-center px-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl mb-8">
              <GraduationCap className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Master Any Subject with AI
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Get personalized learning paths, AI-generated courses, and expert tutoring.
              Transform your learning journey with intelligent guidance every step of the way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
