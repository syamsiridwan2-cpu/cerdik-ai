'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ExamDetailPage() {
  const { id } = useParams();
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState({ question: '', options: { A: '', B: '', C: '', D: '' }, correct_answer: 'A', bobot: 1 });
  const [adding, setAdding] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showFormat, setShowFormat] = useState(false);

  useEffect(() => {
    api.get(`/exams/${id}`).then((res) => {
      setExam(res.data.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const addQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post(`/exams/${id}/questions`, newQuestion);
      toast.success('Soal ditambahkan');
      setNewQuestion({ question: '', options: { A: '', B: '', C: '', D: '' }, correct_answer: 'A', bobot: 1 });
      api.get(`/exams/${id}`).then((res) => setExam(res.data.data));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal');
    } finally {
      setAdding(false);
    }
  };

  const deleteQuestion = async (questionId: number) => {
    if (!confirm('Hapus soal ini?')) return;
    try {
      await api.delete(`/exams/${id}/questions/${questionId}`);
      toast.success('Soal dihapus');
      api.get(`/exams/${id}`).then((res) => setExam(res.data.data));
    } catch {}
  };

  const handleImport = async () => {
    let parsed;
    try {
      parsed = JSON.parse(importJson);
    } catch {
      return toast.error('Format JSON tidak valid');
    }
    const questions = Array.isArray(parsed) ? parsed : parsed.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      return toast.error('JSON harus berisi array questions');
    }
    setImporting(true);
    try {
      const res = await api.post(`/exams/${id}/import-questions`, { questions });
      toast.success(res.data.message || 'Soal berhasil diimpor');
      setImportJson('');
      setShowImport(false);
      api.get(`/exams/${id}`).then((res) => setExam(res.data.data));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal import soal');
    } finally {
      setImporting(false);
    }
  };

  const formatExample = `[
  {
    "question": "Apa ibukota Indonesia?",
    "options": { "A": "Jakarta", "B": "Surabaya", "C": "Bandung", "D": "Medan" },
    "correct_answer": "A",
    "bobot": 1
  },
  {
    "question": "Siapa presiden pertama RI?",
    "options": { "A": "Soeharto", "B": "Soekarno", "C": "Hatta", "D": "SBY" },
    "correct_answer": "B",
    "bobot": 1
  }
]`;

  if (loading) return <p className="text-slate-400">Memuat...</p>;
  if (!exam) return <p className="text-red-400">Ujian tidak ditemukan</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{exam.title}</h1>
          <p className="text-slate-400 text-sm mt-1">PIN: <span className="text-yellow-400 font-mono text-base">{exam.pin}</span> | {exam.duration} menit | {exam.questions?.length || 0} soal</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Daftar Soal ({exam.questions?.length || 0})</h2>
            <button onClick={() => setShowImport(!showImport)}
              className="px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
              {showImport ? 'Tutup' : 'Import Soal'}
            </button>
          </div>

          {showImport && (
            <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-cyan-700">
              <p className="text-sm font-medium text-cyan-400 mb-2">Import Soal (JSON)</p>
              <button onClick={() => setShowFormat(!showFormat)} className="text-xs text-cyan-500 hover:underline mb-2 block">
                {showFormat ? 'Sembunyikan' : 'Lihat'} Format JSON
              </button>
              {showFormat && (
                <pre className="text-xs text-slate-400 bg-slate-950 p-2 rounded mb-2 overflow-x-auto whitespace-pre-wrap">{formatExample}</pre>
              )}
              <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} rows={8} placeholder='[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct_answer":"A","bobot":1}]'
                className="w-full px-3 py-2 bg-slate-950 border border-slate-600 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-cyan-500 mb-2" />
              <button onClick={handleImport} disabled={importing || !importJson.trim()}
                className="px-4 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50">
                {importing ? 'Mengimpor...' : 'Import'}
              </button>
            </div>
          )}

          {exam.questions?.length === 0 ? (
            <p className="text-slate-500 text-sm">Belum ada soal. Tambahkan atau import soal.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {exam.questions.map((q: any, i: number) => (
                <div key={q.id} className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-white">Soal {i + 1}</span>
                    <button onClick={() => deleteQuestion(q.id)} className="text-xs text-red-400 hover:underline">Hapus</button>
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{q.question}</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(q.options).map(([k, v]: any) => (
                      <div key={k} className={`p-1 rounded ${k === q.correct_answer ? 'text-green-400 bg-green-600/10' : 'text-slate-400'}`}>
                        {k}. {v}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Tambah Soal</h2>
          <form onSubmit={addQuestion} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Pertanyaan</label>
              <textarea value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} required rows={2}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <div key={opt}>
                <label className="block text-xs text-slate-400 mb-1">Opsi {opt}</label>
                <input type="text" value={newQuestion.options[opt]} onChange={(e) => setNewQuestion({ ...newQuestion, options: { ...newQuestion.options, [opt]: e.target.value } })} required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Jawaban Benar</label>
                <select value={newQuestion.correct_answer} onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
                  {['A', 'B', 'C', 'D'].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Bobot</label>
                <input type="number" value={newQuestion.bobot} onChange={(e) => setNewQuestion({ ...newQuestion, bobot: +e.target.value })} min={1}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <button type="submit" disabled={adding}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {adding ? 'Menyimpan...' : 'Tambah Soal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
