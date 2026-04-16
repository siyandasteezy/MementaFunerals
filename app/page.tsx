import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: 'Upload PDF Program',
    desc: 'Simply upload your existing funeral program PDF. We store it securely and make it instantly shareable.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    title: 'Generate QR Code',
    desc: 'Every program gets a unique QR code. Print it on cards or display it at the venue for instant access.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Live & Shareable',
    desc: 'Share a link or QR code with anyone, anywhere. No app needed — it works in any browser.',
  },
  {
    icon: (
      <svg className="w-8 h-8 text-[#C49A22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Easy Access',
    desc: 'Attendees simply scan the QR code with their phone to view the full program — no account required.',
  },
];

const trustBadges = [
  { label: 'Secure Storage', icon: '🔒' },
  { label: 'No App Required', icon: '📱' },
  { label: 'Instant QR Codes', icon: '⚡' },
  { label: 'Free to Start', icon: '✨' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0F2B5B] via-[#1a3d7c] to-[#0F2B5B] text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-[#C49A22] rounded-full animate-pulse" />
            Honoring lives, one program at a time
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Honor.{' '}
            <span className="text-[#C49A22]">Share.</span>{' '}
            Remember.
          </h1>

          <p className="text-xl md:text-2xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create beautiful digital programs for funerals and important life events. Upload your
            PDF, generate a QR code, and share with loved ones instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[#C49A22] hover:bg-[#B8860B] text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Program
            </Link>
            <a
              href="#features"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl text-lg font-semibold transition-all backdrop-blur-sm"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '1000+', label: 'Programs Created' },
              { value: '50K+', label: 'QR Scans' },
              { value: '100%', label: 'Free to Start' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-[#C49A22]">{stat.value}</p>
                <p className="text-blue-300 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F2B5B] mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Mementa makes it simple to honor loved ones with a digital program that anyone can
              access in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-bold text-[#0F2B5B] text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F2B5B] mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 text-lg">Three simple steps to create and share a program</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Your PDF',
                desc: 'Drag and drop your funeral program PDF into our secure uploader.',
              },
              {
                step: '02',
                title: 'Add Details',
                desc: "Enter the deceased's name, dates, and event information.",
              },
              {
                step: '03',
                title: 'Share the QR Code',
                desc: 'Download and print the QR code. Attendees scan it to view the program.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-14 h-14 bg-[#0F2B5B] text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-[#0F2B5B] text-xl mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#0F2B5B] to-[#1a3d7c] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Honor Your Loved One?
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Create a free account today and have your first digital program ready in minutes.
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#C49A22] hover:bg-[#B8860B] text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">{badge.icon}</span>
                <span className="font-medium text-sm">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F2B5B] text-blue-200 py-8 px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Mementa. All rights reserved.</p>
        <p className="mt-1 text-blue-300/60">Honoring lives with dignity and care.</p>
      </footer>
    </div>
  );
}
