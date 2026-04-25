'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeDisplayProps {
  programId: string;
  size?: number;
}

export default function QRCodeDisplay({ programId, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/view/?id=${programId}`
      : `http://localhost:3000/view/?id=${programId}`;

  function handleDownload() {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `mementa-qr-${programId}.png`;
    a.click();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={canvasRef} className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <QRCodeCanvas
          value={url}
          size={size}
          fgColor="#0F2B5B"
          bgColor="#FFFFFF"
          level="H"
          includeMargin
        />
      </div>
      <p className="text-xs text-gray-500 text-center max-w-xs break-all">{url}</p>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 bg-[#C49A22] hover:bg-[#B8860B] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR Code
      </button>
    </div>
  );
}
