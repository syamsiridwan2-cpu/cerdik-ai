'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface ExamItem {
  id: number;
  title: string;
  pin: string;
  duration: number;
  status: string;
  questions_count: number;
  sessions_count: number;
  created_at: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = () => {
    api.get('/exams').then((res) => {
      setExams(res.data.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchExams(); }, []);

  const toggleStatus = async (id: number, status: string) => {
    try {
      await api.post(`/exams/${id}/${status === 'active' ? 'close' : 'activate'}`);
      fetchExams();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus ujian ini?')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch {}
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-600/20 text-yellow-400',
    active: 'bg-green-600/20 text-green-400',
    closed: 'bg-slate-600/20 text-slate-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Ujian Online</h1>
        <Link href="/dashboard/exams/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">+ Buat Ujian</Link>
      </div>

      {loading ? (
        <p className="text-slate-400">Memuat...</p>
      ) : exams.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg mb-2">Belum ada ujian</p>
          <p className="text-slate-600 text-sm">Buat ujian pertama Anda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[exam.status]}`}>
                    {exam.status.toUpperCase()}
                  </span>
                  <h3 className="text-white font-medium">{exam.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">PIN: <span className="text-yellow-400 font-mono">{exam.pin}</span></span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-xs text-slate-400">
                  <span>{exam.duration} menit</span>
                  <span>{exam.questions_count} soal</span>
                  <span>{exam.sessions_count} peserta</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/exams/${exam.id}`}
                    className="px-3 py-1.5 text-xs bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">Detail</Link>
                  <button onClick={() => toggleStatus(exam.id, exam.status)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      exam.status === 'active'
                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                        : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                    }`}>
                    {exam.status === 'active' ? 'Tutup' : 'Aktifkan'}
                  </button>
                  <Link href={`/dashboard/exams/${exam.id}/results`}
                    className="px-3 py-1.5 text-xs bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">Nilai</Link>
                  <button onClick={() => handleDelete(exam.id)}
                    className="px-3 py-1.5 text-xs bg-slate-700 text-slate-400 rounded-lg hover:bg-red-600/30 hover:text-red-400 transition-colors">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
