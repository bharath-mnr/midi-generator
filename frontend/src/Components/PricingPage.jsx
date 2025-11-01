// frontend/src/Components/PricingPage.jsx
import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';
import axiosInstance from '../services/axiosConfig'; // Use axiosInstance

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTier, setCurrentTier] = useState(null);

  useEffect(() => {
    fetchPricingPlans();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (user) {
      try {
        const userData = JSON.parse(user);
        setCurrentTier(userData.subscriptionTier);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  };

  const fetchPricingPlans = async () => {
    try {
      // ✅ UPDATED: Use axiosInstance
      const response = await axiosInstance.get('/pricing/plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Failed to fetch pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (!isLoggedIn) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    if (plan.tier === currentTier) {
      alert(`You are already on the ${plan.name} plan`);
      return;
    }

    if (plan.tier === 'FREE') {
      alert('Downgrade functionality would be here');
      return;
    }

    // TODO: Integrate payment gateway (Stripe, PayPal, etc.)
    alert(`Selected ${plan.name}. Payment integration coming soon!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">MIDI Generator</h1>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => window.location.href = '/Generator'}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Create Music
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => window.location.href = '/signup'}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            pricing plans
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the plan that fits your music creation needs. More generations = more creativity. That's it.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => {
            const isCurrentPlan = currentTier === plan.tier;
            const isRecommended = plan.recommended;

            return (
              <div
                key={plan.tier}
                className={`relative rounded-2xl overflow-hidden transition-all ${
                  isRecommended
                    ? 'ring-2 ring-gray-900 transform md:scale-105'
                    : ''
                } ${isCurrentPlan ? 'bg-gray-50' : 'bg-white'} shadow-lg hover:shadow-xl`}
              >
                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    RECOMMENDED
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-xs font-semibold rounded-br-lg">
                    YOUR PLAN
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className="mb-6">
                    {plan.tier === 'FREE' && (
                      <Zap className="w-8 h-8 text-blue-600" />
                    )}
                    {plan.tier === 'BASIC' && (
                      <Check className="w-8 h-8 text-green-600" />
                    )}
                    {plan.tier === 'PRO' && (
                      <Crown className="w-8 h-8 text-purple-600" />
                    )}
                    {plan.tier === 'UNLIMITED' && (
                      <Sparkles className="w-8 h-8 text-orange-600" />
                    )}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.monthlyPrice === 0 ? (
                      <div className="text-4xl font-bold text-gray-900">Free</div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900">${plan.monthlyPrice}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                    )}
                  </div>

                  {/* Main Feature - Generations */}
                  <div className="mb-6 pb-6 border-b-2 border-gray-100">
                    <div className="text-3xl font-bold text-gray-900">
                      {plan.unlimited ? '∞' : plan.dailyLimit}
                    </div>
                    <p className="text-gray-600 text-sm">
                      generations per day
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                        : isRecommended
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                    disabled={isCurrentPlan}
                  >
                    {isCurrentPlan ? (
                      <>
                        <Check className="w-5 h-5" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        Choose Plan
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        {!isLoggedIn && (
          <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Start Creating?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start with the Free plan and upgrade anytime as you create more music
            </p>
            <button
              onClick={() => window.location.href = '/signup'}
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default PricingPage;