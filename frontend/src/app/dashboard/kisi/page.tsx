'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import DownloadButtons from '@/components/shared/DownloadButtons';

export default function GenerateKisiPage() {
  const [form, setForm] = useState({ materi: '', kelas: '3', mapel: '', semester: '2', jumlah_soal: '25' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/generate-kisi', form);
      setResult(res.data.data);
      toast.success('Kisi-kisi berhasil dibuat!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal generating kisi-kisi');
    } finally {
      setLoading(false);
    }
  };

  const renderKisi = () => {
    const c = result?.content;
    if (!c) return null;
    return (
      <div className="bg-white text-black rounded-2xl p-6 shadow-lg border border-slate-200" style={{ fontFamily: "'Times New Roman', serif", fontSize: '11pt' }}>
        {/* Judul */}
        <p className="text-center font-bold text-base mb-4">{c.judul || 'KISI-KISI SOAL ASAT'}</p>

        {Array.isArray(c.bagian) && c.bagian.map((bag: any) => (
          <div key={bag.label} className="mb-6">
            <p className="font-bold text-sm mb-2">{bag.label}. {bag.nama}</p>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left py-1.5 pr-3 w-10 font-bold">No</th>
                  <th className="text-left py-1.5 pr-3 font-bold">Indikator/ Materi</th>
                  <th className="text-left py-1.5 w-24 font-bold">Bentuk Soal</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(bag.soal) && bag.soal.map((s: any) => (
                  <tr key={s.nomor} className="border-b border-gray-300">
                    <td className="py-1.5 pr-3 align-top">{s.nomor}</td>
                    <td className="py-1.5 pr-3 align-top">{s.indikator}</td>
                    <td className="py-1.5 align-top whitespace-nowrap">{s.bentuk_soal}</td>
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
      <h1 className="text-2xl font-bold text-white mb-6">Generate Kisi-kisi Soal</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Mata Pelajaran</label>
            <input type="text" value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} required placeholder="Matematika"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Materi</label>
            <textarea value={form.materi} onChange={(e) => setForm({ ...form, materi: e.target.value })} required rows={3} placeholder="Misal: Statistika, Geometri, Bilangan"
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
              <label className="block text-sm text-slate-400 mb-1">Semester</label>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Jumlah Soal</label>
            <input type="number" value={form.jumlah_soal} onChange={(e) => setForm({ ...form, jumlah_soal: e.target.value })} min={1} max={50}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Memproses...' : 'Generate Kisi-kisi'}
          </button>
        </form>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil</h2>
          {loading && <p className="text-slate-400">AI sedang membuat kisi-kisi...</p>}
          {!loading && !result && <p className="text-slate-500">Isi form dan klik Generate</p>}
          {result && (
            <div className="max-h-[500px] overflow-y-auto space-y-4">
              {renderKisi()}
              <div className="pt-3 border-t border-slate-700">
                <DownloadButtons id={result.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
