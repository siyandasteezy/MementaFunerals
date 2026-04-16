'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProgram, getPDFUrl, updateProgramViews } from '@/lib/storage';
import { Program } from '@/lib/types';

export default function PublicViewPage() {
  const params = useParams();
  const id = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const p = await getProgram(id);
        if (!p) {
          setError('Program not found. The link may be invalid or the program has been removed.');
          setLoading(false);
          return;
        }
        setProgram(p);
        setPdfUrl(getPDFUrl(id));
        updateProgramViews(id); // fire and forget
      } catch {
        setError('An error occurred while loading this program.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F2B5B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-[#C49A22] mx-auto mb-4" />
          <p className="text-blue-200 text-sm">Loading program...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-[#0F2B5B] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Program Not Found</h2>
          <p className="text-blue-200 mb-6">{error || 'This program could not be loaded.'}</p>
          <Link href="/" className="inline-block bg-[#C49A22] hover:bg-[#B8860B] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
            Go to Mementa
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = program.eventDate
    ? new Date(program.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-[#0F2B5B] text-white py-3 px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="Mementa" fill className="object-contain" />
            </div>
            <span className="font-bold text-sm">Mementa</span>
          </Link>
          <span className="text-blue-200 text-xs">Digital Funeral Program</span>
        </div>
      </header>

      <div className="bg-gradient-to-br from-[#0F2B5B] via-[#1a3d7c] to-[#0F2B5B] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs mb-5 uppercase tracking-wider">
            In Loving Memory
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">{program.deceasedName}</h1>
          <p className="text-blue-300 text-xl font-light">{program.birthYear} &mdash; {program.deathYear}</p>
          {eventDate && (
            <p className="text-blue-200 text-sm mt-3 flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {eventDate}
            </p>
          )}
          {program.eventLocation && (
            <p className="text-blue-200 text-sm mt-1.5 flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {program.eventLocation}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
          <iframe src={pdfUrl} className="w-full" style={{ height: '80vh', minHeight: '500px' }}
            title={`Funeral Program for ${program.deceasedName}`} />
        </div>
      </div>

      <footer className="bg-[#0F2B5B] text-blue-200 py-6 px-4 text-center text-xs">
        <p>Shared via{' '}
          <Link href="/" className="text-[#C49A22] hover:text-[#B8860B] font-semibold">Mementa</Link>
          {' '}— Honor. Share. Remember.
        </p>
      </footer>
    </div>
  );
}
