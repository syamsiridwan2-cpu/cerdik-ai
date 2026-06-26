'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/modul', label: 'Generate Modul', icon: '📖' },
  { href: '/dashboard/lkpd', label: 'Generate LKPD', icon: '📝' },
  { href: '/dashboard/documents', label: 'Dokumen', icon: '📁' },
  { href: '/dashboard/exams', label: 'Ujian Online', icon: '📋' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-5 border-b border-slate-800">
        <Link href="/dashboard" className="text-xl font-bold text-white">Cerdik<span className="text-indigo-400">AI</span></Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}>
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">Poin: <span className="text-yellow-400 font-semibold">{user?.poin ?? 0}</span></span>
        </div>
        <button onClick={logout} className="w-full text-sm text-slate-500 hover:text-red-400 transition-colors text-left">
          Keluar
        </button>
      </div>
    </div>
  );
}
