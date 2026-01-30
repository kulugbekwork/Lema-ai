import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface SignUpPageProps {
  onBackToLogin: () => void;
}

export function SignUpPage({ onBackToLogin }: SignUpPageProps) {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
      setError(error instanceof Error ? error.message : "Failed to sign in with Google");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUpWithEmail(email, password, fullName);
    } catch (error) {
      console.error("Error signing up:", error);
      setError(error instanceof Error ? error.message : "Failed to create account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign up</h1>
            <p className="text-gray-600">Create your account to get started.</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-gray-300 text-gray-700 rounded-lg px-6 py-3 font-normal hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

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

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white rounded-lg px-6 py-3 font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Continue"}
              </button>
            </form>

            <p className="text-sm text-gray-600 text-center mt-6">
              Already have an account?{" "}
              <button
                onClick={onBackToLogin}
                className="text-gray-900 font-semibold hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
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
              Learn Faster with AI Generated Courses
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Stop searching for resources. Lema AI builds clear, step-by-step
              courses so you can focus on learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
