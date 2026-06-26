import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'CerdikAI - Aplikasi AI untuk Guru',
  description: 'Hasilkan Modul Ajar, LKPD, dan Soal dengan AI. Kelola ujian online dengan mudah.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-bg-dark text-text">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
