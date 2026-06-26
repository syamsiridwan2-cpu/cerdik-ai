'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const downloadDoc = async (id: number, ext: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/documents/${id}/export-${ext}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return toast.error('Gagal download');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `dokumen.${ext}`; a.click();
  URL.revokeObjectURL(url);
};

interface Doc {
  id: number;
  title: string;
  type: string;
  poin_cost: number;
  created_at: string;
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const params = typeFilter ? `?type=${typeFilter}` : '';
    api.get(`/documents${params}`).then((res) => {
      setDocs(res.data.data.data);
    }).finally(() => setLoading(false));
  }, [typeFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus dokumen ini?')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {}
  };

  const typeColors: Record<string, string> = {
    modul: 'bg-blue-600/20 text-blue-400',
    lkpd: 'bg-green-600/20 text-green-400',
    soal: 'bg-purple-600/20 text-purple-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Dokumen</h1>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
          <option value="">Semua</option>
          <option value="modul">Modul Ajar</option>
          <option value="lkpd">LKPD</option>
          <option value="soal">Soal</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-400">Memuat...</p>
      ) : docs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg mb-2">Belum ada dokumen</p>
          <p className="text-slate-600 text-sm">Generate modul ajar atau LKPD untuk memulai</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[doc.type] || 'bg-slate-600/20 text-slate-400'}`}>
                  {doc.type.toUpperCase()}
                </span>
                <div>
                  <p className="text-white font-medium">{doc.title}</p>
                  <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadDoc(doc.id, 'docx')}
                  className="px-3 py-1.5 text-xs bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600/30 transition-colors">DOCX</button>
                <button onClick={() => downloadDoc(doc.id, 'pdf')}
                  className="px-3 py-1.5 text-xs bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors">PDF</button>
                <button onClick={() => handleDelete(doc.id)}
                  className="px-3 py-1.5 text-xs bg-slate-700 text-slate-400 rounded-lg hover:bg-red-600/30 hover:text-red-400 transition-colors">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
