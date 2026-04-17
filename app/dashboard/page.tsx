'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import ProgramCard from '@/components/ProgramCard';
import { supabase } from '@/lib/supabase';
import { getAllPrograms } from '@/lib/storage';
import { Program } from '@/lib/types';
import { getSubscription, Subscription } from '@/lib/subscriptions';

export default function DashboardPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [firstName, setFirstName] = useState('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setFirstName((user.user_metadata?.full_name || user.email || '').split(' ')[0]);
    const [all, sub] = await Promise.all([
      getAllPrograms(user.id),
      getSubscription(user.id),
    ]);
    setPrograms(all);
    setSubscription(sub);
  }

  useEffect(() => { loadData(); }, []);

  const totalViews = programs.reduce((acc, p) => acc + (p.views || 0), 0);

  function SubscriptionBanner() {
    if (!subscription) return null;
    const { status, trialEndsAt, currentPeriodEnd } = subscription;

    if (status === 'trial') {
      const daysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000));
      return (
        <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-amber-800 text-sm">
          <span>
            <span className="mr-1">🕐</span>
            <strong>Free Trial:</strong> {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining — Upgrade for R100/month
          </span>
          <Link href="/subscribe" className="ml-4 flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors">
            Upgrade Now
          </Link>
        </div>
      );
    }

    if (status === 'expired' || status === 'cancelled') {
      return (
        <div className="mb-6 flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-800 text-sm">
          <span>
            <span className="mr-1">⚠️</span>
            <strong>Trial Expired</strong> — Upgrade to continue creating programs
          </span>
          <Link href="/subscribe" className="ml-4 flex-shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors">
            Subscribe Now
          </Link>
        </div>
      );
    }

    if (status === 'active') {
      const renewalDate = currentPeriodEnd
        ? new Date(currentPeriodEnd).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';
      return (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-green-800 text-sm">
          <span>✅ <strong>Active Subscription</strong> — Renews {renewalDate}</span>
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#0F2B5B]">Welcome back, {firstName || 'there'} 👋</h1>
            <p className="text-gray-500 mt-1">Manage your funeral programs and share them with loved ones.</p>
          </div>

          <SubscriptionBanner />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Programs" value={programs.length} color="bg-blue-50"
              icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
            <StatsCard title="Active Programs" value={programs.length} color="bg-green-50"
              icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
            <StatsCard title="Total Views" value={totalViews} color="bg-amber-50"
              icon={<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
            <StatsCard title="QR Leads" value={totalViews} color="bg-purple-50"
              icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#0F2B5B]">My Programs</h2>
            <Link href="/create" className="flex items-center gap-2 bg-[#C49A22] hover:bg-[#B8860B] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Program
            </Link>
          </div>

          {programs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No programs yet</h3>
              <p className="text-gray-400 text-sm mb-6">Create your first digital funeral program and share it with a QR code.</p>
              <Link href="/create" className="inline-flex items-center gap-2 bg-[#0F2B5B] hover:bg-[#1a3d7c] text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create First Program
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} onDeleted={loadData} />
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
