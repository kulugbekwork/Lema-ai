import { useState } from 'react';
import { Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function PremiumPage() {
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>('');

  const plans = [
    {
      name: 'Monthly',
      price: '$9.99',
      period: 'per month',
    },
    {
      name: 'Yearly',
      price: '$79.99',
      period: 'per year',
      savings: 'Save 33%',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Go Premium. Create Unlimited Courses.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Free plan allows 1 course. Premium unlocks unlimited AI course generation.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-6 sm:p-8 shadow-sm"
            >
              {plan.savings && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {plan.savings}
                  </span>
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-1">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">{plan.price}</span>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">{plan.period}</p>
              </div>
              <button
                className="w-full py-3 rounded-lg font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700"
                disabled={Boolean(upgrading)}
                onClick={async () => {
                  // Temporary "mock upgrade" until payments are integrated:
                  // mark the user as premium so they can generate unlimited courses.
                  if (!user) return;
                  setNotice('');
                  setUpgrading(plan.name);
                  try {
                    const { error } = await (supabase.from('profiles') as any)
                      .update({ is_premium: true, updated_at: new Date().toISOString() })
                      .eq('id', user.id);
                    if (error) throw error;
                    setNotice('Premium activated! You can now create unlimited courses.');
                  } catch (e: any) {
                    console.error('Failed to activate premium:', e);
                    setNotice(e?.message || 'Failed to activate premium. Please try again.');
                  } finally {
                    setUpgrading(null);
                  }
                }}
              >
                {upgrading === plan.name ? 'Upgrading...' : `Choose ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {notice && (
          <div className={`max-w-4xl mx-auto mb-8 sm:mb-10 rounded-lg p-3 border ${
            notice.toLowerCase().includes('failed')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <p className="text-sm text-center">{notice}</p>
          </div>
        )}
      </main>
    </div>
  );
}
