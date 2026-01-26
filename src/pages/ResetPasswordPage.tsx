import { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ResetPasswordPageProps {
  onSuccess: () => void;
}

export function ResetPasswordPage({ onSuccess }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid recovery session (user clicked the reset link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Try to get session again after a short delay (Supabase might still be processing)
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        }, 1000);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex">
        <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-12">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Updated!</h1>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. Redirecting to login...
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 p-4">
          <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl items-center justify-center overflow-hidden flex">
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-32 h-32 border border-white/10 rounded-3xl rotate-12"></div>
              <div className="absolute bottom-32 right-32 w-48 h-48 border border-white/10 rounded-3xl -rotate-12"></div>
            </div>
            <div className="relative z-10 max-w-xl text-center px-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl mb-8">
                <GraduationCap className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome Back!
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Your password has been reset. You can now sign in with your new password.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">
              Enter your new password below.
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
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
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
              Reset Your Password
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Choose a strong password to secure your account. Make sure it's at least 6 characters long.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
