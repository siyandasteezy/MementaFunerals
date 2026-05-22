'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import PDFViewer from '@/components/PDFViewer';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import ProgramCard from '@/components/ProgramCard';
import { getProgram, getPDFUrl, getAllPrograms } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { Program } from '@/lib/types';

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center pt-14 md:pt-0">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2B5B]" />
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ─── Programs List ────────────────────────────────────────────────────────────
function ProgramsList() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState('');

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const all = await getAllPrograms(user.id);
      setPrograms(all);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load programs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 pt-16 sm:p-6 md:p-8 md:pt-8">
          <div className="max-w-6xl mx-auto">

            {fetchError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {fetchError}
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F2B5B]">My Programs</h1>
                <p className="text-gray-500 mt-1 text-sm">
                  {programs.length === 0 ? 'No programs yet' : `${programs.length} program${programs.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <Link
                href="/create"
                className="flex items-center gap-1.5 bg-[#C49A22] hover:bg-[#B8860B] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Program
              </Link>
            </div>

            {/* Empty state */}
            {programs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No programs yet</h3>
                <p className="text-gray-400 text-sm mb-6">Create your first digital funeral program and share it with a QR code.</p>
                <Link href="/create"
                  className="inline-flex items-center gap-2 bg-[#0F2B5B] hover:bg-[#1a3d7c] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Program
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {programs.map((program) => (
                  <ProgramCard key={program.id} program={program} onDeleted={load} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ─── Program Detail ───────────────────────────────────────────────────────────
function ProgramDetail({ id }: { id: string }) {
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [pdfUrl, setPdfUrl]   = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const p = await getProgram(id);
      if (!p || p.userId !== user.id) { router.push('/programs'); return; }
      setProgram(p);
      setPdfUrl(getPDFUrl(id));
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) return <Spinner />;
  if (!program) return null;

  const eventDate = program.eventDate
    ? new Date(program.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  function handleCopyLink() {
    const url = `${window.location.origin}/view/?id=${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 pt-16 sm:p-6 md:p-8 md:pt-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 sm:mb-6">
              <Link href="/programs" className="hover:text-[#0F2B5B] transition-colors">My Programs</Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-700">{program.deceasedName}</span>
            </div>

            <div className="bg-gradient-to-br from-[#0F2B5B] to-[#1a3d7c] rounded-2xl p-4 sm:p-6 md:p-8 mb-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-blue-200 text-xs sm:text-sm mb-1 uppercase tracking-wider font-medium">Funeral Program</p>
                  <h1 className="text-xl sm:text-3xl font-extrabold">{program.deceasedName}</h1>
                  <p className="text-blue-300 text-lg mt-1">{program.birthYear} – {program.deathYear}</p>
                  {eventDate && (
                    <p className="text-blue-200 text-sm mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {eventDate}
                    </p>
                  )}
                  {program.eventLocation && (
                    <p className="text-blue-200 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {program.eventLocation}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={handleCopyLink}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm">
                    {copied ? (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Link</>
                    )}
                  </button>
                  <a href={`/view/?id=${id}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#C49A22] hover:bg-[#B8860B] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Public View
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#0F2B5B] mb-4">Program PDF</h2>
                  <PDFViewer url={pdfUrl} height="650px" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#0F2B5B] mb-4">QR Code</h2>
                  <QRCodeDisplay programId={id} size={200} />
                  <p className="text-xs text-gray-400 text-center mt-3">Print and display at the venue for instant access</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#0F2B5B] mb-4">Program Info</h2>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-400">Created</dt>
                      <dd className="text-gray-700 font-medium">{new Date(program.createdAt).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Total Views</dt>
                      <dd className="text-gray-700 font-medium">{program.views || 0}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400">Program ID</dt>
                      <dd className="text-gray-500 font-mono text-xs break-all">{id}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// ─── Root component — decides which view to render ───────────────────────────
export default function ProgramsPage() {
  const [id, setId]       = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setId(params.get('id'));
    setReady(true);
  }, []);

  if (!ready) return <Spinner />;
  if (id)     return <ProgramDetail id={id} />;
  return <ProgramsList />;
}
