'use client';

import Link from 'next/link';
import { Program } from '@/lib/types';
import { deleteProgram } from '@/lib/storage';

interface ProgramCardProps {
  program: Program;
  onDeleted?: () => void;
}

export default function ProgramCard({ program, onDeleted }: ProgramCardProps) {
  function handleDelete() {
    if (confirm(`Are you sure you want to delete the program for ${program.deceasedName}?`)) {
      deleteProgram(program.id);
      onDeleted?.();
    }
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/view/${program.id}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  }

  const eventDate = program.eventDate
    ? new Date(program.eventDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header gradient */}
      <div className="bg-gradient-to-br from-[#0F2B5B] to-[#1a3d7c] h-28 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-white/70 text-xs">Funeral Program</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-[#0F2B5B] text-lg leading-tight truncate">
          {program.deceasedName}
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          {program.birthYear} – {program.deathYear}
        </p>
        {eventDate && (
          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {eventDate}
          </p>
        )}
        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {program.views || 0} views
        </p>

        {/* Actions */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <Link
            href={`/programs/${program.id}`}
            className="flex-1 text-center bg-[#0F2B5B] hover:bg-[#1a3d7c] text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            View
          </Link>
          <button
            onClick={handleCopyLink}
            className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            Share
          </button>
          <Link
            href={`/programs/${program.id}`}
            className="flex-1 text-center bg-[#C49A22] hover:bg-[#B8860B] text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            QR
          </Link>
        </div>

        <button
          onClick={handleDelete}
          className="mt-2 w-full text-center text-red-400 hover:text-red-600 text-xs py-1 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
