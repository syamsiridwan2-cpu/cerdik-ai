'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface Stats {
  total_documents: number;
  total_exams: number;
  active_exams: number;
  poin: number;
  recent_documents: { id: number; title: string; type: string; created_at: string }[];
  documents_by_type: Record<string, number>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data.data));
  }, []);

  const typeColors: Record<string, string> = { modul: 'text-blue-400', lkpd: 'text-green-400', soal: 'text-purple-400' };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-slate-400 mb-8">Selamat datang, {user?.name}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Dokumen', value: stats?.total_documents ?? 0, color: 'from-blue-600 to-blue-800' },
          { label: 'Ujian', value: stats?.total_exams ?? 0, color: 'from-purple-600 to-purple-800' },
          { label: 'Aktif', value: stats?.active_exams ?? 0, color: 'from-green-600 to-green-800' },
          { label: 'Poin', value: stats?.poin ?? 0, color: 'from-yellow-600 to-yellow-800' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl bg-gradient-to-br ${s.color}`}>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-white/70 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/modul" className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center">
              <div className="text-2xl mb-1">📖</div>
              <div className="text-sm text-slate-300">Buat Modul</div>
            </Link>
            <Link href="/dashboard/lkpd" className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center">
              <div className="text-2xl mb-1">📝</div>
              <div className="text-sm text-slate-300">Buat LKPD</div>
            </Link>
            <Link href="/dashboard/exams" className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center">
              <div className="text-2xl mb-1">📋</div>
              <div className="text-sm text-slate-300">Buat Ujian</div>
            </Link>
            <Link href="/dashboard/documents" className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-center">
              <div className="text-2xl mb-1">📁</div>
              <div className="text-sm text-slate-300">Lihat Dokumen</div>
            </Link>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Dokumen Terbaru</h2>
          {stats?.recent_documents?.length ? (
            <div className="space-y-2">
              {stats.recent_documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <div>
                    <span className={`text-xs font-medium ${typeColors[doc.type] || 'text-slate-400'}`}>{doc.type.toUpperCase()}</span>
                    <p className="text-sm text-slate-300 truncate max-w-[200px]">{doc.title}</p>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Belum ada dokumen</p>
          )}
        </div>
      </div>
    </div>
  );
}
