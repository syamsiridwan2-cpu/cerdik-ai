'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import DownloadButtons from '@/components/shared/DownloadButtons';

export default function GenerateRppPage() {
  const [form, setForm] = useState({ materi: '', kelas: '3', mapel: '', semester: '2', alokasi_waktu: '1 hari' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/generate-rpp', form);
      setResult(res.data.data);
      toast.success('RPP 1 Lembar berhasil dibuat!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal generating RPP');
    } finally {
      setLoading(false);
    }
  };

  const renderRpp = () => {
    const c = result?.content;
    if (!c) return null;
    return (
      <div className="text-white" style={{ fontFamily: "'Times New Roman', serif", fontSize: '12pt' }}>
        <h2 className="text-lg font-bold text-amber-400 mb-3 text-center">RENCANA PELAKSANAAN PEMBELAJARAN</h2>

        <table className="text-sm w-full mb-4">
          <tbody>
            <tr><td className="py-0.5 text-slate-400 w-48">Satuan Pendidikan</td><td className="text-slate-200">: {c.satuan_pendidikan || '-'}</td></tr>
            <tr><td className="py-0.5 text-slate-400">Kelas / Semester</td><td className="text-slate-200">: {c.kelas_semester || '-'}</td></tr>
            <tr><td className="py-0.5 text-slate-400">Tema {c.tema ? `: ${c.tema}` : ''}</td><td className="text-slate-200">{c.tema ? '' : `: ${c.tema || '-'}`}</td></tr>
            <tr><td className="py-0.5 text-slate-400">Sub Tema {c.sub_tema ? `: ${c.sub_tema}` : ''}</td><td className="text-slate-200">{c.sub_tema ? '' : `: ${c.sub_tema || '-'}`}</td></tr>
            <tr><td className="py-0.5 text-slate-400">Muatan Terpadu</td><td className="text-slate-200">: {c.muatan_terpadu || '-'}</td></tr>
            <tr><td className="py-0.5 text-slate-400">Pembelajaran ke</td><td className="text-slate-200">: {c.pembelajaran_ke || '-'}</td></tr>
            <tr><td className="py-0.5 text-slate-400">Alokasi waktu</td><td className="text-slate-200">: {c.alokasi_waktu || '-'}</td></tr>
          </tbody>
        </table>

        <div className="mb-4">
          <p className="font-bold text-amber-400 mb-1">A. TUJUAN PEMBELAJARAN</p>
          {Array.isArray(c.tujuan_pembelajaran) ? c.tujuan_pembelajaran.map((t: string, i: number) => (
            <p key={i} className="text-sm text-slate-300 mb-0.5 ml-2">{t}</p>
          )) : <p className="text-sm text-slate-300 whitespace-pre-line ml-2">{c.tujuan_pembelajaran}</p>}
        </div>

        <div className="mb-4">
          <p className="font-bold text-amber-400 mb-1">B. KEGIATAN PEMBELAJARAN</p>

          {c.kegiatan_pembelajaran?.pendahuluan && (
            <div className="mb-3">
              <table className="text-sm w-full border-collapse border border-slate-600">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="border border-slate-600 px-2 py-1 text-left font-bold text-slate-200 w-28">Kegiatan</th>
                    <th className="border border-slate-600 px-2 py-1 text-left font-bold text-slate-200">Deskripsi Kegiatan</th>
                    <th className="border border-slate-600 px-2 py-1 text-center font-bold text-slate-200 w-24">Alokasi Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-600 px-2 py-1 font-semibold text-slate-200">Pendahuluan</td>
                    <td className="border border-slate-600 px-2 py-1 text-slate-300 whitespace-pre-line">{c.kegiatan_pembelajaran.pendahuluan.deskripsi || c.kegiatan_pembelajaran.pendahuluan}</td>
                    <td className="border border-slate-600 px-2 py-1 text-center text-slate-300">{c.kegiatan_pembelajaran.pendahuluan.waktu || ''}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 px-2 py-1 font-semibold text-slate-200">Kegiatan Inti</td>
                    <td className="border border-slate-600 px-2 py-1 text-slate-300 whitespace-pre-line">{c.kegiatan_pembelajaran.inti?.deskripsi || c.kegiatan_pembelajaran.inti || ''}</td>
                    <td className="border border-slate-600 px-2 py-1 text-center text-slate-300">{c.kegiatan_pembelajaran.inti?.waktu || ''}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-600 px-2 py-1 font-semibold text-slate-200">Penutup</td>
                    <td className="border border-slate-600 px-2 py-1 text-slate-300 whitespace-pre-line">{c.kegiatan_pembelajaran.penutup?.deskripsi || c.kegiatan_pembelajaran.penutup}</td>
                    <td className="border border-slate-600 px-2 py-1 text-center text-slate-300">{c.kegiatan_pembelajaran.penutup?.waktu || ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {!c.kegiatan_pembelajaran?.pendahuluan && c.langkah_pembelajaran && (
            <div className="text-sm text-slate-300 whitespace-pre-line">{[c.langkah_pembelajaran.pendahuluan, c.langkah_pembelajaran.inti, c.langkah_pembelajaran.penutup].filter(Boolean).join('\n\n')}</div>
          )}
        </div>

        <div className="mb-4">
          <p className="font-bold text-amber-400 mb-1">C. PENILAIAN (ASESMEN)</p>
          {typeof c.penilaian === 'string' ? (
            <p className="text-sm text-slate-300 whitespace-pre-line ml-2">{c.penilaian}</p>
          ) : c.penilaian ? (
            Object.entries(c.penilaian).map(([k, v]: any) => (
              <div key={k} className="mb-1 ml-2">
                <p className="font-semibold text-xs text-slate-400 capitalize">{k}</p>
                <p className="text-sm text-slate-300">{v}</p>
              </div>
            ))
          ) : null}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-600 text-sm text-center">
          <p className="text-slate-300">Mengetahui</p>
          <p className="text-slate-300">Kepala Sekolah,</p>
          <p className="mt-8 text-slate-400">(..........................)</p>
          <p className="text-slate-400">NIP........................</p>
          <p className="mt-4 text-slate-300">...................., ........................</p>
          <p className="text-slate-300">Guru Kelas</p>
          <p className="mt-8 text-slate-400">(..........................)</p>
          <p className="text-slate-400">NIP. ........................</p>
        </div>

        <div className="mt-4"><DownloadButtons id={result.id} /></div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Generate RPP 1 Lembar</h1>

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
              <label className="block text-sm text-slate-400 mb-1">Semester</label>
              <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Alokasi Waktu</label>
            <input type="text" value={form.alokasi_waktu} onChange={(e) => setForm({ ...form, alokasi_waktu: e.target.value })} placeholder="1 hari"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Memproses...' : 'Generate RPP 1 Lembar'}
          </button>
        </form>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Hasil</h2>
          {loading && <p className="text-slate-400">AI sedang menulis RPP...</p>}
          {!loading && !result && <p className="text-slate-500">Isi form dan klik Generate</p>}
          {result && (
            <div className="max-h-[500px] overflow-y-auto">
              {renderRpp()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
