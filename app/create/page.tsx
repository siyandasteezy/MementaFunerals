'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { supabase } from '@/lib/supabase';
import { saveProgram, savePDF } from '@/lib/storage';
import { isSubscriptionActive } from '@/lib/subscriptions';

type Step = 1 | 2 | 3;

export default function CreatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [deceasedName, setDeceasedName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  function handleFileSelect(file: File) {
    if (file.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    if (file.size > 50 * 1024 * 1024) { setError('File size must be under 50MB.'); return; }
    setError('');
    setPdfFile(file);
    setStep(2);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleSave() {
    if (!pdfFile) return;
    setError('');
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const active = await isSubscriptionActive(user.id);
      if (!active) {
        router.push('/subscribe?reason=expired');
        return;
      }

      const program = await saveProgram({
        userId: user.id,
        deceasedName,
        birthYear,
        deathYear,
        eventDate,
        eventLocation,
      });

      await savePDF(program.id, pdfFile);
      router.push(`/programs/?id=${program.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save program. Please try again.');
      setSaving(false);
    }
  }

  const stepLabels = ['Upload PDF', 'Program Details', 'Preview & Save'];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#0F2B5B]">Create New Program</h1>
              <p className="text-gray-500 mt-1">Upload a funeral program PDF and generate a shareable QR code.</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-0 mb-8">
              {stepLabels.map((label, i) => {
                const num = i + 1;
                const isActive = step === num;
                const isDone = step > num;
                return (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-[#0F2B5B] text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {isDone ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : num}
                      </div>
                      <span className={`text-xs mt-1 font-medium ${isActive ? 'text-[#0F2B5B]' : isDone ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${step > num ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

            {/* Step 1 */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-[#0F2B5B] mb-2">Upload PDF Program</h2>
                <p className="text-gray-500 text-sm mb-6">Upload the funeral program PDF. Supported: PDF files up to 50MB.</p>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging ? 'border-[#C49A22] bg-amber-50' : 'border-gray-200 hover:border-[#0F2B5B] hover:bg-blue-50'}`}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className={`w-8 h-8 ${isDragging ? 'text-[#C49A22]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-semibold text-lg mb-1">{isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF'}</p>
                  <p className="text-gray-400 text-sm">or click to browse files</p>
                  <p className="text-gray-300 text-xs mt-3">PDF files only, max 50MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{pdfFile?.name}</p>
                    <p className="text-xs text-gray-400">{pdfFile ? (pdfFile.size / 1024 / 1024).toFixed(2) + ' MB' : ''}</p>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-[#0F2B5B] mb-6">Program Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name of Deceased <span className="text-red-400">*</span></label>
                    <input type="text" required value={deceasedName} onChange={(e) => setDeceasedName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent"
                      placeholder="e.g. John Michael Smith" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birth Year <span className="text-red-400">*</span></label>
                      <input type="text" required value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent"
                        placeholder="1945" maxLength={4} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Death Year <span className="text-red-400">*</span></label>
                      <input type="text" required value={deathYear} onChange={(e) => setDeathYear(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent"
                        placeholder="2024" maxLength={4} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                    <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Location</label>
                    <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2B5B] focus:border-transparent"
                      placeholder="e.g. Grace Baptist Church, Atlanta, GA" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="px-5 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">Back</button>
                  <button onClick={() => { if (!deceasedName || !birthYear || !deathYear) { setError('Please fill in the required fields.'); return; } setError(''); setStep(3); }}
                    className="flex-1 bg-[#0F2B5B] hover:bg-[#1a3d7c] text-white py-3 rounded-lg text-sm font-semibold transition-colors">Continue to Preview</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-[#0F2B5B] mb-6">Preview & Save</h2>
                <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Full Name</span><span className="font-semibold text-gray-800">{deceasedName}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Years</span><span className="font-semibold text-gray-800">{birthYear} – {deathYear}</span></div>
                  {eventDate && <div className="flex justify-between text-sm"><span className="text-gray-500">Event Date</span><span className="font-semibold text-gray-800">{new Date(eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>}
                  {eventLocation && <div className="flex justify-between text-sm"><span className="text-gray-500">Location</span><span className="font-semibold text-gray-800">{eventLocation}</span></div>}
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-3 mt-2"><span className="text-gray-500">PDF File</span><span className="font-semibold text-gray-800">{pdfFile?.name}</span></div>
                </div>
                <p className="text-sm text-gray-500 mb-6">Once saved, a QR code will be generated that links to the public viewer page. Anyone with the link or QR code can view this program.</p>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="px-5 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">Back</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 bg-[#C49A22] hover:bg-[#B8860B] disabled:opacity-70 text-white py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Saving...</> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>Save & Generate QR Code</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
