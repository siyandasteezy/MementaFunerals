'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface SubRow {
  id: string;
  user_id: string;
  status: string;
  trial_ends_at: string;
  current_period_end: string | null;
  created_at: string;
}

interface ProgramRow {
  id: string;
  user_id: string;
  deceased_name: string;
  created_at: string;
}

interface UserSummary {
  userId: string;
  status: string;
  trialEndsAt: string;
  periodEnd: string | null;
  joinedAt: string;
  programCount: number;
}

type Tab = 'overview' | 'users' | 'programs' | 'subscriptions';

const NAV_ITEMS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'programs', label: 'Programs' },
  { key: 'subscriptions', label: 'Subscriptions' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    trial: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function shortId(id: string) {
  return id.slice(0, 8) + '…';
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [subscriptions, setSubscriptions] = useState<SubRow[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspending, setSuspending] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: subs }, { data: progs }] = await Promise.all([
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('programs').select('id, user_id, deceased_name, created_at').order('created_at', { ascending: false }),
      ]);
      setSubscriptions((subs as SubRow[]) ?? []);
      setPrograms((progs as ProgramRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSuspend(userId: string) {
    setSuspending(userId);
    await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', userId);
    setSubscriptions((prev) => prev.map((s) => s.user_id === userId ? { ...s, status: 'cancelled' } : s));
    setSuspending(null);
  }

  // Build user summary list
  const userSummaries: UserSummary[] = subscriptions.map((sub) => ({
    userId: sub.user_id,
    status: sub.status,
    trialEndsAt: sub.trial_ends_at,
    periodEnd: sub.current_period_end,
    joinedAt: sub.created_at,
    programCount: programs.filter((p) => p.user_id === sub.user_id).length,
  }));

  const totalUsers = subscriptions.length;
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const trialCount = subscriptions.filter((s) => s.status === 'trial').length;
  const totalPrograms = programs.length;

  const recentPrograms = programs.slice(0, 10);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0F2B5B] flex flex-col min-h-screen flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <p className="text-white font-bold text-xl">Mementa</p>
          <span className="inline-block mt-1 bg-[#C49A22] text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === item.key
                  ? 'bg-white/10 text-white'
                  : 'text-blue-200 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-blue-300 hover:text-white text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F2B5B]" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#0F2B5B]">Overview</h1>
                  <p className="text-gray-500 mt-1">Platform-wide summary</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                  {[
                    { label: 'Total Users', value: totalUsers, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Active Subscriptions', value: activeCount, color: 'bg-green-50 text-green-700' },
                    { label: 'Trial Users', value: trialCount, color: 'bg-amber-50 text-amber-700' },
                    { label: 'Total Programs', value: totalPrograms, color: 'bg-purple-50 text-purple-700' },
                  ].map((stat) => (
                    <div key={stat.label} className={`${stat.color} rounded-2xl p-6`}>
                      <p className="text-3xl font-extrabold">{stat.value}</p>
                      <p className="text-sm font-medium mt-1 opacity-80">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent programs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-[#0F2B5B]">Recent Programs</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 text-left">Deceased Name</th>
                          <th className="px-6 py-3 text-left">User ID</th>
                          <th className="px-6 py-3 text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {recentPrograms.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium text-gray-800">{p.deceased_name}</td>
                            <td className="px-6 py-3 text-gray-500 font-mono text-xs">{shortId(p.user_id)}</td>
                            <td className="px-6 py-3 text-gray-400">{fmtDate(p.created_at)}</td>
                          </tr>
                        ))}
                        {recentPrograms.length === 0 && (
                          <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">No programs yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users tab */}
            {(tab === 'users' || tab === 'subscriptions') && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#0F2B5B]">
                    {tab === 'users' ? 'Users' : 'Subscriptions'}
                  </h1>
                  <p className="text-gray-500 mt-1">All registered users and their subscription status</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 text-left">User ID</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-left">Trial Ends / Period End</th>
                          <th className="px-6 py-3 text-left">Programs</th>
                          <th className="px-6 py-3 text-left">Joined</th>
                          <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {userSummaries.map((u) => (
                          <tr key={u.userId} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-mono text-xs text-gray-500">{shortId(u.userId)}</td>
                            <td className="px-6 py-3"><StatusBadge status={u.status} /></td>
                            <td className="px-6 py-3 text-gray-500">
                              {u.status === 'trial' ? fmtDate(u.trialEndsAt) : fmtDate(u.periodEnd)}
                            </td>
                            <td className="px-6 py-3 text-gray-700 font-semibold">{u.programCount}</td>
                            <td className="px-6 py-3 text-gray-400">{fmtDate(u.joinedAt)}</td>
                            <td className="px-6 py-3">
                              {u.status !== 'cancelled' ? (
                                <button
                                  onClick={() => handleSuspend(u.userId)}
                                  disabled={suspending === u.userId}
                                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 transition-colors"
                                >
                                  {suspending === u.userId ? 'Suspending…' : 'Suspend'}
                                </button>
                              ) : (
                                <span className="text-xs text-gray-300">Suspended</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {userSummaries.length === 0 && (
                          <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No users yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Programs tab */}
            {tab === 'programs' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-[#0F2B5B]">Programs</h1>
                  <p className="text-gray-500 mt-1">All programs created on the platform</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3 text-left">Program ID</th>
                          <th className="px-6 py-3 text-left">Deceased Name</th>
                          <th className="px-6 py-3 text-left">User ID</th>
                          <th className="px-6 py-3 text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {programs.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-mono text-xs text-gray-500">{shortId(p.id)}</td>
                            <td className="px-6 py-3 font-medium text-gray-800">{p.deceased_name}</td>
                            <td className="px-6 py-3 font-mono text-xs text-gray-500">{shortId(p.user_id)}</td>
                            <td className="px-6 py-3 text-gray-400">{fmtDate(p.created_at)}</td>
                          </tr>
                        ))}
                        {programs.length === 0 && (
                          <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No programs yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
