'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

const featureRows = [
  {
    title: 'Share Instantly via QR Code',
    desc: 'Print a single QR code and place it at the venue. Attendees scan with any smartphone — no app required.',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Person scanning QR code on mobile phone',
    imageLeft: true,
  },
  {
    title: 'Comfort Families with Easy Access',
    desc: 'Give grieving families one less thing to worry about. The program is always accessible, always up to date.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Family sharing comfort together',
    imageLeft: false,
  },
  {
    title: 'Advanced Analytics & Data Collection',
    desc: 'Track how many people viewed each program, when they scanned, and where — service improvement made easy.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=700&q=80',
    imageAlt: 'Analytics dashboard on a laptop screen',
    imageLeft: true,
  },
];

const howItWorksSteps = [
  {
    num: '01',
    title: 'Upload PDF',
    desc: 'Drag and drop your funeral program PDF into our secure uploader.',
    icon: (
      <svg className="w-7 h-7 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Add Details',
    desc: "Enter the deceased's name, dates, and event information.",
    icon: (
      <svg className="w-7 h-7 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Share QR Code',
    desc: 'Download your unique QR code and share it at the venue or digitally.',
    icon: (
      <svg className="w-7 h-7 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Programme Live for 48 Hours',
    desc: 'Your programme is publicly accessible for 48 hours, then archived and automatically removed after 7 days.',
    icon: (
      <svg className="w-7 h-7 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const faqItems = [
  {
    q: 'How does the free trial work?',
    a: 'Your first 30 days are completely free. No credit card required. After that, it\'s R250 per month.',
  },
  {
    q: 'Do attendees need to download an app?',
    a: "No. Attendees simply scan the QR code with their phone's camera and the program opens in their browser.",
  },
  {
    q: 'Can I use Mementa for other events, not just funerals?',
    a: 'Absolutely. Mementa works for any life event — memorial services, celebrations of life, religious ceremonies, and more.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. All programs are stored securely in the cloud using Supabase. Your data is encrypted and backed up automatically.',
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 70% 50%, #e8f0fb 0%, #f5f7ff 40%, #ffffff 100%)',
        }}
      >
        {/* Decorative soft circles */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-blue-50/60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-amber-50/50 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-2 text-sm mb-6 shadow-sm">
              <span className="w-2 h-2 bg-[#C49A22] rounded-full animate-pulse" />
              <span className="text-[#0F2B5B] font-semibold">For Funerals &amp; All Life Events</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-[#0F2B5B]">
              Honor Every Life with a{' '}
              <span className="text-[#C49A22]">Beautiful</span>{' '}
              Digital Program
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
              Upload your funeral program PDF, generate a QR code, and share it with every attendee — instantly, from any device.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/register"
                className="bg-[#C49A22] hover:bg-[#B8860B] text-white px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-lg hover:shadow-xl text-center"
              >
                Start Free Trial
              </Link>
              <a
                href="#how-it-works"
                className="bg-white hover:bg-gray-50 text-[#0F2B5B] border-2 border-[#0F2B5B] px-8 py-4 rounded-xl text-base font-semibold transition-all text-center"
              >
                See How It Works
              </a>
            </div>
            <p className="text-gray-500 text-sm">
              ✓ Free 30-day trial &nbsp;&nbsp; ✓ No credit card required &nbsp;&nbsp; ✓ Cancel anytime
            </p>
          </div>

          {/* Right: programme preview card */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-80 h-96 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <Image
                src="/programme.png"
                alt="Digital funeral programme preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2B5B]/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-white text-sm font-semibold">Scan to view program</p>
                <p className="text-blue-200 text-xs mt-1">Works on any smartphone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ── */}
      <section className="bg-gray-50 py-8 px-6 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 text-sm font-medium mb-6 uppercase tracking-wider">
            Trusted by funeral parlours and event organisers across South Africa
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: '500+ Programs Created', bg: 'bg-blue-50 text-blue-700' },
              { label: '20K+ QR Code Scans', bg: 'bg-amber-50 text-amber-700' },
              { label: '100+ Funeral Parlours', bg: 'bg-green-50 text-green-700' },
              { label: '4.9\u2605 Rating', bg: 'bg-purple-50 text-purple-700' },
            ].map((stat) => (
              <span
                key={stat.label}
                className={`${stat.bg} px-5 py-2 rounded-full text-sm font-semibold`}
              >
                {stat.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (alternating rows) ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto space-y-24">
          {featureRows.map((row) => (
            <div
              key={row.title}
              className={`flex flex-col ${row.imageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
            >
              <div className="flex-1 w-full">
                <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden shadow-xl">
                  <Image
                    src={row.image}
                    alt={row.imageAlt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-[#0F2B5B] mb-4">{row.title}</h3>
                <p className="text-gray-500 text-lg leading-relaxed">{row.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F2B5B] mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Three simple steps to create and share a beautiful digital program
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, i) => (
              <div key={step.num} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#0F2B5B] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2">
                  {step.icon}
                </div>
                <h3 className="font-bold text-[#0F2B5B] text-xl mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F2B5B] mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Free Trial */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Free Trial</span>
              </div>
              <h3 className="text-2xl font-bold text-[#0F2B5B] mb-1">30 Days Free</h3>
              <div className="my-4">
                <span className="text-5xl font-extrabold text-[#0F2B5B]">R0</span>
                <span className="text-gray-400 ml-1 text-sm">/first month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Up to 10 programs', 'QR codes for all programs', 'View tracking', 'Email support'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center border-2 border-[#0F2B5B] text-[#0F2B5B] hover:bg-[#0F2B5B] hover:text-white py-3 rounded-xl font-semibold transition-all"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Monthly Plan */}
            <div className="bg-[#0F2B5B] rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-xl">
              <div className="absolute top-4 right-4 bg-[#C49A22] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Monthly Plan</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">R250 / month</h3>
              <div className="my-4">
                <span className="text-5xl font-extrabold text-white">R250</span>
                <span className="text-blue-300 ml-1 text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Unlimited programs', 'QR codes for all programs', 'Advanced analytics', 'Priority support', 'Custom branding'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-blue-100">
                    <svg className="w-5 h-5 text-[#C49A22] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center bg-[#C49A22] hover:bg-[#B8860B] text-white py-3 rounded-xl font-semibold transition-all shadow-md"
              >
                Get Started
              </Link>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm mt-6">
            Start with a free 30-day trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F2B5B] mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know about Mementa</p>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#0F2B5B] text-sm md:text-base">{item.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#0F2B5B] py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your First Program?
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Join hundreds of funeral parlours and families across South Africa.
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#C49A22] hover:bg-[#B8860B] text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Start Free — 30 Days on Us
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0a1f44] text-blue-200 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <p className="text-white font-bold text-2xl mb-2">Mementa</p>
              <p className="text-blue-300 text-sm leading-relaxed">
                Honoring lives with beautiful digital programs and instant QR sharing.
              </p>
            </div>
            {/* Product */}
            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Product</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            {/* Support */}
            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Support</p>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@mementa.co.za" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Legal</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-blue-400">
            &copy; 2025 Mementa. All rights reserved. Made with care in South Africa.
          </div>
        </div>
      </footer>
    </div>
  );
}
