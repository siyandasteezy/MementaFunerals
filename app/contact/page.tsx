'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { ABOUT_US, COMPANY_PROFILE } from '@/lib/legal';

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
];

const COUNTRIES = [
  'South Africa', 'Botswana', 'Eswatini', 'Lesotho',
  'Mozambique', 'Namibia', 'Zimbabwe', 'Other',
];

export default function ContactPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [message, setMessage]   = useState('');
  const [country, setCountry]   = useState('');
  const [province, setProvince] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { error: dbError } = await supabase.from('contact_submissions').insert({
        name, email, message, country,
        province: country === 'South Africa' ? province : null,
      });
      if (dbError) throw dbError;
      setSuccess(true);
      setName(''); setEmail(''); setMessage(''); setCountry(''); setProvince('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── About Us hero banner ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0F2B5B] to-[#1a3d7c] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative w-44 h-14 mx-auto rounded-lg overflow-hidden mb-6">
            <Image src="/mementa-logo.png" alt="Mementa" fill className="object-contain" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">About Us</h1>
          <p className="text-blue-200 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
            {ABOUT_US}
          </p>
        </div>
      </section>

      {/* ── Company profile cards ─────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-[#0F2B5B] mb-6">Company Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Company name */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#0F2B5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Company</p>
              <p className="font-semibold text-gray-800 text-sm">{COMPANY_PROFILE.name}</p>
              {COMPANY_PROFILE.registration && (
                <p className="text-gray-400 text-xs mt-0.5">Reg: {COMPANY_PROFILE.registration}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Email</p>
              <a href={`mailto:${COMPANY_PROFILE.email}`} className="font-semibold text-gray-800 text-sm hover:text-[#C49A22] transition-colors">
                {COMPANY_PROFILE.email}
              </a>
            </div>
          </div>

          {/* Phone — shown only if filled in */}
          {COMPANY_PROFILE.phone ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Phone</p>
                <a href={`tel:${COMPANY_PROFILE.phone}`} className="font-semibold text-gray-800 text-sm hover:text-[#C49A22] transition-colors">
                  {COMPANY_PROFILE.phone}
                </a>
              </div>
            </div>
          ) : null}

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
              <p className="font-semibold text-gray-800 text-sm">{COMPANY_PROFILE.address}</p>
            </div>
          </div>

          {/* Website */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#0F2B5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Website</p>
              <a href={COMPANY_PROFILE.website} className="font-semibold text-gray-800 text-sm hover:text-[#C49A22] transition-colors">
                {COMPANY_PROFILE.website}
              </a>
            </div>
          </div>

          {/* VAT — shown only if filled in */}
          {COMPANY_PROFILE.vatNumber ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">VAT Number</p>
                <p className="font-semibold text-gray-800 text-sm">{COMPANY_PROFILE.vatNumber}</p>
              </div>
            </div>
          ) : null}

        </div>
      </section>

      {/* ── Contact form ──────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-[#0F2B5B] mb-2">Get in Touch</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Have a question, need support, or want to learn more? Fill in the form and we&apos;ll get back to you within 1–2 business days.
        </p>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0F2B5B] mb-2">Message Sent!</h3>
            <p className="text-gray-500 text-sm mb-6">Thank you for reaching out. We&apos;ll be in touch shortly.</p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-[#0F2B5B] hover:bg-[#1a3d7c] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-400">*</span></label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-400">*</span></label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country <span className="text-red-400">*</span></label>
                <select required value={country} onChange={(e) => { setCountry(e.target.value); setProvince(''); }}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition bg-white">
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {country === 'South Africa' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province <span className="text-red-400">*</span></label>
                  <select required value={province} onChange={(e) => setProvince(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition bg-white">
                    <option value="">Select your province</option>
                    {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-400">*</span></label>
                <textarea required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent transition resize-none" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-[#C49A22] hover:bg-[#B8860B] disabled:opacity-70 text-white py-4 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2">
                {submitting ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Sending…</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>Send Message</>
                )}
              </button>
            </form>
          </div>
        )}

        <p className="text-center mt-8">
          <Link href="/" className="text-gray-400 hover:text-[#0F2B5B] text-sm transition-colors">← Back to Home</Link>
        </p>
      </section>
    </div>
  );
}
