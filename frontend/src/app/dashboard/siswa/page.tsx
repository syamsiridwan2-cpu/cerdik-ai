'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Sesion {
  id: number;
  exam_id: number;
  student_name: string;
  start_at: string;
  end_at: string | null;
  score: number | null;
  total_bobot: number | null;
  correct_count: number | null;
  status: string;
  exam: { id: number; title: string; kkm: number; duration: number; status: string };
}

interface StudentStats {
  poin: number;
  total_exams_taken: number;
  in_progress_exams: Sesion[];
  completed_exams: Sesion[];
}

export default function SiswaDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [showJoin, setShowJoin] = useState(false);
  const [pin, setPin] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data.data));
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    try {
      const res = await api.post('/exams/join', { pin, student_name: user?.name, nisn: user?.nisn });
      const exam = res.data.data.exam;
      const sessionId = res.data.data.session.id;
      window.location.href = `/exams/${exam.id}?session=${sessionId}`;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal bergabung ujian');
    } finally {
      setJoining(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'in_progress') return <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded">Berlangsung</span>;
    return <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded">Selesai</span>;
  };

  const scoreColor = (score: number, kkm: number) => score >= kkm ? 'text-green-400' : 'text-red-400';

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard Siswa</h1>
      <p className="text-slate-400 mb-6">Halo, {user?.name}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="text-3xl font-bold text-white">{stats?.total_exams_taken ?? 0}</div>
          <div className="text-sm text-white/70 mt-1">Ujian Diikuti</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-800">
          <div className="text-3xl font-bold text-white">{stats?.in_progress_exams?.length ?? 0}</div>
          <div className="text-sm text-white/70 mt-1">Belum Selesai</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-600 to-green-800">
          <div className="text-3xl font-bold text-white">{stats?.completed_exams?.length ?? 0}</div>
          <div className="text-sm text-white/70 mt-1">Selesai</div>
        </div>
      </div>

      <div className="mb-6">
        <button onClick={() => setShowJoin(!showJoin)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          {showJoin ? 'Tutup' : 'Gabung Ujian (PIN)'}
        </button>

        {showJoin && (
          <form onSubmit={handleJoin} className="mt-4 flex gap-3 max-w-md">
            <input type="text" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Masukkan PIN 6 digit" maxLength={6} required
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white text-center text-lg tracking-widest focus:outline-none focus:border-indigo-500" />
            <button type="submit" disabled={joining}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {joining ? '...' : 'Gabung'}
            </button>
          </form>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Sedang Berlangsung</h2>
          {stats?.in_progress_exams?.length ? (
            <div className="space-y-2">
              {stats.in_progress_exams.map((ses) => (
                <div key={ses.id} className="p-3 bg-slate-700/30 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{ses.exam.title}</p>
                    <p className="text-xs text-slate-400">
                      Mulai: {new Date(ses.start_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Link href={`/exams/${ses.exam_id}?session=${ses.id}`}
                    className="px-4 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                    Lanjutkan
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Tidak ada ujian berlangsung</p>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Riwayat Ujian</h2>
          {stats?.completed_exams?.length ? (
            <div className="space-y-2">
              {stats.completed_exams.map((ses) => (
                <div key={ses.id} className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-white font-medium">{ses.exam.title}</p>
                    <span className={`text-lg font-bold ${ses.score !== null ? scoreColor(ses.score, ses.exam.kkm) : 'text-slate-400'}`}>
                      {ses.score ?? '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Benar: {ses.correct_count}/{ses.total_bobot}</span>
                    <span>KKM: {ses.exam.kkm}</span>
                    <span>{ses.score !== null && (ses.score >= ses.exam.kkm ? 'Lulus' : 'Tidak Lulus')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Belum ada ujian selesai</p>
          )}
        </div>
      </div>
    </div>
  );
}
