'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';

export default function AccountPage() {
  const [userId, setUserId]           = useState('');
  const [email, setEmail]             = useState('');
  const [name, setName]               = useState('');
  const [phone, setPhone]             = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [profileMsg, setProfileMsg]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [pwSaving, setPwSaving]                 = useState(false);
  const [pwMsg, setPwMsg]                       = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Load current user ──────────────────────────────────────────────────────
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
    if (error) {
      setProfileMsg({ type: 'error', text: error.message });
    } else {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    }
  }

  // ── Change password ────────────────────────────────────────────────────────
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPwSaving(true);
    // Re-authenticate first so the change is secure
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) {
      setPwMsg({ type: 'error', text: 'Current password is incorrect.' });
      setPwSaving(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) {
      setPwMsg({ type: 'error', text: error.message });
    } else {
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
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
              <p className="text-gray-500 mt-1 text-sm">Manage your profile and password.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0F2B5B]" />
              </div>
            ) : (
              <div className="space-y-6">

                {/* ── Profile card ─────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#0F2B5B] mb-5">Profile Information</h2>

                  {profileMsg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      profileMsg.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                      {profileMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Email — read-only */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email" value={email} disabled
                        className="w-full border border-gray-100 rounded-lg px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                        placeholder="Your full name"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                        placeholder="+27 82 123 4567"
                      />
                    </div>

                    {/* Business Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business / Organisation Name <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                        placeholder="Your funeral home or company name"
                      />
                    </div>

                    <button
                      type="submit" disabled={saving}
                      className="w-full bg-[#0F2B5B] hover:bg-[#1a3d7c] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Saving…</>
                      ) : 'Save Changes'}
                    </button>
                  </form>
                </div>

                {/* ── Password card ─────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#0F2B5B] mb-5">Change Password</h2>

                  {pwMsg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      pwMsg.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                      {pwMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B]/30 transition"
                        placeholder="Re-enter new password"
                      />
                    </div>

                    <button
                      type="submit" disabled={pwSaving}
                      className="w-full bg-[#C49A22] hover:bg-[#B8860B] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {pwSaving ? (
                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Changing…</>
                      ) : 'Change Password'}
                    </button>
                  </form>
                </div>

                {/* ── Subscription shortcut ─────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#0F2B5B]">Subscription</h2>
                    <p className="text-sm text-gray-500 mt-0.5">View your plan or upgrade.</p>
                  </div>
                  <Link
                    href="/subscribe"
                    className="flex-shrink-0 bg-gray-50 hover:bg-[#0F2B5B] hover:text-white border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Manage
                  </Link>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
