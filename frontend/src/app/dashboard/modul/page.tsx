'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function GenerateModulPage() {
  const [form, setForm] = useState({ materi: '', kelas: '', mapel: '', semester: '1' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/generate-modul', form);
      setResult(res.data.data);
      toast.success('Modul ajar berhasil dibuat!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal generating modul');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Generate Modul Ajar</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Mata Pelajaran</label>
            <input type="text" value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} required placeholder="Matematika"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Materi</label>
            <textarea value={form.materi} onChange={(e) => setForm({ ...form, materi: e.target.value })} required rows={3} placeholder="Misal: Sistem Persamaan Linear Dua Variabel"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Kelas</label>
              <select value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })} required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                {[10, 11, 12].map((k) => <option key={k} value={k}>Kelas {k}</option>)}
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
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Memproses...' : 'Generate Modul Ajar'}
          </button>
        </form>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil</h2>
          {loading && <p className="text-slate-400">AI sedang menulis modul ajar...</p>}
          {!loading && !result && <p className="text-slate-500">Isi form dan klik Generate</p>}
          {result && (
            <div className="max-h-[500px] overflow-y-auto space-y-3">
              {Object.entries(result.content).map(([key, value]: any) => (
                <div key={key}>
                  <h3 className="text-sm font-semibold text-indigo-400 capitalize mb-1">{key.replace(/_/g, ' ')}</h3>
                  {typeof value === 'string' ? (
                    <p className="text-sm text-slate-300">{value}</p>
                  ) : Array.isArray(value) ? (
                    <ul className="list-disc list-inside text-sm text-slate-300">
                      {value.map((item: any, i: number) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <pre className="text-xs text-slate-400 whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-slate-700">
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${result.id}/export-docx`}
                  className="text-sm text-indigo-400 hover:underline mr-4">Download DOCX</a>
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${result.id}/export-pdf`}
                  className="text-sm text-indigo-400 hover:underline">Download PDF</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
