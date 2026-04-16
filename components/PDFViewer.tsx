'use client';

interface PDFViewerProps {
  url: string;
  height?: string;
}

export default function PDFViewer({ url, height = '700px' }: PDFViewerProps) {
  if (!url) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
        style={{ height }}
      >
        <div className="text-center p-8">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 text-sm">PDF not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-gray-200" style={{ height }}>
      <iframe src={url} className="w-full h-full" title="Funeral Program PDF" />
    </div>
  );
}
