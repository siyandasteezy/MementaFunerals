'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { getSubscription } from '@/lib/subscriptions';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'checking' | 'active' | 'pending'>('checking');

  useEffect(() => {
    let attempts = 0;
    const MAX = 15; // poll for up to 30 seconds

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const sub = await getSubscription(user.id);
      if (sub?.status === 'active') {
        setStatus('active');
      } else {
        attempts++;
        if (attempts < MAX) {
          setTimeout(check, 2000);
        } else {
          setStatus('pending');
        }
      }
    }
    check();
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-4 pt-16 sm:p-8 md:pt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">

            {status === 'checking' && (
              <>
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2B5B]" />
                </div>
                <h2 className="text-xl font-bold text-[#0F2B5B] mb-2">Confirming Payment…</h2>
                <p className="text-gray-500 text-sm">Please wait while we confirm your payment with Ozow. This usually takes a few seconds.</p>
              </>
            )}

            {status === 'active' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#0F2B5B] mb-2">Payment Successful!</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your subscription is now active. Start creating beautiful digital programmes.
                </p>
                <Link href="/dashboard" className="inline-block bg-[#C49A22] hover:bg-[#B8860B] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                  Go to Dashboard
                </Link>
              </>
            )}

            {status === 'pending' && (
              <>
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#0F2B5B] mb-2">Payment Received</h2>
                <p className="text-gray-500 text-sm mb-6">
                  Your payment is being processed. Your subscription will activate within a few minutes. Check your dashboard shortly.
                </p>
                <Link href="/dashboard" className="inline-block bg-[#0F2B5B] hover:bg-[#1a3d7c] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                  Go to Dashboard
                </Link>
              </>
            )}

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
