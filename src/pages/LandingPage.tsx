import { Sparkles, BookOpen, Zap, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-gray-900">LEMA AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onSignIn}
                className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-8">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Learning Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Master Any Subject with
                <span className="text-blue-600"> AI-Generated</span> Courses
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
                Transform your learning journey with personalized courses created by AI.
                Get interactive lessons with slides and quizzes to master any subject.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={onGetStarted}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl text-lg"
                >
                  Start Learning
                </button>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Course Generation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Describe what you want to learn and our AI creates a complete personalized course with modules and lessons.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Lessons</h3>
                <p className="text-gray-600 leading-relaxed">
                  Learn through engaging slides and test your knowledge with quizzes throughout each lesson.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get started with your personalized learning journey in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Describe Your Goal</h3>
                <p className="text-gray-600">
                  Tell us what you want to learn and your current skill level
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Creates Your Course</h3>
                <p className="text-gray-600">
                  Our AI generates a complete course tailored to your needs
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Start Learning</h3>
                <p className="text-gray-600">
                  Learn at your own pace with interactive lessons and quizzes
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Why Choose Lema AI?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  The smartest way to learn anything. Powered by cutting-edge AI technology.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Personalized Learning Paths</h4>
                      <p className="text-gray-600">Courses adapted to your goals and learning style</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Learn Anything</h4>
                      <p className="text-gray-600">From programming to languages, business to arts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Always Available</h4>
                      <p className="text-gray-600">Learn at your own pace, anytime, anywhere</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-12 text-white">
                  <div className="absolute top-8 right-8 w-24 h-24 border-2 border-white/20 rounded-3xl rotate-12"></div>
                  <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-white/20 rounded-2xl -rotate-12"></div>
                  <Zap className="w-16 h-16 mb-8" />
                  <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h3>
                  <p className="text-blue-100 mb-8 text-lg">
                    Join thousands of learners mastering new skills with AI-powered courses.
                  </p>
                  <button
                    onClick={onGetStarted}
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <span className="text-2xl font-bold">LEMA AI</span>
            </div>
            <p className="text-gray-400">
              &copy; 2025 Lema AI. Created by Kamolxodjayev Ulug'bek
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
