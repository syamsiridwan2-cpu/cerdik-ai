import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'CerdikAI - Aplikasi AI untuk Guru',
  description: 'Hasilkan Modul Ajar, LKPD, dan Soal dengan AI. Kelola ujian online dengan mudah.',
  icons: {
    icon: [
      { url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><rect width=%2232%22 height=%2232%22 rx=%224%22 fill=%22%236366f1%22/><text x=%2216%22 y=%2222%22 font-size=%2218%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22Arial,sans-serif%22 font-weight=%22bold%22>C</text></svg>', type: 'image/svg+xml' },
    ],
  },
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
