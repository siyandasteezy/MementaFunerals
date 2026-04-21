'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { logout } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Mementa Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[#0F2B5B] text-xl font-bold tracking-wide">Mementa</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-[#0F2B5B] font-bold hover:text-[#C49A22] transition-colors text-sm">
              Home
            </Link>
            <Link href="/#features" className="text-[#0F2B5B] font-bold hover:text-[#C49A22] transition-colors text-sm">
              Features
            </Link>
            <Link href="/contact" className="text-[#0F2B5B] font-bold hover:text-[#C49A22] transition-colors text-sm">
              Contact Us
            </Link>
            {loggedIn ? (
              <>
                <Link href="/dashboard" className="text-[#0F2B5B] font-bold hover:text-[#C49A22] transition-colors text-sm">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[#0F2B5B] font-bold hover:text-[#C49A22] transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-[#0F2B5B] font-bold hover:text-[#C49A22] transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#C49A22] hover:bg-[#B8860B] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-[#0F2B5B] p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 flex flex-col gap-3">
            <Link href="/" className="text-[#0F2B5B] font-bold hover:text-[#C49A22] text-sm" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/#features" className="text-[#0F2B5B] font-bold hover:text-[#C49A22] text-sm" onClick={() => setMenuOpen(false)}>
              Features
            </Link>
            <Link href="/contact" className="text-[#0F2B5B] font-bold hover:text-[#C49A22] text-sm" onClick={() => setMenuOpen(false)}>
              Contact Us
            </Link>
            {loggedIn ? (
              <>
                <Link href="/dashboard" className="text-[#0F2B5B] font-bold hover:text-[#C49A22] text-sm" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-[#0F2B5B] font-bold hover:text-[#C49A22] text-sm text-left">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[#0F2B5B] font-bold hover:text-[#C49A22] text-sm" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#C49A22] hover:bg-[#B8860B] text-white px-4 py-2 rounded-lg text-sm font-semibold inline-block"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
