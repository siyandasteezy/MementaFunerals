'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { getSubscription, Subscription } from '@/lib/subscriptions';

export default function SubscribePage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

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
    setPaying(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-ozow-payment', {
        body: { userId, userEmail },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.url) throw new Error('No payment URL returned.');

      // Redirect to Ozow hosted payment page
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
          <span><strong>Payment Pending</strong> — We&apos;re waiting for confirmation from Ozow. This usually takes a few seconds.</span>
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
          <strong>Subscription Expired</strong> — Subscribe below to continue creating programmes.
        </div>
      );
    }
    return null;
  }

  const isAlreadyActive = subscription?.status === 'active';
  const showPayButton = !isAlreadyActive && subscription?.status !== 'pending_payment';

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 pt-16 sm:p-6 md:p-8 md:pt-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#0F2B5B] flex items-center gap-1 mb-4 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-[#0F2B5B]">Subscription</h1>
              <p className="text-gray-500 mt-1">Manage your Mementa subscription plan.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F2B5B]" />
              </div>
            ) : (
              <div className="space-y-6">
                <StatusBadge />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Payment card */}
                {showPayButton && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-[#0F2B5B] px-8 py-6">
                      <h2 className="text-xl font-bold text-white">Monthly Subscription</h2>
                      <div className="mt-2">
                        <span className="text-4xl font-extrabold text-white">R250</span>
                        <span className="text-blue-300 ml-1">/month</span>
                      </div>
                    </div>

                    <div className="px-8 py-6 space-y-6">
                      {/* Features */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">What&apos;s included:</p>
                        <ul className="space-y-2">
                          {['Unlimited programmes', 'QR codes for all programmes', 'Advanced analytics', 'Priority support', 'Custom branding'].map((f) => (
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
                        <div className="flex flex-wrap gap-3">
                          {['Instant EFT', 'Visa', 'Mastercard', 'All SA banks'].map((m) => (
                            <span key={m} className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg">
                              {m}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                          Payments are processed securely by <strong>Ozow</strong> — South Africa&apos;s leading instant payment platform.
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
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Redirecting to Ozow…
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Pay R250 with Ozow
                          </>
                        )}
                      </button>
                      <p className="text-center text-xs text-gray-400 -mt-3">
                        You&apos;ll be redirected to Ozow&apos;s secure payment page
                      </p>
                    </div>
                  </div>
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
