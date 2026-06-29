'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/documents/${id}`).then((res) => {
      const doc = res.data.data;
      setTitle(doc.title);
      setType(doc.type);
      setContent(JSON.stringify(doc.content, null, 2));
    }).catch(() => {
      setError('Gagal memuat dokumen');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      let parsedContent: any;
      try {
        parsedContent = JSON.parse(content);
      } catch {
        toast.error('JSON tidak valid. Periksa sintaks.');
        setSaving(false);
        return;
      }

      await api.put(`/documents/${id}`, {
        title,
        content: parsedContent,
      });
      toast.success('Dokumen berhasil disimpan!');
      router.push('/dashboard/documents');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-400">Memuat...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Dokumen</h1>
        <button onClick={() => router.back()}
          className="text-sm text-slate-400 hover:text-white transition-colors">Kembali</button>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Judul</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Konten (JSON)
            <span className="text-xs text-slate-500 ml-2">- Edit struktur data dokumen</span>
          </label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            rows={24}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={() => router.push('/dashboard/documents')}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
