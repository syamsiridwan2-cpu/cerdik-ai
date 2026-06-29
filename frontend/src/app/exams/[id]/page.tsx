'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function Modal({ show, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }: {
  show: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string;
  onConfirm: () => void; onCancel: () => void; danger?: boolean;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-600 max-w-sm w-full mx-4 shadow-2xl animate-in fade-in zoom-in">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-300 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors">
            {cancelLabel || 'Batal'}
          </button>
          <button onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}>
            {confirmLabel || 'Ya'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExamPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTabAlert, setShowTabAlert] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const timerRef = useRef<any>(null);
  const fullscreenRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    api.get(`/exams/${id}/session/${sessionId}/questions`).then((res) => {
      const d = res.data.data;
      setExam(d.exam);
      setQuestions(d.questions);
      setAnswers(d.answers || {});
      setTimeLeft(d.time_remaining);
    }).catch(() => {
      toast.error('Gagal memuat ujian');
      router.push('/dashboard/siswa');
    }).finally(() => setLoading(false));
  }, [id, sessionId, router]);

  useEffect(() => {
    if (timeLeft <= 0 || !exam) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, exam]);

  useEffect(() => {
    if (exam?.fullscreen && !fullscreenRef.current) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      fullscreenRef.current = true;
    }
  }, [exam]);

  const handleVisibility = useCallback(() => {
    if (document.hidden && exam?.detect_tab_switch) {
      setTabWarnings((w) => w + 1);
      api.post(`/exams/${id}/session/${sessionId}/tab-switch`).catch(() => {});
      setShowTabAlert(true);
    }
  }, [id, sessionId, exam]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [handleVisibility]);

  const handleAnswer = async (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    await api.post(`/exams/${id}/session/${sessionId}/answer`, { question_id: questionId, answer }).catch(() => {});
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      await api.post(`/exams/${id}/session/${sessionId}/submit`);
    } catch {}
    window.location.href = `/exams/${id}/result?session=${sessionId}`;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Memuat...</div>;

  const current = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950">
      <Modal show={showTabAlert} title="Peringatan!" danger
        message={`Anda terdeteksi keluar dari halaman ujian!\n\nPeringatan ke-${tabWarnings}. Jika melanggar lagi, ujian akan otomatis dikumpulkan.`}
        confirmLabel="Mengerti" cancelLabel="" onConfirm={() => setShowTabAlert(false)} onCancel={() => setShowTabAlert(false)} />

      <Modal show={showSubmitConfirm} title="Akhiri Ujian?" danger
        message={`Anda akan mengumpulkan ujian.\n\nSoal terjawab: ${Object.keys(answers).length} / ${questions.length}\n\nSoal belum terjawab akan dianggap kosong. Yakin ingin mengakhiri?`}
        confirmLabel="Ya, Kumpulkan" cancelLabel="Kembali Mengerjakan"
        onConfirm={() => { setShowSubmitConfirm(false); handleSubmit(); }}
        onCancel={() => setShowSubmitConfirm(false)} />

      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Soal {currentIndex + 1} dari {questions.length}
        </div>
        <div className="flex items-center gap-4">
          {tabWarnings > 0 && <span className="text-xs text-red-400">{tabWarnings}x peringatan</span>}
          <span className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </span>
          <button onClick={() => setShowSubmitConfirm(true)} disabled={submitting}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg disabled:opacity-50">
            {submitting ? '...' : 'Kumpulkan'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <div className="flex gap-1 mb-6 flex-wrap">
          {questions.map((q: any, i: number) => (
            <button key={q.id} onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                i === currentIndex
                  ? 'bg-indigo-600 text-white'
                  : answers[q.id]
                    ? 'bg-green-600/30 text-green-400'
                    : 'bg-slate-800 text-slate-500'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {current && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <p className="text-lg text-white mb-6">{current.question}</p>
            <div className="space-y-3">
              {Object.entries(current.options || {}).map(([key, val]: any) => (
                <button key={key} onClick={() => handleAnswer(current.id, key)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    answers[current.id] === key
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}>
                  <span className="font-medium mr-2">{key}.</span> {val}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))} disabled={currentIndex === 0}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors">
            Sebelumnya
          </button>
          <button onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))} disabled={currentIndex === questions.length - 1}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg disabled:opacity-30 hover:bg-slate-700 transition-colors">
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}
