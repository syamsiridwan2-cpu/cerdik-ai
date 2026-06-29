import Link from 'next/link';

const features = [
  { icon: '🤖', title: 'AI Generator', desc: 'Buat modul ajar, LKPD, RPP, kisi-kisi, dan rubrik otomatis dengan AI.' },
  { icon: '✍️', title: 'Ujian Online', desc: 'Buat ujian dengan PIN, timer, fullscreen, dan anti-kecurangan.' },
  { icon: '📊', title: 'Analisis & Laporan', desc: 'Lihat hasil ujian, statistik siswa, dan export ke DOCX/PDF.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">C</div>
          <span className="text-xl font-bold text-white">Cerdik<span className="text-indigo-400">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">Masuk</Link>
          <Link href="/register" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">Daftar</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
          AI untuk Guru Indonesia
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
          Bantu Guru <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Berkreasi</span>
          <br />dengan Kecerdasan Buatan
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          CerdikAI membantu guru Indonesia membuat modul ajar, LKPD, RPP 1 Lembar, kisi-kisi soal, rubrik penilaian, 
          dan ujian online secara instan dengan teknologi AI terkini.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40">
            Mulai Gratis
          </Link>
          <Link href="/login" className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all duration-200 border border-slate-700">
            Sudah Punya Akun
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-600">
        <p>&copy; 2026 CerdikAI. Dibuat untuk guru Indonesia.</p>
      </footer>
    </div>
  );
}
