'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';

export default function ExamResultsPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/exams/${id}/results`).then((res) => {
      setData(res.data.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-400">Memuat...</p>;
  if (!data) return <p className="text-red-400">Data tidak ditemukan</p>;

  const { exam, sessions, statistics } = data;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">{exam.title}</h1>
      <p className="text-slate-400 mb-6">Hasil Ujian</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Peserta', value: statistics.total_participants, color: 'text-blue-400' },
          { label: 'Rata-rata', value: statistics.average_score, color: 'text-yellow-400', suffix: '' },
          { label: 'Lulus', value: statistics.passed, color: 'text-green-400' },
          { label: 'Tidak Lulus', value: statistics.failed, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}{s.suffix ?? ''}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Daftar Nilai</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left p-3">Nama</th>
                <th className="text-left p-3">NISN</th>
                <th className="text-center p-3">Benar</th>
                <th className="text-center p-3">Nilai</th>
                <th className="text-center p-3">Pindah Tab</th>
                <th className="text-center p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s: any) => (
                <tr key={s.id} className="border-b border-slate-700/50 text-slate-300">
                  <td className="p-3">{s.student_name}</td>
                  <td className="p-3 text-slate-500">{s.nisn || '-'}</td>
                  <td className="p-3 text-center">{s.correct_count}</td>
                  <td className={`p-3 text-center font-semibold ${s.score >= exam.kkm ? 'text-green-400' : 'text-red-400'}`}>
                    {s.score}
                  </td>
                  <td className="p-3 text-center text-slate-500">{s.tab_switch_count}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${s.score >= exam.kkm ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                      {s.score >= exam.kkm ? 'LULUS' : 'TIDAK LULUS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
