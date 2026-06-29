'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role === 'siswa' && !pathname.startsWith('/dashboard/siswa')) {
      router.push('/dashboard/siswa');
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-slate-400">Memuat...</div>
    </div>;
  }

  if (!user) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
