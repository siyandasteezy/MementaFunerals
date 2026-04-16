'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import PDFViewer from '@/components/PDFViewer';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { getProgram } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { Program } from '@/lib/types';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    const p = getProgram(id);
    if (!p || (user && p.userId !== user.id)) {
      router.push('/dashboard');
      return;
    }
    setProgram(p);
    setLoading(false);
  }, [id, router]);

  function handleCopyLink() {
    const url = `${window.location.origin}/view/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2B5B]" />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!program) return null;

  const eventDate = program.eventDate
    ? new Date(program.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <Link href="/dashboard" className="hover:text-[#0F2B5B] transition-colors">
                Dashboard
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-700">{program.deceasedName}</span>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#0F2B5B] to-[#1a3d7c] rounded-2xl p-8 mb-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-blue-200 text-sm mb-1 uppercase tracking-wider font-medium">
                    Funeral Program
                  </p>
                  <h1 className="text-3xl font-extrabold">{program.deceasedName}</h1>
                  <p className="text-blue-300 text-lg mt-1">
                    {program.birthYear} – {program.deathYear}
                  </p>
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
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>
                  <a
                    href={`/view/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#C49A22] hover:bg-[#B8860B] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Public View
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PDF Viewer */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#0F2B5B] mb-4">Program PDF</h2>
                  <PDFViewer programId={id} height="650px" />
                </div>
              </div>

              {/* QR Code & Info */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#0F2B5B] mb-4">QR Code</h2>
                  <QRCodeDisplay programId={id} size={200} />
                  <p className="text-xs text-gray-400 text-center mt-3">
                    Print and display at the venue for instant access
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-[#0F2B5B] mb-4">Program Info</h2>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-400">Created</dt>
                      <dd className="text-gray-700 font-medium">
                        {new Date(program.createdAt).toLocaleDateString()}
                      </dd>
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
