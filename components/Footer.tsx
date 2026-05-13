'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LegalModal from '@/components/LegalModal';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, REFUND_POLICY, COMPANY_PROFILE } from '@/lib/legal';

type ModalType = 'terms' | 'privacy' | 'refund' | null;

const MODAL_META: Record<Exclude<ModalType, null>, { title: string; content: string }> = {
  terms:   { title: 'Terms and Conditions',           content: TERMS_AND_CONDITIONS },
  privacy: { title: 'Privacy & POPIA Policy',         content: PRIVACY_POLICY },
  refund:  { title: 'Refund and Cancellation Policy', content: REFUND_POLICY },
};

export default function Footer() {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      {modal && (
        <LegalModal
          title={MODAL_META[modal].title}
          content={MODAL_META[modal].content}
          onClose={() => setModal(null)}
        />
      )}

      <footer className="bg-[#0a1f44] text-blue-200 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="relative w-36 h-10 rounded-lg overflow-hidden mb-3">
                <Image src="/mementa-logo.png" alt="Mementa" fill className="object-contain object-left" />
              </div>
              <p className="text-blue-300 text-sm leading-relaxed">
                Honouring lives with beautiful digital programmes and instant QR sharing.
              </p>
              <p className="text-blue-400 text-xs mt-3">{COMPANY_PROFILE.address}</p>
            </div>

            {/* Product */}
            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Product</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Support</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li>
                  <a href={`mailto:${COMPANY_PROFILE.email}`} className="hover:text-white transition-colors">
                    {COMPANY_PROFILE.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${COMPANY_PROFILE.phone}`} className="hover:text-white transition-colors">
                    {COMPANY_PROFILE.phone}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Legal</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setModal('terms')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Terms &amp; Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModal('privacy')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Privacy &amp; POPIA Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModal('refund')}
                    className="hover:text-white transition-colors text-left"
                  >
                    Refund &amp; Cancellation Policy
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-400">
            <p>&copy; {new Date().getFullYear()} {COMPANY_PROFILE.tradingAs} ({COMPANY_PROFILE.name}). All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setModal('terms')}   className="hover:text-white transition-colors">Terms</button>
              <button onClick={() => setModal('privacy')} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => setModal('refund')}  className="hover:text-white transition-colors">Refunds</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
