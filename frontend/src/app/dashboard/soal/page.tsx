'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import DownloadButtons from '@/components/shared/DownloadButtons';

function RulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-3">Syarat PDF</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex gap-2">📄 Format: PDF (pastikan bukan hasil scan/langsung dari word/doc)</li>
          <li className="flex gap-2">📏 Maksimal 20MB</li>
          <li className="flex gap-2">📝 Harus mengandung teks yang bisa di-copy (bukan gambar)</li>
          <li className="flex gap-2">🔤 Gunakan font standar (Times New Roman, Arial, Calibri)</li>
          <li className="flex gap-2">📖 Minimal 1 halaman</li>
        </ul>
        <button onClick={onClose} className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">Mengerti</button>
      </div>
    </div>
  );
}

export default function GenerateSoalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jumlah, setJumlah] = useState('15');
  const [jenis, setJenis] = useState('campuran');
  const jenisLabel: Record<string, string> = { 'pilihan ganda': 'Pilihan Ganda', 'isian singkat': 'Isian Singkat', 'uraian': 'Uraian', 'campuran': 'Campuran (PG + Isian + Uraian)' };
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({
    mapel: '', kelas: 'III', semester: 'Genap', waktu: '90 Menit',
    sekolah: '', alamat: '', npsn: '', email_sekolah: '', tahun_pelajaran: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showRules, setShowRules] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File) => {
    const maxSize = 20 * 1024 * 1024;
    if (f.size > maxSize) { toast.error('File maksimal 20MB'); return false; }
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) { toast.error('Hanya file PDF'); return false; }
    return true;
  };

  const handleFile = (f: File) => {
    if (validateFile(f)) setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Pilih file PDF');
    setLoading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('jumlah_soal', jumlah);
      fd.append('jenis', jenis);
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      const res = await api.post('/ai/generate-from-pdf', fd);
      setResult(res.data.data);
      toast.success('Soal berhasil dibuat!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal generate soal');
    } finally { setLoading(false); }
  };

  const renderSoal = (soal: any[]) => {
    if (!Array.isArray(soal)) return null;
    return soal.map((s: any) => (
      <div key={s.nomor} className="mb-3">
        <p className="text-sm">{s.nomor}. {s.pertanyaan}</p>
        {s.opsi && (
          <div className="pl-6 mt-1 text-sm">
            {Object.entries(s.opsi).map(([k, v]: any) => (
              <p key={k}>{k}. {v}</p>
            ))}
          </div>
        )}
        {!s.opsi && jenis !== 'pilihan ganda' && (
          <div className="mt-2 space-y-1">
            {[...Array(jenis === 'isian singkat' ? 1 : 3)].map((_, i) => (
              <div key={i} className="border-b border-dotted border-gray-400 h-6" />
            ))}
          </div>
        )}
      </div>
    ));
  };

  const renderBagian = (bag: any) => {
    if (!bag) return null;
    return (
      <div className={bag.label && bag.label !== 'I' ? 'mt-6' : 'mb-6'}>
        <p className="font-bold text-sm mb-2">{bag.label || ''}. {bag.petunjuk}</p>
        {renderSoal(bag.soal)}
      </div>
    );
  };

  const renderExam = () => {
    if (!result?.content) return null;
    const c = result.content;
    return (
      <div className="bg-white text-black rounded-2xl p-8 shadow-lg border border-slate-200" style={{ fontFamily: "'Times New Roman', serif", fontSize: '12pt', lineHeight: '1.6' }}>
        <div className="text-center mb-6">
          <p className="font-bold text-sm">{c.pemerintah || 'PEMERINTAH KABUPATEN ...'}</p>
          <p className="font-bold text-sm">{c.dinas || 'DINAS PENDIDIKAN'}</p>
          <p className="font-bold text-base underline underline-offset-2">{c.sekolah || ''}</p>
          <p className="text-xs mt-1">{c.alamat || ''}</p>
          <p className="text-xs">NPSN: {c.npsn || ''}, Email: {c.email || ''}</p>
        </div>

        <div className="text-center mb-4">
          <p className="font-bold text-base">{c.judul || 'ASESMEN SUMATIF AKHIR TAHUN (ASAT)'}</p>
          <p className="font-bold text-sm">{c.tahun_pelajaran || ''}</p>
        </div>

        {c.info && (
          <table className="w-full text-xs mb-6 border-collapse">
            <tbody>
              <tr><td className="w-1/3 py-1"><span className="font-semibold">Muatan Pelajaran</span></td><td className="w-1/3">: {c.info.muatan_pelajaran || '…'}</td><td className="w-1/6"><span className="font-semibold">Nama</span></td><td className="w-1/6">: …………………</td></tr>
              <tr><td className="py-1"><span className="font-semibold">Kelas/ Semester</span></td><td>: {c.info.kelas_semester || '…'}</td><td><span className="font-semibold">Hari/tgl</span></td><td>: …………………</td></tr>
              <tr><td className="py-1"><span className="font-semibold">Waktu</span></td><td>: {c.info.waktu || '…'}</td><td colSpan={2}></td></tr>
            </tbody>
          </table>
        )}

        {renderBagian(c.bagian_1)}
        {renderBagian(c.bagian_2)}
        {renderBagian(c.bagian_3)}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Generate Soal dari PDF</h1>
          <p className="text-slate-400 text-sm mt-1">Upload PDF pelajaran, AI akan buatkan soal ASAT otomatis</p>
        </div>
        <button onClick={() => setShowRules(true)} className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors">
          <span>📋</span> Syarat PDF
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="space-y-4 h-fit">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
              dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 bg-slate-800/40 hover:border-slate-500'
            }`}>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
            {file ? (
              <div>
                <div className="text-3xl mb-2">📄</div>
                <p className="text-sm text-white font-medium">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-xs text-red-400 hover:text-red-300 mt-2">Hapus</button>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-3 text-slate-500">📄</div>
                <p className="text-sm text-slate-300">Seret file PDF ke sini</p>
                <p className="text-xs text-slate-500 mt-1">atau klik untuk memilih file</p>
              </div>
            )}
          </div>

          <button type="button" onClick={() => setShowRules(true)} className="md:hidden w-full py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors">
            📋 Syarat PDF
          </button>

          <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Jumlah Soal</label>
                <input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} min={1} max={30}
                  className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Jenis</label>
                  <select value={jenis} onChange={(e) => setJenis(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
                    <option value="campuran">Campuran (PG + Isian + Uraian)</option>
                    <option value="pilihan ganda">Pilihan Ganda</option>
                    <option value="isian singkat">Isian Singkat</option>
                    <option value="uraian">Uraian</option>
                  </select>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition-colors">
              <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span> Info Kop Sekolah (opsional)
            </button>

            {showAdvanced && (
              <div className="space-y-3 animate-fade-in border-t border-slate-700 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Nama Sekolah</label>
                    <input type="text" value={form.sekolah} onChange={(e) => setForm({ ...form, sekolah: e.target.value })} placeholder="SD NEGERI CANGKRING 04"
                      className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Alamat</label>
                    <input type="text" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Jl. Raya Laswi No. 251"
                      className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">NPSN</label>
                    <input type="text" value={form.npsn} onChange={(e) => setForm({ ...form, npsn: e.target.value })} placeholder="20207983"
                      className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email Sekolah</label>
                    <input type="email" value={form.email_sekolah} onChange={(e) => setForm({ ...form, email_sekolah: e.target.value })} placeholder="sdcangkring4@yahoo.co.id"
                      className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Kelas</label>
                    <input type="text" value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} placeholder="III"
                      className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Semester</label>
                    <input type="text" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="Genap"
                      className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Waktu</label>
                    <input type="text" value={form.waktu} onChange={(e) => setForm({ ...form, waktu: e.target.value })} placeholder="90 Menit"
                      className="w-full px-3 py-2 text-sm bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || !file}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-600/10">
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner /> Memproses...</span> : 'Generate Soal'}
            </button>
          </div>
        </form>

        <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil</h2>
          {loading && <LoadingState />}
          {!loading && !result && <EmptyState />}
          {result && (
            <div className="max-h-[600px] overflow-y-auto space-y-4">
              {renderExam()}
              <div className="mt-4"><DownloadButtons id={result.id} /></div>
            </div>
          )}
        </div>
      </div>

      <RulesModal open={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
      <p className="text-sm">Membaca PDF dan menulis soal...</p>
      <p className="text-xs text-slate-600 mt-1">Biasanya 30-60 detik</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
      <div className="text-4xl mb-3">📄</div>
      <p className="text-sm text-slate-500">Upload PDF dan klik Generate</p>
    </div>
  );
}

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}
