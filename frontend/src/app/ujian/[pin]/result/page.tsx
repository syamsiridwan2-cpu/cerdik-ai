'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ExamResultPage() {
  const { pin } = useParams();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    api.get(`/exams/${pin}/session/${sessionId}/result`)
      .then((res) => setResult(res.data.data))
      .finally(() => setLoading(false));
  }, [pin, sessionId]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-slate-400">Memuat hasil...</p></div>;
  if (!result) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-red-400">Hasil tidak ditemukan</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur rounded-2xl p-8 border border-slate-700 text-center">
        <div className="text-5xl mb-4">{result.passed ? '🎉' : '😔'}</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {result.passed ? 'Selamat!' : 'Belum Berhasil'}
        </h1>
        <p className="text-slate-400 mb-6">
          {result.passed ? 'Anda lulus ujian.' : 'KKM: ' + result.kkm}
        </p>

        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke={result.passed ? '#22c55e' : '#ef4444'} strokeWidth="8"
              strokeDasharray={`${result.score * 3.39} 339`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
              {result.score}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-400 mb-6">
          <p>Jawaban benar: <span className="text-white font-medium">{result.correct_count}</span></p>
          <p>Pindah tab: <span className="text-white font-medium">{result.tab_switch_count}x</span></p>
        </div>

        <Link href="/" className="block w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
