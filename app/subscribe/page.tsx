'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { getSubscription, Subscription } from '@/lib/subscriptions';

// ── Plan definitions ─────────────────────────────────────────────────────────
const PLANS = [
  {
    key:      'monthly',
    label:    'Monthly',
    months:   1,
    amount:   250,
    perMonth: 250,
    saving:   null,
    badge:    null,
  },
  {
    key:      '3months',
    label:    '3 Months',
    months:   3,
    amount:   700,
    perMonth: Math.round(700 / 3),
    saving:   50,
    badge:    null,
  },
  {
    key:      '6months',
    label:    '6 Months',
    months:   6,
    amount:   1300,
    perMonth: Math.round(1300 / 6),
    saving:   200,
    badge:    'Best Value',
  },
  {
    key:      '12months',
    label:    '12 Months',
    months:   12,
    amount:   2400,
    perMonth: 200,
    saving:   600,
    badge:    null,
  },
] as const;

type PlanKey = typeof PLANS[number]['key'];

const FEATURES = [
  'Unlimited programmes',
  'QR codes for all programmes',
  'Advanced analytics',
  'Priority support',
  'Custom branding',
];

export default function SubscribePage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [paying, setPaying]       = useState(false);
  const [error, setError]         = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('6months');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setUserEmail(user.email ?? '');
      const sub = await getSubscription(user.id);
      setSubscription(sub);
      setLoading(false);
    }
    load();
  }, []);

  async function handlePay() {
    if (!userId) return;
    const plan = PLANS.find((p) => p.key === selectedPlan)!;
    setPaying(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-ozow-payment', {
        body: { userId, userEmail, amount: plan.amount, months: plan.months },
      });
      if (fnError) throw new Error(fnError.message);
      if (!data?.url) throw new Error('No payment URL returned.');
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start payment. Please try again.');
      setPaying(false);
    }
  }

  function StatusBadge() {
    if (!subscription) return null;
    const { status, trialEndsAt, currentPeriodEnd } = subscription;
    if (status === 'trial') {
      const daysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000));
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
          <strong>Free Trial Active</strong> — {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
        </div>
      );
    }
    if (status === 'pending_payment') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 flex-shrink-0" />
          <span><strong>Payment Pending</strong> — Waiting for confirmation from Ozow. This usually takes a few seconds.</span>
        </div>
      );
    }
    if (status === 'active' && currentPeriodEnd) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm">
          <strong>Active Subscription</strong> — Renews {new Date(currentPeriodEnd).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      );
    }
    if (status === 'expired' || status === 'cancelled') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
          <strong>Subscription Expired</strong> — Choose a plan below to continue.
        </div>
      );
    }
    return null;
  }

  const isAlreadyActive = subscription?.status === 'active';
  const showPlans = !isAlreadyActive && subscription?.status !== 'pending_payment';
  const activePlan = PLANS.find((p) => p.key === selectedPlan)!;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 pt-16 sm:p-6 md:p-8 md:pt-8">
          <div className="max-w-2xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#0F2B5B] flex items-center gap-1 mb-4 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F2B5B]">Choose a Plan</h1>
              <p className="text-gray-500 mt-1 text-sm">Save more with longer plans. All plans include the same great features.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F2B5B]" />
              </div>
            ) : (
              <div className="space-y-6">
                <StatusBadge />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
                )}

                {showPlans && (
                  <>
                    {/* ── Plan selector ────────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-3">
                      {PLANS.map((plan) => {
                        const isSelected = selectedPlan === plan.key;
                        return (
                          <button
                            key={plan.key}
                            onClick={() => setSelectedPlan(plan.key)}
                            className={`relative text-left rounded-2xl border-2 p-4 transition-all ${
                              isSelected
                                ? 'border-[#0F2B5B] bg-[#0F2B5B] text-white shadow-lg scale-[1.02]'
                                : 'border-gray-200 bg-white text-gray-800 hover:border-[#0F2B5B]/40'
                            }`}
                          >
                            {/* Badge */}
                            {plan.badge && (
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#C49A22] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                {plan.badge}
                              </span>
                            )}

                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-blue-300' : 'text-gray-400'}`}>
                              {plan.label}
                            </p>
                            <p className="text-xl font-extrabold">R{plan.amount.toLocaleString()}</p>
                            <p className={`text-xs mt-0.5 ${isSelected ? 'text-blue-300' : 'text-gray-400'}`}>
                              ≈ R{plan.perMonth}/mo
                            </p>
                            {plan.saving && (
                              <span className={`inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                              }`}>
                                Save R{plan.saving}
                              </span>
                            )}

                            {/* Selected indicator */}
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-5 h-5 bg-[#C49A22] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* ── Payment card ──────────────────────────────────── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {/* Summary bar */}
                      <div className="bg-[#0F2B5B] px-6 py-5 flex items-center justify-between">
                        <div>
                          <p className="text-blue-300 text-xs uppercase tracking-wider font-semibold">{activePlan.label} Plan</p>
                          <p className="text-white font-extrabold text-2xl mt-0.5">
                            R{activePlan.amount.toLocaleString()}
                            <span className="text-blue-300 text-sm font-normal ml-1">for {activePlan.months} month{activePlan.months > 1 ? 's' : ''}</span>
                          </p>
                        </div>
                        {activePlan.saving && (
                          <div className="bg-[#C49A22] text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                            Save R{activePlan.saving}
                          </div>
                        )}
                      </div>

                      <div className="px-6 py-6 space-y-6">
                        {/* Features */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-3">What&apos;s included:</p>
                          <ul className="space-y-2">
                            {FEATURES.map((f) => (
                              <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-gray-100" />

                        {/* Payment methods */}
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-3">Accepted payment methods</p>
                          <div className="flex flex-wrap gap-2">
                            {['Instant EFT', 'Visa', 'Mastercard', 'All SA banks'].map((m) => (
                              <span key={m} className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg">{m}</span>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-3">
                            Payments processed securely by <strong>Ozow</strong> — South Africa&apos;s leading instant payment platform.
                          </p>
                        </div>

                        <div className="border-t border-gray-100" />

                        {/* Pay button */}
                        <button
                          onClick={handlePay}
                          disabled={paying}
                          className="w-full bg-[#C49A22] hover:bg-[#B8860B] disabled:opacity-70 text-white py-4 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2"
                        >
                          {paying ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Redirecting to Ozow…</>
                          ) : (
                            <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>Pay R{activePlan.amount.toLocaleString()} with Ozow</>
                          )}
                        </button>
                        <p className="text-center text-xs text-gray-400 -mt-3">
                          You&apos;ll be redirected to Ozow&apos;s secure payment page
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Already active */}
                {isAlreadyActive && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#0F2B5B] mb-2">You&apos;re All Set</h3>
                    <p className="text-gray-500 text-sm mb-6">Your subscription is active. Enjoy unlimited programmes.</p>
                    <Link href="/dashboard" className="inline-block bg-[#0F2B5B] hover:bg-[#1a3d7c] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
