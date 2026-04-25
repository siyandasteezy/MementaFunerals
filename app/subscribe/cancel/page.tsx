'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function PaymentCancelPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-4 pt-16 sm:p-8 md:pt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0F2B5B] mb-2">Payment Cancelled</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your payment was not completed. No charge has been made. You can try again whenever you&apos;re ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/subscribe" className="bg-[#C49A22] hover:bg-[#B8860B] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                Try Again
              </Link>
              <Link href="/dashboard" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
