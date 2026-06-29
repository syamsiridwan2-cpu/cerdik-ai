'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import DownloadButtons from '@/components/shared/DownloadButtons';

export default function GenerateRubrikPage() {
  const [form, setForm] = useState({ materi: '', kelas: '3', mapel: '', tipe: 'presentasi' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/generate-rubrik', form);
      setResult(res.data.data);
      toast.success('Rubrik penilaian berhasil dibuat!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal generating rubrik');
    } finally {
      setLoading(false);
    }
  };

  const renderRubrik = () => {
    const c = result?.content;
    if (!c?.tables) return null;
    return (
      <div className="text-white" style={{ fontFamily: "'Times New Roman', serif", fontSize: '11pt' }}>
        <p className="font-bold text-sm text-rose-400 mb-4">Asesmen :</p>
        {c.tables.map((tbl: any, ti: number) => (
          <div key={ti} className="mb-6">
            <p className="font-semibold text-sm text-rose-300 mb-2">
              Tabel {tbl.nomor_tabel || ''} {tbl.judul || ''}
            </p>
            <table className="w-full text-xs border-collapse border border-slate-600">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="border border-slate-600 px-2 py-1.5 text-left font-bold text-slate-200">Kriteria/ Skor</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-center font-bold text-slate-200">Skor 86-100<br/>Baik Sekali<br/>4</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-center font-bold text-slate-200">Skor 71-85<br/>Baik<br/>3</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-center font-bold text-slate-200">Skor 61-70<br/>cukup<br/>2</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-center font-bold text-slate-200">Skor = 60<br/>Kurang<br/>1</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(tbl.kriteria) && tbl.kriteria.map((kr: any, ki: number) => (
                  <tr key={ki} className="border-b border-slate-700/50">
                    <td className="border border-slate-600 px-2 py-1.5 text-slate-300 font-medium">{kr.nama || ''}</td>
                    <td className="border border-slate-600 px-2 py-1.5 text-slate-300">{kr.skor4 || ''}</td>
                    <td className="border border-slate-600 px-2 py-1.5 text-slate-400">{kr.skor3 || ''}</td>
                    <td className="border border-slate-600 px-2 py-1.5 text-slate-400">{kr.skor2 || ''}</td>
                    <td className="border border-slate-600 px-2 py-1.5 text-slate-400">{kr.skor1 || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Generate Rubrik Penilaian</h1>

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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Kelas</label>
              <select value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Tipe</label>
              <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                <option value="presentasi">Presentasi</option>
                <option value="proyek">Proyek</option>
                <option value="diskusi">Diskusi</option>
                <option value="mewarnai">Mewarnai</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Memproses...' : 'Generate Rubrik'}
          </button>
        </form>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil</h2>
          {loading && <p className="text-slate-400">AI sedang membuat rubrik...</p>}
          {!loading && !result && <p className="text-slate-500">Isi form dan klik Generate</p>}
          {result && (
            <div className="max-h-[500px] overflow-y-auto">
              {renderRubrik()}
              <div className="mt-4"><DownloadButtons id={result.id} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
