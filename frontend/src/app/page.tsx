'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <span className="text-2xl font-bold text-white">Cerdik<span className="text-indigo-400">AI</span></span>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Masuk</Link>
          <Link href="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Daftar</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-32 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          AI untuk <span className="text-indigo-400">Guru</span> Indonesia
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Hasilkan Modul Ajar, LKPD, dan Soal otomatis dengan AI. Kelola ujian online dengan fitur anti-curang.
        </p>

        <div className="flex gap-4 justify-center mb-20">
          <Link href="/register" className="px-8 py-3 bg-indigo-600 text-white rounded-lg text-lg font-medium hover:bg-indigo-700 transition-colors">
            Mulai Gratis
          </Link>
          <Link href="/login" className="px-8 py-3 bg-slate-800 text-slate-300 rounded-lg text-lg font-medium hover:bg-slate-700 transition-colors">
            Sudah Punya Akun
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            { icon: '🤖', title: 'AI Generator', desc: 'Buat Modul Ajar, LKPD, dan soal dari PDF dengan sekali klik.' },
            { icon: '📝', title: 'Ujian Online', desc: 'PIN, timer, random soal, fullscreen, deteksi pindah tab.' },
            { icon: '📊', title: 'Analisis Nilai', desc: 'Rekap nilai otomatis, analisis butir soal, gradebook.' },
          ].map((f) => (
            <div key={f.title} className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
