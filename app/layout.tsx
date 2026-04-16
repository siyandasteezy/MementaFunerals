import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mementa — Honor. Share. Remember.',
  description:
    'Create beautiful digital programs for funerals and important life events. Upload PDFs, generate QR codes, and share with loved ones.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
