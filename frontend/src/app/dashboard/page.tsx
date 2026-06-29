'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

interface Stats {
  total_documents: number; total_exams: number; active_exams: number; poin: number;
  recent_documents: { id: number; title: string; type: string; created_at: string }[];
  documents_by_type: Record<string, number>;
}

const quickActions = [
  { href: '/dashboard/modul', icon: '📖', label: 'Modul Ajar', color: 'from-blue-600/20 to-blue-700/10 border-blue-700/30 hover:border-blue-500/50' },
  { href: '/dashboard/lkpd', icon: '📝', label: 'LKPD', color: 'from-green-600/20 to-green-700/10 border-green-700/30 hover:border-green-500/50' },
  { href: '/dashboard/rpp', icon: '📋', label: 'RPP 1 Lembar', color: 'from-amber-600/20 to-amber-700/10 border-amber-700/30 hover:border-amber-500/50' },
  { href: '/dashboard/kisi', icon: '📐', label: 'Kisi-kisi', color: 'from-cyan-600/20 to-cyan-700/10 border-cyan-700/30 hover:border-cyan-500/50' },
  { href: '/dashboard/rubrik', icon: '🏆', label: 'Rubrik', color: 'from-rose-600/20 to-rose-700/10 border-rose-700/30 hover:border-rose-500/50' },
  { href: '/dashboard/soal', icon: '📄', label: 'Soal dari PDF', color: 'from-purple-600/20 to-purple-700/10 border-purple-700/30 hover:border-purple-500/50' },
  { href: '/dashboard/exams', icon: '✍️', label: 'Ujian Online', color: 'from-indigo-600/20 to-indigo-700/10 border-indigo-700/30 hover:border-indigo-500/50' },
  { href: '/dashboard/documents', icon: '📁', label: 'Dokumen', color: 'from-slate-600/20 to-slate-700/10 border-slate-700/30 hover:border-slate-500/50' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data.data));
  }, []);

  const statCards = [
    { label: 'Dokumen', value: stats?.total_documents, icon: '📁', color: 'from-blue-600 to-blue-800' },
    { label: 'Ujian', value: stats?.total_exams, icon: '✍️', color: 'from-purple-600 to-purple-800' },
    { label: 'Aktif', value: stats?.active_exams, icon: '🟢', color: 'from-green-600 to-green-800' },
    { label: 'Poin', value: stats?.poin, icon: '⭐', color: 'from-yellow-600 to-yellow-800' },
  ];

  const typeColors: Record<string, string> = { modul: 'text-blue-400', lkpd: 'text-green-400', soal: 'text-purple-400', rpp: 'text-amber-400', kisi: 'text-cyan-400', rubrik: 'text-rose-400' };
  const typeBadges: Record<string, string> = { modul: 'bg-blue-600/20', lkpd: 'bg-green-600/20', soal: 'bg-purple-600/20', rpp: 'bg-amber-600/20', kisi: 'bg-cyan-600/20', rubrik: 'bg-rose-600/20' };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Selamat datang, <span className="text-white font-medium">{user?.name}</span></p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-600/10 border border-yellow-600/20 text-yellow-400 text-sm">
          <span>⭐</span>
          <span className="font-semibold">{stats?.poin ?? 0}</span>
          <span className="text-yellow-500/70">poin</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={s.label} className={`p-4 md:p-5 rounded-xl bg-gradient-to-br ${s.color} animate-fade-in`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="text-2xl md:text-3xl font-bold text-white">{s.value ?? <Skeleton />}</div>
            <div className="text-xs md:text-sm text-white/70 mt-1 flex items-center gap-1.5">
              <span>{s.icon}</span> {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-slate-800/40 rounded-2xl p-5 md:p-6 border border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <Link key={a.href} href={a.href}
                className={`p-3 rounded-xl bg-gradient-to-br ${a.color} border transition-all duration-200 text-center group hover:-translate-y-0.5`}>
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">{a.icon}</div>
                <div className="text-xs text-slate-300 leading-tight">{a.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-slate-800/40 rounded-2xl p-5 md:p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Dokumen Terbaru</h2>
            <Link href="/dashboard/documents" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Lihat semua</Link>
          </div>
          {stats?.recent_documents?.length ? (
            <div className="space-y-2">
              {stats.recent_documents.map((doc, i) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl hover:bg-slate-900/60 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${typeBadges[doc.type] || 'bg-slate-700/50'} ${typeColors[doc.type] || 'text-slate-400'}`}>
                      {doc.type.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm text-slate-200 font-medium leading-tight">{doc.title}</p>
                      <p className={`text-xs mt-0.5 ${typeColors[doc.type] || 'text-slate-500'}`}>{doc.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 shrink-0">{new Date(doc.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📄</div>
              <p className="text-slate-500 text-sm">Belum ada dokumen</p>
              <p className="text-slate-600 text-xs mt-1">Generate modul atau LKPD untuk memulai</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return <div className="h-8 w-16 rounded animate-shimmer" />;
}
