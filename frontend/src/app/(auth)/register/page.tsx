'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'guru', nisn: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'Password tidak cocok' });
      setLoading(false);
      return;
    }
    try {
      await register(form.name, form.email, form.password, form.password_confirmation, form.role, form.nisn);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([k, v]: any) => { mapped[k] = v[0]; });
        setErrors(mapped);
      } else {
        setErrors({ general: err.response?.data?.message || 'Registrasi gagal' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl mb-4 shadow-lg shadow-indigo-600/20">
            C
          </div>
          <h1 className="text-2xl font-bold text-white">Daftar CerdikAI</h1>
          <p className="text-slate-400 text-sm mt-1">Buat akun baru</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 space-y-4">
          <div className="p-4 rounded-xl bg-indigo-600/10 border border-indigo-600/20">
            <p className="text-indigo-300 text-sm font-medium">Belum punya akun?</p>
            <p className="text-indigo-400/70 text-xs mt-1">Isi data diri Anda di bawah untuk mendaftar. Guru akan mendapat 50 poin gratis!</p>
          </div>
          {errors.general && (
            <div className="p-3 rounded-lg bg-red-600/10 border border-red-600/20 text-red-400 text-sm">{errors.general}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Lengkap</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nama Anda"
              className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="nama@sekolah.sch.id"
              className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Daftar Sebagai</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all">
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>

          {form.role === 'siswa' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">NISN</label>
              <input type="text" value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} placeholder="Nomor Induk Siswa Nasional"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Min. 8"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Konfirmasi</label>
              <input type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} required placeholder="Ulangi"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
              {errors.password_confirmation && <p className="text-red-400 text-xs mt-1">{errors.password_confirmation}</p>}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 shadow-lg shadow-indigo-600/10">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Masuk</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
