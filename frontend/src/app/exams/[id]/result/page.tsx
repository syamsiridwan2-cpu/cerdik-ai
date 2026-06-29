'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function ExamResultPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;
    api.get(`/exams/${id}/session/${sessionId}/result`).then((res) => {
      setResult(res.data.data);
    }).catch(() => {
      router.push('/dashboard/siswa');
    });
  }, [id, sessionId, router]);

  if (!result) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Memuat...</div>;
  }

  const passed = result.score >= result.kkm;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 max-w-md w-full text-center">
        <div className={`text-6xl mb-4 ${passed ? 'text-green-400' : 'text-red-400'}`}>
          {passed ? 'Lulus' : 'Tidak Lulus'}
        </div>
        <div className={`text-5xl font-bold mb-2 ${passed ? 'text-green-400' : 'text-red-400'}`}>
          {result.score}
        </div>
        <p className="text-slate-400 mb-2">Nilai Akhir</p>

        <div className="bg-slate-900/50 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Benar</span>
            <span className="font-semibold">{result.correct_count}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>KKM</span>
            <span className="font-semibold">{result.kkm}</span>
          </div>
          {result.tab_switch_count > 0 && (
            <div className="flex justify-between text-red-400">
              <span>Peringatan tab switch</span>
              <span className="font-semibold">{result.tab_switch_count}x</span>
            </div>
          )}
        </div>

        <Link href="/dashboard/siswa"
          className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
