import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    LemonSqueezy?: {
      Setup: () => void;
    };
  }
}

export function PremiumPage() {
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>('');

  const LEMON_SQUEEZY_MONTHLY_VARIANT_ID = import.meta.env.VITE_LEMON_SQUEEZY_MONTHLY_VARIANT_ID;

  useEffect(() => {
    if (!window.LemonSqueezy) {
      const script = document.createElement('script');
      script.src = 'https://assets.lemonsqueezy.com/lemon.js';
      script.async = true;
      script.onload = () => {
        if (window.LemonSqueezy) {
          window.LemonSqueezy.Setup();
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleCheckout = async (planName: string, productId?: string | null) => {
    if (!user) {
      setNotice('Please log in to upgrade.');
      return;
    }

    if (!productId) {
      setNotice('Payment system not configured. Please contact support.');
      return;
    }

    setNotice('');
    setUpgrading(planName);

    try {
      // Get user session token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('You must be logged in to upgrade.');
      }

      // Call our edge function to create checkout session
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          email: user.email || '',
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();

      if (!checkoutUrl) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to checkout
      window.location.href = checkoutUrl;
    } catch (e: unknown) {
      console.error('Failed to initiate checkout:', e);
      setNotice((e as Error).message || 'Failed to initiate checkout. Please try again.');
      setUpgrading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Go <span className="italic text-blue-600">Premium</span>. Create Up to 10 Courses.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            The free plan includes 1 course. Premium lets you create up to 10 courses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16 px-4 sm:px-0">
          {/* Free Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Basic</h4>
            <p className="text-sm text-gray-600 mb-4">Perfect for getting started</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Free</p>
            <button className="w-full bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm sm:text-base mb-6" disabled>
              Current Plan
            </button>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">✓ 1 AI-generated course</p>
              <p className="text-sm text-gray-700">✓ Structured lessons</p>
              <p className="text-sm text-gray-700">✓ Quizzes inside lessons</p>
            </div>
          </div>

          {/* Monthly Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-200 relative">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Premium</h4>
            <p className="text-sm text-gray-600 mb-4">For serious learners</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              $10
              <span className="text-lg text-gray-600 ml-1">/month</span>
            </p>
            <button
              className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base mb-6"
              disabled={Boolean(upgrading) || !LEMON_SQUEEZY_MONTHLY_VARIANT_ID}
              onClick={() => handleCheckout('Monthly', LEMON_SQUEEZY_MONTHLY_VARIANT_ID)}
            >
              {upgrading === 'Monthly' ? 'Redirecting...' : 'Upgrade to Premium'}
            </button>
            <div className="space-y-3">
              <p className="text-sm text-gray-700">✓ Up to 10 AI-generated courses</p>
              <p className="text-sm text-gray-700">✓ Regenerate courses anytime</p>
              <p className="text-sm text-gray-700">✓ Structured lessons for any topic</p>
              <p className="text-sm text-gray-700">✓ Quizzes included in lessons</p>
            </div>
          </div>
        </div>

        {notice && (
          <div
            className={`max-w-4xl mx-auto mb-8 sm:mb-10 rounded-lg p-3 border ${
              notice.toLowerCase().includes('failed')
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <p className="text-sm text-center">{notice}</p>
          </div>
        )}
      </main>
    </div>
  );
}
