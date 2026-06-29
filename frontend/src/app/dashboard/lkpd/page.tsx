'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import DownloadButtons from '@/components/shared/DownloadButtons';

export default function GenerateLkpdPage() {
  const [form, setForm] = useState({ materi: '', kelas: '3', mapel: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/generate-lkpd', form);
      setResult(res.data.data);
      toast.success('LKPD berhasil dibuat!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal generating LKPD');
    } finally {
      setLoading(false);
    }
  };

  const renderLkpd = () => {
    const c = result?.content;
    if (!c) return null;
    return (
      <div className="text-white space-y-5" style={{ fontFamily: "'Times New Roman', serif", fontSize: '11pt' }}>
        <div>
          <h2 className="text-lg font-bold text-green-400">{c.judul || 'Lembar Kerja Peserta Didik'}</h2>
          <p className="text-sm text-slate-400">
            Mapel: {c.mapel || '-'} | Kelas: {c.kelas || '-'} | Materi: {c.materi || '-'}
          </p>
        </div>

        {c.petunjuk_pengerjaan && (
          <div>
            <h3 className="font-bold text-green-300 mb-1">A. Petunjuk Pengerjaan:</h3>
            <ol className="list-decimal list-inside text-sm space-y-0.5 text-slate-300">
              {c.petunjuk_pengerjaan.map((p: string, i: number) => <li key={i}>{p}</li>)}
            </ol>
          </div>
        )}

        <div>
          <h3 className="font-bold text-green-300 mb-2">B. Kegiatan LKPD:</h3>

          {c.kegiatan_lkpd?.mindfull_learning && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-green-200 mb-1">1. Mindfull Learning (Fokus dan Kesadaran Penuh)</h4>
              {c.kegiatan_lkpd.mindfull_learning.map((s: any, i: number) => (
                <div key={i} className="mb-2 text-sm">
                  <p className="text-slate-300">Soal {s.nomor || i + 1}: {s.soal}</p>
                  <p className="text-slate-500 italic">Jawaban: ___________________</p>
                </div>
              ))}
            </div>
          )}

          {c.kegiatan_lkpd?.joyfull_learning && (
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-green-200 mb-1">2. Joyfull Learning (Pembelajaran Menyenangkan)</h4>
              {c.kegiatan_lkpd.joyfull_learning.map((s: any, i: number) => (
                <div key={i} className="mb-2 text-sm">
                  <p className="text-slate-300">Soal {s.nomor || i + 3}: {s.soal}</p>
                  <p className="text-slate-500 italic">Jawaban: ___________________</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {c.lingkungan && (
          <div>
            <h3 className="font-bold text-green-300 mb-2">{c.lingkungan.sub_judul || 'C. Lingkungan'}</h3>
            <p className="font-semibold text-sm text-green-200 mb-1">Ayo, Berlatih</p>
            {c.lingkungan.kegiatan?.map((kg: any, i: number) => (
              <div key={i} className="mb-3 text-sm">
                <p className="font-medium text-slate-200">{kg.judul}</p>
                <p className="text-slate-300 mb-1">{kg.instruksi}</p>
                {kg.tipe === 'centang' && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="border border-slate-500 w-4 h-4 inline-block" /> Beri tanda centang (v)
                  </div>
                )}
                {kg.soal?.map((q: string, qi: number) => (
                  <p key={qi} className="text-slate-400 ml-4">{q}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {c.bahan_bacaan && (
          <div>
            <h3 className="font-bold text-green-300 mb-2">D. {c.bahan_bacaan.judul || 'Bahan Bacaan Guru dan Peserta Didik'}</h3>
            {c.bahan_bacaan.paragraf?.map((p: string, i: number) => (
              <p key={i} className="text-sm text-slate-300 mb-2 text-justify">{p}</p>
            ))}
          </div>
        )}

        {c.glosarium && c.glosarium.length > 0 && (
          <div>
            <h3 className="font-bold text-green-300 mb-2">E. Glosarium</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {c.glosarium.map((g: any, i: number) => (
                <div key={i} className="text-slate-300">
                  <span className="font-medium text-slate-200">{g.kata}</span>: {g.arti}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Generate LKPD</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Mata Pelajaran</label>
            <input type="text" value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} required placeholder="Pendidikan Pancasila"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Materi</label>
            <textarea value={form.materi} onChange={(e) => setForm({ ...form, materi: e.target.value })} required rows={3} placeholder="Makna Sila-sila Pancasila"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Kelas</label>
            <select value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} required
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Memproses...' : 'Generate LKPD'}
          </button>
        </form>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil</h2>
          {loading && <p className="text-slate-400">AI sedang menulis LKPD...</p>}
          {!loading && !result && <p className="text-slate-500">Isi form dan klik Generate</p>}
          {result && (
            <div className="max-h-[500px] overflow-y-auto">
              {renderLkpd()}
              <div className="mt-4"><DownloadButtons id={result.id} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
