'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

const guruMenu = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/modul', label: 'Modul Ajar', icon: '📖' },
  { href: '/dashboard/lkpd', label: 'LKPD', icon: '📝' },
  { href: '/dashboard/rpp', label: 'RPP 1 Lembar', icon: '📋' },
  { href: '/dashboard/kisi', label: 'Kisi-kisi', icon: '📐' },
  { href: '/dashboard/rubrik', label: 'Rubrik', icon: '🏆' },
  { href: '/dashboard/soal', label: 'Soal (PDF)', icon: '📄' },
  { href: '/dashboard/documents', label: 'Dokumen', icon: '📁' },
  { href: '/dashboard/exams', label: 'Ujian', icon: '✍️' },
  { href: '/dashboard/akun', label: 'Akun', icon: '👤' },
];

const siswaMenu = [
  { href: '/dashboard/siswa', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/akun', label: 'Akun', icon: '👤' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const menu = user?.role === 'siswa' ? siswaMenu : guruMenu;

  return (
    <div className={`h-screen bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">C</div>
          {!collapsed && <span className="text-xl font-bold text-white">Cerdik<span className="text-indigo-400">AI</span></span>}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-500 hover:text-white transition-colors hidden md:block">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menu.map((item, i) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              style={{ animationDelay: `${i * 50}ms` }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                active
                  ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-indigo-300 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}>
              <span className="text-lg leading-none">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="flex-1">
              <p className="text-sm text-white font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-yellow-600/20 text-yellow-400 text-xs font-semibold">
              {user?.poin ?? 0}
            </div>
          </div>
        )}
        <button onClick={logout}
          className={`flex items-center gap-3 w-full text-sm text-slate-500 hover:text-red-400 transition-colors rounded-lg px-3 py-2 hover:bg-red-600/10 ${collapsed ? 'justify-center' : ''}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && 'Keluar'}
        </button>
      </div>
    </div>
  );
}
