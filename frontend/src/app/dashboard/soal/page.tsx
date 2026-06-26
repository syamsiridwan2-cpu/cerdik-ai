'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const downloadDoc = async (id: number, ext: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/documents/${id}/export-${ext}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return toast.error('Gagal download');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `soal.${ext}`; a.click();
  URL.revokeObjectURL(url);
};

function RulesModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-slate-600 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">📄</span>
          <h3 className="text-lg font-semibold text-white">Syarat File PDF</h3>
        </div>
        <ul className="space-y-2 text-sm text-slate-300 mb-6">
          <li className="flex gap-2">
            <span className="text-amber-400 shrink-0">📌</span>
            <span>Format: <b className="text-white">PDF</b> (bukan JPG/PNG hasil scan)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400 shrink-0">📌</span>
            <span>Maksimal ukuran file: <b className="text-white">20MB</b></span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400 shrink-0">📌</span>
            <span>File harus mengandung teks yang bisa di-<i>copy</i>, bukan gambar scan</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400 shrink-0">📌</span>
            <span>Minimal <b className="text-white">50 karakter</b> teks terbaca agar bisa diproses AI</span>
          </li>
        </ul>
        <p className="text-xs text-slate-500 mb-4">
          💡 PDF dari buku digital / e-book biasanya mendukung teks. 
          Scan dokumen fisik perlu di-OCR dulu (pakai Google Docs, Smallpdf, atau ilovepdf).
        </p>
        <button onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          Mengerti
        </button>
      </div>
    </div>
  );
}

export default function GenerateSoalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jumlah, setJumlah] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showRules, setShowRules] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): boolean => {
    if (f.type !== 'application/pdf') {
      toast.error('File harus berformat PDF');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      return false;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('File maksimal 20MB');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Pilih file PDF');
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('jumlah_soal', String(jumlah));
      fd.append('jenis', 'pilihan ganda');
      const res = await api.post('/ai/generate-from-pdf', fd);
      setResult(res.data.data);
      toast.success('Soal berhasil dibuat!');
    } catch (err: any) {
      console.error('Generate soal error:', err);
      const msg = err.response?.data?.message || err.message || 'Gagal generating soal';
      if (msg.includes('Teks tidak ditemukan')) {
        setShowRules(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Generate Soal dari PDF</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm text-slate-400">Upload File PDF</label>
              <button type="button" onClick={() => setShowRules(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                Syarat PDF
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (f && !validateFile(f)) return;
              setFile(f);
            }} required
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-indigo-600 file:text-white focus:outline-none focus:border-indigo-500" />
            <p className="text-xs text-slate-500 mt-1">Maks 20MB, format PDF dengan teks (bukan hasil scan)</p>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Jumlah Soal</label>
            <input type="number" value={jumlah} onChange={(e) => setJumlah(Math.min(20, Math.max(1, +e.target.value)))}
              min={1} max={20} required
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Memproses...' : 'Generate Soal'}
          </button>
        </form>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil Soal</h2>
          {loading && <p className="text-slate-400">AI sedang membaca PDF dan membuat soal...</p>}
          {!loading && !result && <p className="text-slate-500">Upload PDF dan klik Generate</p>}
          {result && (
            <div className="max-h-[500px] overflow-y-auto space-y-4">
              {(Array.isArray(result.content) ? result.content : []).map((soal: any, i: number) => (
                <div key={i} className="p-3 bg-slate-700/30 rounded-lg">
                  <p className="text-sm font-medium text-white mb-2">{i + 1}. {soal.pertanyaan}</p>
                  <div className="grid grid-cols-2 gap-1 text-xs ml-4">
                    {soal.opsi && Object.entries(soal.opsi).map(([k, v]: any) => (
                      <div key={k} className={`p-1 rounded ${k === soal.jawaban ? 'text-green-400 bg-green-600/10' : 'text-slate-400'}`}>
                        {k}. {v}
                      </div>
                    ))}
                  </div>
                  {soal.pembahasan && (
                    <details className="mt-2">
                      <summary className="text-xs text-indigo-400 cursor-pointer">Pembahasan</summary>
                      <p className="text-xs text-slate-400 mt-1">{soal.pembahasan}</p>
                    </details>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-slate-700">
                <button onClick={() => downloadDoc(result.id, 'docx')}
                  className="text-sm text-indigo-400 hover:underline mr-4">Download DOCX</button>
                <button onClick={() => downloadDoc(result.id, 'pdf')}
                  className="text-sm text-indigo-400 hover:underline">Download PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <RulesModal show={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
