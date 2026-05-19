'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/auth';
import { createSubscription } from '@/lib/subscriptions';
import { supabase } from '@/lib/supabase';
import LegalModal from '@/components/LegalModal';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, REFUND_POLICY } from '@/lib/legal';

type ModalType = 'terms' | 'privacy' | 'refund' | null;

const MODAL_META: Record<Exclude<ModalType, null>, { title: string; content: string }> = {
  terms:   { title: 'Terms and Conditions',          content: TERMS_AND_CONDITIONS },
  privacy: { title: 'Privacy & POPIA Policy',        content: PRIVACY_POLICY },
  refund:  { title: 'Refund and Cancellation Policy', content: REFUND_POLICY },
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [phone, setPhone]                     = useState('');
  const [businessName, setBusinessName]       = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepted, setAccepted]               = useState(false);
  const [modal, setModal]                   = useState<ModalType>(null);
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6)          { setError('Password must be at least 6 characters.'); return; }
    if (!accepted)                    { setError('Please accept the Terms & Conditions to continue.'); return; }
    setLoading(true);
    try {
      const data = await registerUser(
        name,
        email,
        password,
        phone.trim()         || undefined,
        businessName.trim()  || undefined,
      );
      if (data.user) {
        await createSubscription(data.user.id);
        // Fire-and-forget admin notification — don't block registration if it fails
        supabase.functions.invoke('notify-new-user', {
          body: {
            name:         name.trim(),
            email,
            phone:        phone.trim()        || null,
            businessName: businessName.trim() || null,
          },
        }).catch(() => {/* silent */});
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setLoading(false);
    }
  }

  return (
    <>
      {/* Legal modals */}
      {modal && (
        <LegalModal
          title={MODAL_META[modal].title}
          content={MODAL_META[modal].content}
          onClose={() => setModal(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-[#0F2B5B] via-[#1a3d7c] to-[#0F2B5B] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <div className="relative w-44 h-14 mx-auto rounded-lg overflow-hidden">
                <Image src="/mementa-logo.png" alt="Mementa" fill className="object-contain" />
              </div>
            </Link>
            <p className="text-blue-200 mt-3 text-sm">Create your free account to get started.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#0F2B5B] mb-6">Create Account</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition"
                  placeholder="you@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition"
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition"
                  placeholder="Your funeral home or company name"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition"
                  placeholder="Minimum 6 characters"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition"
                  placeholder="Re-enter password"
                />
              </div>

              {/* ── Accept Terms ─────────────────────────────────────── */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                      className="sr-only peer"
                    />
                    {/* Custom checkbox */}
                    <div className="w-5 h-5 rounded border-2 border-gray-300 peer-checked:bg-[#0F2B5B] peer-checked:border-[#0F2B5B] transition-colors flex items-center justify-center">
                      {accepted && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setModal('terms')}
                      className="text-[#0F2B5B] font-semibold underline underline-offset-2 hover:text-[#C49A22] transition-colors"
                    >
                      Terms &amp; Conditions
                    </button>
                    ,{' '}
                    <button
                      type="button"
                      onClick={() => setModal('privacy')}
                      className="text-[#0F2B5B] font-semibold underline underline-offset-2 hover:text-[#C49A22] transition-colors"
                    >
                      Privacy &amp; POPIA Policy
                    </button>
                    , and{' '}
                    <button
                      type="button"
                      onClick={() => setModal('refund')}
                      className="text-[#0F2B5B] font-semibold underline underline-offset-2 hover:text-[#C49A22] transition-colors"
                    >
                      Refund &amp; Cancellation Policy
                    </button>
                    .
                  </span>
                </label>

                {/* Quick links row */}
                <div className="flex flex-wrap gap-2 mt-3 pl-8">
                  {(['terms', 'privacy', 'refund'] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setModal(key)}
                      className="text-[10px] bg-white border border-gray-200 hover:border-[#0F2B5B] text-gray-500 hover:text-[#0F2B5B] px-2.5 py-1 rounded-lg font-medium transition-colors"
                    >
                      {key === 'terms'   && 'Terms & Conditions'}
                      {key === 'privacy' && 'Privacy / POPIA'}
                      {key === 'refund'  && 'Refund Policy'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !accepted}
                className="w-full bg-[#C49A22] hover:bg-[#B8860B] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg text-sm font-semibold transition-colors mt-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Creating Account…
                  </>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[#C49A22] hover:text-[#B8860B] font-semibold">Sign in</Link>
            </p>
          </div>

          <p className="text-center mt-6">
            <Link href="/" className="text-blue-200 hover:text-white text-sm transition-colors">← Back to Home</Link>
          </p>
        </div>
      </div>
    </>
  );
}
