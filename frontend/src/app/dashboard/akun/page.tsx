'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

export default function AkunPage() {
  const { user, token } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [nisn, setNisn] = useState(user?.nisn || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [changing, setChanging] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await api.put('/auth/profile', { name, nisn });
      setSaveMsg('Profil berhasil diperbarui');
    } catch (err: any) {
      setSaveMsg(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirmation) {
      setPwMsg('Konfirmasi password tidak cocok');
      return;
    }
    setChanging(true);
    setPwMsg('');
    try {
      await api.put('/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });
      setPwMsg('Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err: any) {
      setPwMsg(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Manajemen Akun</h1>
        <p className="text-slate-400 text-sm mt-1">Kelola profil dan password akun Anda</p>
      </div>

      {/* Profile Info Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-700">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-600/20 text-indigo-400 capitalize">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Lengkap</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" value={user?.email || ''} disabled
              className="w-full px-4 py-3 bg-slate-900/40 border border-slate-700 rounded-xl text-slate-500 cursor-not-allowed" />
            <p className="text-xs text-slate-600 mt-1">Email tidak dapat diubah</p>
          </div>
          {user?.role === 'siswa' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">NISN</label>
              <input type="text" value={nisn} onChange={(e) => setNisn(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
            </div>
          )}
          {user?.role === 'guru' && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-600/10 border border-yellow-600/20">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-sm font-medium text-yellow-400">Saldo Poin</p>
                <p className="text-lg font-bold text-yellow-300">{user?.poin ?? 0}</p>
              </div>
            </div>
          )}
          {saveMsg && (
            <p className={`text-sm ${saveMsg.includes('berhasil') ? 'text-green-400' : 'text-red-400'}`}>{saveMsg}</p>
          )}
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Ubah Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password Saat Ini</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
              className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password Baru</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Min. 8"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Konfirmasi</label>
              <input type="password" value={newPasswordConfirmation} onChange={(e) => setNewPasswordConfirmation(e.target.value)} required placeholder="Ulangi"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
            </div>
          </div>
          {pwMsg && (
            <p className={`text-sm ${pwMsg.includes('berhasil') ? 'text-green-400' : 'text-red-400'}`}>{pwMsg}</p>
          )}
          <button type="submit" disabled={changing}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50">
            {changing ? 'Memproses...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
