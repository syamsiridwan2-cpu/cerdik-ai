'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function JoinExamPage() {
  const { pin } = useParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [nisn, setNisn] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/exams/join', { pin, student_name: name, nisn: nisn || undefined });
      const { session } = res.data.data;
      router.push(`/ujian/${pin}/start?session=${session.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal masuk ujian');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur rounded-2xl p-8 border border-slate-700">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📋</div>
          <h1 className="text-xl font-bold text-white">Masuk Ujian</h1>
          <p className="text-slate-400 text-sm mt-1">PIN: <span className="text-yellow-400 font-mono text-lg">{pin}</span></p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nama Lengkap</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">NISN (opsional)</label>
            <input type="text" value={nisn} onChange={(e) => setNisn(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? 'Memproses...' : 'Mulai Ujian'}
          </button>
        </form>
      </div>
    </div>
  );
}
