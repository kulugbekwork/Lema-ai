import { Sparkles } from "lucide-react";
import { useRef } from "react";
import step1 from "../assets/landing-page/step-1.png";
import step2 from "../assets/landing-page/step-2.png";
import step3 from "../assets/landing-page/step-3.png";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={scrollToTop}>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                LEMA AI
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection(howItWorksRef)}
                className="text-gray-700 hover:text-gray-900 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="text-gray-700 hover:text-gray-900 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(pricingRef)}
                className="text-gray-700 hover:text-gray-900 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Pricing
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onSignIn}
                className="text-blue-600 font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base border-2 border-blue-600"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section ref={topRef} className="py-12 sm:py-16 lg:py-28 mt-20 mb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                AI-Powered Learning Platform
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4 sm:px-0">
                <span className="text-blue-600">Stop Searching. </span>
                Let AI Build a Complete Course for You.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto px-4 sm:px-0">
                Describe what you want to learn and Lema AI creates a complete,
                personalized course with lessons, slides, and quizzes in minutes
                — no research needed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
                <button
                  onClick={onGetStarted}
                  className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-base sm:text-lg w-full sm:w-auto"
                >
                  🚀 Create My Course
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-8">
                🎓 Built for students, self-learners, and busy people who want
                structure
              </p>
            </div>
          </div>
        </section>

        <section ref={howItWorksRef} className="py-16 sm:py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 sm:mb-24">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
                See How Lema AI Builds Your Course
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                From idea to structured lessons in minutes - powered by AI.
              </p>
            </div>

            {/* Feature 1: Text Left, Image Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center mb-16 sm:mb-24 lg:mb-32">
              <div className="px-0 sm:px-4">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold mb-4">
                  Step 1
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 sm:mb-6 leading-tight">
                  Start With a Simple Idea
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                  Just tell Lema AI what you want to learn in plain language. No
                  forms, no setup - describe your goal and let AI do the work.
                </p>
              </div>
              <div>
                <img
                  src={step1}
                  alt="Start With a Simple Idea"
                  className="rounded-2xl w-full h-72 sm:h-96 object-cover border-2 border-gray-300"
                />
              </div>
            </div>

            {/* Feature 2: Image Left, Text Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center mb-16 sm:mb-24 lg:mb-32">
              <div className="order-2 md:order-1">
                <img
                  src={step2}
                  alt="AI Creates a Structured Course for You"
                  className="rounded-2xl w-full h-72 sm:h-96 object-cover border-2 border-gray-300"
                />
              </div>
              <div className="px-0 sm:px-4 order-1 md:order-2">
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold mb-4">
                  Step 2
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 sm:mb-6 leading-tight">
                  AI Creates a Structured Course for You
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                  Lema AI instantly turns your idea into a complete course with
                  clear modules and lessons, organized step by step for easy
                  learning.
                </p>
              </div>
            </div>

            {/* Feature 3: Text Left, Image Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center">
              <div className="px-0 sm:px-4">
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold mb-4">
                  Step 3
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 sm:mb-6 leading-tight">
                  Learn With Clear Lessons and Progress Tracking
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                  Study focused lessons at your own pace, track your progress,
                  and move forward confidently — no distractions, no overwhelm.
                </p>
              </div>
              <div>
                <img
                  src={step3}
                  alt="Learn With Clear Lessons and Progress Tracking"
                  className="rounded-2xl w-full h-72 sm:h-96 object-cover border-2 border-gray-300"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4 sm:px-0">
                Learning Without vs With Lema AI
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                See how Lema AI transforms your learning experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
              <div className="bg-red-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-red-200">
                <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-4 sm:mb-6 text-center">
                  Without Lema AI
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-red-800">
                    Waste hours on YouTube, blogs, and random resources
                  </p>
                  <p className="text-sm sm:text-base text-red-800">
                    No clear structure — information everywhere
                  </p>
                  <p className="text-sm sm:text-base text-red-800">
                    Learn alone with no guidance or direction
                  </p>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-green-200">
                <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-4 sm:mb-6 text-center">
                  With Lema AI
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-green-800">
                    Get a complete course generated in minutes
                  </p>
                  <p className="text-sm sm:text-base text-green-800">
                    Clear, step-by-step lessons with quizzes
                  </p>
                  <p className="text-sm sm:text-base text-green-800">
                    Personalized learning based on your goals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={featuresRef} className="py-16 sm:py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-0 sm:mt-0 pt-0 sm:pt-0">
              <div className="text-center mb-12 sm:mb-16">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4 sm:px-0">
                  Everything You Need to Learn Smarter
                </h3>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                  Lema AI gives you structure, clarity, and progress - all in
                  one place.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-0 mb-12 sm:mb-16">
                <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border-2 border-blue-600">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    AI-Powered Content
                  </h4>
                  <p className="text-base text-gray-600">
                    Describe what you want to learn and Lema AI creates a full
                    course tailored to your goal - no planning required.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border-2 border-blue-600">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    Quizzes & Active Learning
                  </h4>
                  <p className="text-base text-gray-600">
                    Short quizzes help you test your knowledge and reinforce
                    what you’ve learned as you go.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border-2 border-blue-600">
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    Progress Tracking
                  </h4>
                  <p className="text-base text-gray-600">
                    Monitor your learning journey with detailed analytics and
                    insights into your progress and achievements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={pricingRef} className="py-16 sm:py-24 lg:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4 sm:px-0">
                Choose Your Plan
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0 mb-8">
                Choose the perfect plan for your learning goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Basic
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Perfect for getting started
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Free
                </p>
                <button className="w-full bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm sm:text-base mb-6">
                  Get Started
                </button>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">✓ 1 AI-generated course</p>
                  <p className="text-sm text-gray-700">✓ Structured lessons</p>
                  <p className="text-sm text-gray-700">✓ Quizzes inside lessons</p>
                </div>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200 relative">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Premium
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  For serious learners
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  $10
                  <span className="text-lg text-gray-600 ml-1">/month</span>
                </p>
                <button className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base mb-6">
                  Upgrade to Premium
                </button>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">✓ Unlimited AI-generated courses</p>
                  <p className="text-sm text-gray-700">✓ Regenerate courses anytime</p>
                  <p className="text-sm text-gray-700">✓ Structured lessons for any topic</p>
                  <p className="text-sm text-gray-700">✓ Quizzes included in lessons</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 lg:py-32 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Create Your First Course in Minutes
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Start for free. Describe what you want to learn and let Lema AI
              build the course for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <button
                onClick={onGetStarted}
                className="bg-white text-gray-900 px-8 sm:px-12 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-base sm:text-lg w-auto"
              >
                Create My First Course
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 sm:py-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="hidden md:flex items-center space-x-3">
              <span className="text-xl sm:text-2xl font-bold">LEMA AI</span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base text-center md:text-left">
              &copy; 2026 Lema AI. Created by{" "}
              <a
                href="https://x.com/kulugbek3"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors cursor-pointer"
              >
                Kamolxodjayev Ulug'bek
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
