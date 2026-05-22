'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { ABOUT_US, MISSION, VISION, VALUES, COMPANY_PROFILE } from '@/lib/legal';

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

      {/* ── Mission / Vision / Values ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Mission */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="w-10 h-10 bg-[#0F2B5B] rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-[#0F2B5B] text-lg mb-2">Our Mission</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{MISSION}</p>
          </div>
          {/* Vision */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="w-10 h-10 bg-[#C49A22] rounded-xl flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-[#0F2B5B] text-lg mb-2">Our Vision</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{VISION}</p>
          </div>
        </div>

        {/* Values */}
        <h3 className="font-bold text-[#0F2B5B] text-lg mb-4">Our Values</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VALUES.map((v) => (
            <div key={v.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#C49A22] flex-shrink-0 mt-2" />
              <div>
                <p className="font-semibold text-[#0F2B5B] text-sm">{v.label}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{v.text}</p>
              </div>
            </div>
          ))}
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
              <p className="font-semibold text-gray-800 text-sm">{COMPANY_PROFILE.tradingAs}</p>
              <p className="text-gray-500 text-xs mt-0.5">{COMPANY_PROFILE.name}</p>
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

          {/* WhatsApp */}
          {COMPANY_PROFILE.whatsapp ? (
            <a
              href={`https://wa.me/${COMPANY_PROFILE.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi Mementa, I need some help.')}`}
              target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:border-[#25D366]/40 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.117 1.522 5.85L.057 23.429a.75.75 0 00.914.914l5.579-1.465A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 01-4.964-1.365.75.75 0 00-.574-.077l-3.916.029.029-3.916a.75.75 0 00-.077-.574A9.693 9.693 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">WhatsApp</p>
                <p className="font-semibold text-gray-800 text-sm group-hover:text-[#25D366] transition-colors">
                  {COMPANY_PROFILE.phone}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Tap to chat with us directly</p>
              </div>
            </a>
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
              <p className="font-semibold text-gray-800 text-sm leading-snug">{COMPANY_PROFILE.address}</p>
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

      <Footer />
    </div>
  );
}
