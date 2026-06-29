'use client';

import toast from 'react-hot-toast';

export default function DownloadButtons({ id }: { id: number }) {
  const download = async (ext: string) => {
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

  return (
    <div className="flex gap-2 pt-4 border-t border-slate-700/50">
      <button onClick={() => download('docx')}
        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg transition-colors border border-indigo-600/20">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Download DOCX
      </button>
      <button onClick={() => download('pdf')}
        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors border border-red-600/20">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        Download PDF
      </button>
    </div>
  );
}
