'use client';

import { useEffect, useState } from 'react';
import { getPDF } from '@/lib/storage';

interface PDFViewerProps {
  programId: string;
  height?: string;
}

export default function PDFViewer({ programId, height = '700px' }: PDFViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function loadPDF() {
      try {
        const blob = await getPDF(programId);
        if (!blob) {
          setError('PDF not found. It may have been removed or this device does not have it stored.');
          setLoading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (e) {
        setError('Failed to load PDF.');
      } finally {
        setLoading(false);
      }
    }

    loadPDF();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-xl" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2B5B] mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
        style={{ height }}
      >
        <div className="text-center p-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200" style={{ height }}>
      <iframe
        src={blobUrl}
        className="w-full h-full"
        title="Funeral Program PDF"
      />
    </div>
  );
}
