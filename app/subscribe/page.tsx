'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { getSubscription, activateSubscription, Subscription } from '@/lib/subscriptions';

export default function SubscribePage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [success, setSuccess] = useState(false);
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

  async function handleActivate() {
    if (!userId) return;
    setActivating(true);
    setError('');
    try {
      await activateSubscription(userId);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch {
      setError('Failed to activate subscription. Please try again.');
      setActivating(false);
    }
  }

  function getStatusBadge() {
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
          <strong>Subscription Expired</strong> — Upgrade below to continue creating programs.
        </div>
      );
    }
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
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
                {/* Current plan status */}
                {getStatusBadge()}

                {/* Success state */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 text-sm font-medium">
                    Subscription activated! Redirecting to your dashboard…
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Payment card */}
                {!success && subscription?.status !== 'active' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-[#0F2B5B] px-8 py-6">
                      <h2 className="text-xl font-bold text-white">Activate Monthly Plan</h2>
                      <div className="mt-2">
                        <span className="text-4xl font-extrabold text-white">R100</span>
                        <span className="text-blue-300 ml-1">/month</span>
                      </div>
                    </div>

                    <div className="px-8 py-6 space-y-6">
                      {/* Features included */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">What&apos;s included:</p>
                        <ul className="space-y-2">
                          {['Unlimited programs', 'QR codes for all programs', 'Advanced analytics', 'Priority support', 'Custom branding'].map((f) => (
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

                      {/* Payment method — EFT */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">Payment Method — EFT / Bank Transfer</p>
                        <div className="bg-gray-50 rounded-xl p-5 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Bank</span>
                            <span className="font-semibold text-gray-800">Nedbank</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Account Number</span>
                            <span className="font-semibold text-gray-800">1234567890</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Branch Code</span>
                            <span className="font-semibold text-gray-800">198765</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Account Type</span>
                            <span className="font-semibold text-gray-800">Cheque</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 flex justify-between">
                            <span className="text-gray-500">Reference</span>
                            <span className="font-semibold text-gray-800 break-all text-right max-w-[200px]">{userEmail || 'your email address'}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                            <span className="text-gray-700">Amount</span>
                            <span className="text-[#0F2B5B]">R100.00</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Please use your email address as the payment reference so we can match your payment.
                        </p>
                      </div>

                      <div className="border-t border-gray-100" />

                      {/* Activate button */}
                      <div>
                        <button
                          onClick={handleActivate}
                          disabled={activating}
                          className="w-full bg-[#C49A22] hover:bg-[#B8860B] disabled:opacity-70 text-white py-4 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2"
                        >
                          {activating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              Activating…
                            </>
                          ) : (
                            "I've Made Payment — Activate My Account"
                          )}
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                          In production this would integrate with PayFast or Peach Payments.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Already active state */}
                {subscription?.status === 'active' && !success && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#0F2B5B] mb-2">You&apos;re All Set</h3>
                    <p className="text-gray-500 text-sm mb-6">Your subscription is active. Enjoy unlimited programs.</p>
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
