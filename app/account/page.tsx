'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { getSubscription, Subscription } from '@/lib/subscriptions';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Payment {
  id: string;
  amount: number | null;
  months: number | null;
  status: string;
  ozow_transaction_id: string | null;
  ozow_transaction_ref: string | null;
  created_at: string;
}

type ActiveTab = 'profile' | 'password' | 'billing';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtAmount(n: number | null) {
  if (n == null) return '—';
  return `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function planLabel(months: number | null) {
  if (!months) return '—';
  if (months === 1)  return 'Monthly';
  if (months === 12) return '12 Months';
  return `${months} Months`;
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    failed:    'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function SubStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active:          { cls: 'bg-green-100 text-green-700',  label: 'Active' },
    trial:           { cls: 'bg-blue-100 text-blue-700',    label: 'Free Trial' },
    expired:         { cls: 'bg-red-100 text-red-700',      label: 'Expired' },
    cancelled:       { cls: 'bg-gray-100 text-gray-600',    label: 'Cancelled' },
    pending_payment: { cls: 'bg-amber-100 text-amber-700',  label: 'Pending Payment' },
  };
  const s = map[status] ?? { cls: 'bg-gray-100 text-gray-600', label: status };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AccountPage() {
  const [activeTab, setActiveTab]             = useState<ActiveTab>('profile');
  const [userId, setUserId]                   = useState('');
  const [email, setEmail]                     = useState('');
  const [name, setName]                       = useState('');
  const [phone, setPhone]                     = useState('');
  const [businessName, setBusinessName]       = useState('');
  const [loading, setLoading]                 = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [profileMsg, setProfileMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving]               = useState(false);
  const [pwMsg, setPwMsg]                     = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [subscription, setSubscription]       = useState<Subscription | null>(null);
  const [payments, setPayments]               = useState<Payment[]>([]);
  const [billingLoading, setBillingLoading]   = useState(false);

  // ── Load user ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      setEmail(user.email ?? '');
      setName(user.user_metadata?.full_name ?? '');
      setPhone(user.user_metadata?.phone ?? '');
      setBusinessName(user.user_metadata?.business_name ?? '');
      setLoading(false);
    });
  }, []);

  // ── Load billing data when tab selected ───────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'billing' || !userId) return;
    setBillingLoading(true);
    Promise.all([
      getSubscription(userId),
      supabase
        .from('payments')
        .select('id, amount, months, status, ozow_transaction_id, ozow_transaction_ref, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]).then(([sub, { data: pays }]) => {
      setSubscription(sub);
      setPayments((pays as Payment[]) ?? []);
      setBillingLoading(false);
    });
  }, [activeTab, userId]);

  // ── Save profile ───────────────────────────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name:     name.trim(),
        phone:         phone.trim()        || null,
        business_name: businessName.trim() || null,
      },
    });
    setSaving(false);
    setProfileMsg(error
      ? { type: 'error',   text: error.message }
      : { type: 'success', text: 'Profile updated successfully.' }
    );
  }

  // ── Change password ────────────────────────────────────────────────────────
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
    if (newPassword.length < 6)          { setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); return; }
    setPwSaving(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) { setPwMsg({ type: 'error', text: 'Current password is incorrect.' }); setPwSaving(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) {
      setPwMsg({ type: 'error', text: error.message });
    } else {
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    }
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'profile',  label: 'Profile' },
    { key: 'password', label: 'Password' },
    { key: 'billing',  label: 'Billing' },
  ];

  function Alert({ msg }: { msg: { type: 'success' | 'error'; text: string } }) {
    return (
      <div className={`mb-4 p-3 rounded-lg text-sm ${
        msg.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-600'
      }`}>
        {msg.text}
      </div>
    );
  }

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
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F2B5B]">Account Settings</h1>
              <p className="text-gray-500 mt-1 text-sm">Manage your profile, password and billing.</p>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 shadow-sm">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === t.key
                      ? 'bg-[#0F2B5B] text-white shadow'
                      : 'text-gray-500 hover:text-[#0F2B5B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F2B5B]" />
              </div>
            ) : (
              <>
                {/* ── Profile tab ──────────────────────────────────────── */}
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-[#0F2B5B] mb-5">Profile Information</h2>
                    {profileMsg && <Alert msg={profileMsg} />}
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" value={email} disabled
                          className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                          placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                          placeholder="+27 82 123 4567" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business / Organisation Name <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                          placeholder="Your funeral home or company name" />
                      </div>
                      <button type="submit" disabled={saving}
                        className="w-full bg-[#0F2B5B] hover:bg-[#1a3d7c] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Saving…</> : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                )}

                {/* ── Password tab ─────────────────────────────────────── */}
                {activeTab === 'password' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-[#0F2B5B] mb-5">Change Password</h2>
                    {pwMsg && <Alert msg={pwMsg} />}
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                          placeholder="Enter current password" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                          placeholder="Minimum 6 characters" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                          placeholder="Re-enter new password" />
                      </div>
                      <button type="submit" disabled={pwSaving}
                        className="w-full bg-[#C49A22] hover:bg-[#B8860B] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        {pwSaving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Changing…</> : 'Change Password'}
                      </button>
                    </form>
                  </div>
                )}

                {/* ── Billing tab ──────────────────────────────────────── */}
                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    {billingLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F2B5B]" />
                      </div>
                    ) : (
                      <>
                        {/* Current plan card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                          <h2 className="text-lg font-bold text-[#0F2B5B] mb-4">Current Subscription</h2>
                          {subscription ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Status</span>
                                <SubStatusBadge status={subscription.status} />
                              </div>
                              {subscription.status === 'trial' && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Trial ends</span>
                                  <span className="text-sm font-semibold text-gray-800">{fmtDate(subscription.trialEndsAt)}</span>
                                </div>
                              )}
                              {subscription.status === 'active' && subscription.currentPeriodEnd && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">Renews / Expires</span>
                                  <span className="text-sm font-semibold text-gray-800">{fmtDate(subscription.currentPeriodEnd)}</span>
                                </div>
                              )}
                              <div className="pt-2">
                                <Link href="/subscribe"
                                  className="inline-flex items-center gap-2 bg-[#0F2B5B] hover:bg-[#1a3d7c] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                                  {subscription.status === 'active' ? 'Renew / Upgrade Plan' : 'Choose a Plan'}
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">No subscription found.</p>
                          )}
                        </div>

                        {/* Payment history */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                          <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-[#0F2B5B]">Payment History</h2>
                            <p className="text-xs text-gray-400 mt-0.5">All payments processed via Ozow</p>
                          </div>

                          {payments.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-500 font-medium">No payments yet</p>
                              <p className="text-xs text-gray-400 mt-1">Your payment history will appear here once you subscribe.</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-50">
                              {payments.map((pay) => (
                                <div key={pay.id} className="px-6 py-4 flex items-center justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-semibold text-gray-800">{planLabel(pay.months)}</span>
                                      <PaymentStatusBadge status={pay.status} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(pay.created_at)}</p>
                                    {pay.ozow_transaction_id && (
                                      <p className="text-[10px] text-gray-300 mt-0.5 font-mono truncate">
                                        Ref: {pay.ozow_transaction_id}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className={`text-base font-extrabold ${pay.status === 'completed' ? 'text-[#0F2B5B]' : 'text-gray-400'}`}>
                                      {fmtAmount(pay.amount)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
