'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ExamPlayerPage() {
  const { pin } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');

  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);

  // Load questions
  useEffect(() => {
    if (!sessionId) return;
    api.get(`/exams/${pin}/session/${sessionId}/questions`)
      .then((res) => {
        const d = res.data.data;
        setExam(d);
        setQuestions(d.questions);
        setTimeLeft(d.duration - d.time_remaining);
        // Load existing answers
        const savedAnswers: Record<number, string> = {};
        Object.values(d.answers).forEach((a: any) => {
          savedAnswers[a.question_id] = a.answer;
        });
        setAnswers(savedAnswers);
      })
      .catch(() => router.push(`/ujian/${pin}`))
      .finally(() => setLoading(false));
  }, [sessionId, pin, router]);

  // Timer
  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [exam, timeLeft]);

  // Fullscreen
  useEffect(() => {
    if (exam?.fullscreen && typeof document !== 'undefined') {
      document.documentElement.requestFullscreen?.();
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    };
  }, [exam]);

  // Tab switch detection
  useEffect(() => {
    if (!exam?.detect_tab_switch) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabWarnings((prev) => prev + 1);
        api.post(`/exams/${pin}/session/${sessionId}/tab-switch`).catch(() => {});
        toast.error('Peringatan: Jangan pindah tab!');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [exam, pin, sessionId]);

  // Auto-save
  const saveAnswer = useCallback(async (questionId: number, answer: string) => {
    try {
      await api.post(`/exams/${pin}/session/${sessionId}/answer`, { question_id: questionId, answer });
    } catch {}
  }, [pin, sessionId]);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    if (exam?.auto_save) {
      saveAnswer(questionId, answer);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/exams/${pin}/session/${sessionId}/submit`);
      router.push(`/ujian/${pin}/result?session=${sessionId}`);
    } catch (err: any) {
      toast.error('Gagal mengumpulkan');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-slate-400">Memuat soal...</p></div>;

  const current = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="text-sm text-slate-400">
          Soal {currentIndex + 1} dari {questions.length}
        </div>
        <div className={`text-lg font-mono font-bold ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
          {formatTime(timeLeft)}
        </div>
        <button onClick={handleSubmit} disabled={submitting}
          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {submitting ? '...' : 'Kumpulkan'}
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Progress */}
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

        {/* Question */}
        {current && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <p className="text-lg text-white mb-6">{current.question}</p>

            <div className="space-y-3">
              {Object.entries(current.options).map(([key, value]: any) => (
                <button key={key} onClick={() => handleAnswer(current.id, key)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    answers[current.id] === key
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}>
                  <span className="font-medium mr-2">{key}.</span> {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
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
