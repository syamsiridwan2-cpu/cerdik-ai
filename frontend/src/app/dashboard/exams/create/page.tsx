'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreateExamPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', description: '', duration: 60, kkm: 70,
    random_soal: true, random_opsi: false, auto_save: true,
    fullscreen: true, detect_tab_switch: true, show_result: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/exams', form);
      toast.success('Ujian berhasil dibuat');
      router.push(`/dashboard/exams/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat ujian');
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-300">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-slate-600'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Buat Ujian Baru</h1>

      <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Judul Ujian</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Deskripsi (opsional)</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Durasi (menit)</label>
            <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} min={1} max={300}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">KKM</label>
            <input type="number" value={form.kkm} onChange={(e) => setForm({ ...form, kkm: +e.target.value })} min={0} max={100}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4 space-y-1">
          <p className="text-sm font-medium text-white mb-2">Pengaturan Ujian</p>
          <Toggle label="Acak soal" value={form.random_soal} onChange={(v) => setForm({ ...form, random_soal: v })} />
          <Toggle label="Acak opsi jawaban" value={form.random_opsi} onChange={(v) => setForm({ ...form, random_opsi: v })} />
          <Toggle label="Auto save jawaban" value={form.auto_save} onChange={(v) => setForm({ ...form, auto_save: v })} />
          <Toggle label="Mode fullscreen" value={form.fullscreen} onChange={(v) => setForm({ ...form, fullscreen: v })} />
          <Toggle label="Deteksi pindah tab" value={form.detect_tab_switch} onChange={(v) => setForm({ ...form, detect_tab_switch: v })} />
          <Toggle label="Tampilkan hasil ke siswa" value={form.show_result} onChange={(v) => setForm({ ...form, show_result: v })} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
          {loading ? 'Menyimpan...' : 'Buat Ujian'}
        </button>
      </form>
    </div>
  );
}
