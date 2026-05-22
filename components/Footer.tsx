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
                <li>
                  <a
                    href={`https://wa.me/${COMPANY_PROFILE.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi Mementa, I need some help.')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.117 1.522 5.85L.057 23.429a.75.75 0 00.914.914l5.579-1.465A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.693 9.693 0 01-4.964-1.365.75.75 0 00-.574-.077l-3.916.029.029-3.916a.75.75 0 00-.077-.574A9.693 9.693 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
                    </svg>
                    WhatsApp Support
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
