<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamSession;
use App\Models\ExamAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $exams = Exam::where('user_id', $request->user()->id)
            ->withCount('questions', 'sessions')
            ->latest()
            ->paginate($request->per_page ?? 20);

        return $this->success($exams);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:1|max:300',
            'random_soal' => 'boolean',
            'random_opsi' => 'boolean',
            'auto_save' => 'boolean',
            'fullscreen' => 'boolean',
            'detect_tab_switch' => 'boolean',
            'show_result' => 'boolean',
            'kkm' => 'required|integer|min:0|max:100',
        ]);

        $exam = Exam::create([
            'user_id' => $request->user()->id,
            'pin' => $this->generatePin(),
            'status' => 'draft',
            ...$validated,
        ]);

        return $this->success($exam, 'Ujian berhasil dibuat', 201);
    }

    public function show(Request $request, Exam $exam)
    {
        if ($exam->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $exam->load('questions');

        return $this->success($exam);
    }

    public function update(Request $request, Exam $exam)
    {
        if ($exam->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'duration' => 'integer|min:1|max:300',
            'random_soal' => 'boolean',
            'random_opsi' => 'boolean',
            'auto_save' => 'boolean',
            'fullscreen' => 'boolean',
            'detect_tab_switch' => 'boolean',
            'show_result' => 'boolean',
            'kkm' => 'integer|min:0|max:100',
            'status' => 'in:draft,active,closed',
        ]);

        $exam->update($validated);

        return $this->success($exam, 'Ujian berhasil diperbarui');
    }

    public function destroy(Request $request, Exam $exam)
    {
        if ($exam->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $exam->questions()->delete();
        $exam->sessions()->delete();
        $exam->delete();

        return $this->success(null, 'Ujian berhasil dihapus');
    }

    public function addQuestion(Request $request, Exam $exam)
    {
        if ($exam->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $validated = $request->validate([
            'question' => 'required|string',
            'options' => 'required|array|size:4',
            'options.A' => 'required|string',
            'options.B' => 'required|string',
            'options.C' => 'required|string',
            'options.D' => 'required|string',
            'correct_answer' => 'required|in:A,B,C,D',
            'bobot' => 'required|integer|min:1|max:100',
        ]);

        $question = $exam->questions()->create($validated);

        return $this->success($question, 'Soal berhasil ditambahkan', 201);
    }

    public function updateQuestion(Request $request, Exam $exam, ExamQuestion $question)
    {
        if ($exam->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $validated = $request->validate([
            'question' => 'string',
            'options' => 'array|size:4',
            'options.A' => 'string',
            'options.B' => 'string',
            'options.C' => 'string',
            'options.D' => 'string',
            'correct_answer' => 'in:A,B,C,D',
            'bobot' => 'integer|min:1|max:100',
        ]);

        $question->update($validated);

        return $this->success($question, 'Soal berhasil diperbarui');
    }

    public function deleteQuestion(Request $request, Exam $exam, ExamQuestion $question)
    {
        if ($exam->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $question->delete();

        return $this->success(null, 'Soal berhasil dihapus');
    }

    public function importQuestions(Request $request, Exam $exam)
    {
        if ($exam->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $validated = $request->validate([
            'questions' => 'required|array|min:1',
            'questions.*.question' => 'required|string',
            'questions.*.options' => 'required|array|size:4',
            'questions.*.options.A' => 'required|string',
            'questions.*.options.B' => 'required|string',
            'questions.*.options.C' => 'required|string',
            'questions.*.options.D' => 'required|string',
            'questions.*.correct_answer' => 'required|in:A,B,C,D',
            'questions.*.bobot' => 'required|integer|min:1|max:100',
        ]);

        $imported = 0;
        foreach ($validated['questions'] as $q) {
            $exam->questions()->create($q);
            $imported++;
        }

        return $this->success(['imported' => $imported], "{$imported} soal berhasil diimpor");
    }

    public function activate(Exam $exam)
    {
        $exam->update(['status' => 'active']);

        return $this->success($exam, 'Ujian diaktifkan');
    }

    public function close(Exam $exam)
    {
        $exam->update(['status' => 'closed']);

        return $this->success($exam, 'Ujian ditutup');
    }

    // === Student routes ===

    public function join(Request $request)
    {
        $validated = $request->validate([
            'pin' => 'required|string|size:6',
            'student_name' => 'required|string|max:255',
            'nisn' => 'nullable|string|max:20',
        ]);

        $exam = Exam::where('pin', $validated['pin'])
            ->where('status', 'active')
            ->first();

        if (!$exam) {
            return $this->error('PIN ujian tidak valid atau ujian sudah ditutup.', 404);
        }

        // Check if already has session
        $existingSession = ExamSession::where('exam_id', $exam->id)
            ->where('student_name', $validated['student_name'])
            ->where('status', 'in_progress')
            ->first();

        if ($existingSession) {
            return $this->success([
                'exam' => $exam->only(['id', 'title', 'duration', 'random_soal', 'random_opsi']),
                'session' => $existingSession,
                'resume' => true,
            ]);
        }

        $session = ExamSession::create([
            'exam_id' => $exam->id,
            'student_name' => $validated['student_name'],
            'nisn' => $validated['nisn'],
            'pin' => $validated['pin'],
            'start_at' => now(),
            'status' => 'in_progress',
        ]);

        return $this->success([
            'exam' => $exam->only(['id', 'title', 'duration', 'random_soal', 'random_opsi', 'fullscreen', 'detect_tab_switch']),
            'session' => $session,
        ], 'Silakan mulai ujian', 200);
    }

    public function getQuestions(Request $request, Exam $exam, ExamSession $session)
    {
        if ($session->exam_id !== $exam->id || $session->status !== 'in_progress') {
            return $this->error('Session tidak valid.', 400);
        }

        $questions = $exam->questions()->get(['id', 'question', 'options', 'bobot']);

        if ($exam->random_soal) {
            $questions = $questions->shuffle();
        }

        if ($exam->random_opsi) {
            $questions = $questions->map(function ($q) {
                $options = $q->options;
                $keys = array_keys($options);
                shuffle($keys);
                $shuffled = [];
                foreach ($keys as $k) {
                    $shuffled[$k] = $options[$k];
                }
                $q->options = $shuffled;
                return $q;
            });
        }

        // Get existing answers
        $answers = ExamAnswer::where('session_id', $session->id)
            ->get()
            ->keyBy('question_id');

        return $this->success([
            'questions' => $questions,
            'answers' => $answers,
            'time_remaining' => $session->start_at->diffInSeconds(now()),
            'duration' => $exam->duration * 60,
        ]);
    }

    public function saveAnswer(Request $request, Exam $exam, ExamSession $session)
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:exam_questions,id',
            'answer' => 'nullable|string|max:10',
        ]);

        $question = ExamQuestion::findOrFail($validated['question_id']);
        $isCorrect = $validated['answer'] === $question->correct_answer;

        ExamAnswer::updateOrCreate(
            [
                'session_id' => $session->id,
                'question_id' => $validated['question_id'],
            ],
            [
                'answer' => $validated['answer'],
                'is_correct' => $isCorrect,
            ]
        );

        return $this->success(null, 'Jawaban disimpan');
    }

    public function submit(Request $request, Exam $exam, ExamSession $session)
    {
        if ($session->status !== 'in_progress') {
            return $this->error('Ujian sudah dikumpulkan.', 400);
        }

        $answers = ExamAnswer::where('session_id', $session->id)->get();
        $totalBobot = $exam->questions()->sum('bobot');
        $correctCount = $answers->where('is_correct', true)->sum(function ($a) {
            return $a->question->bobot ?? 0;
        });

        $score = $totalBobot > 0 ? round(($correctCount / $totalBobot) * 100, 2) : 0;

        $session->update([
            'end_at' => now(),
            'score' => $score,
            'total_bobot' => $totalBobot,
            'correct_count' => $answers->where('is_correct', true)->count(),
            'status' => 'completed',
        ]);

        $result = [
            'score' => $score,
            'correct_count' => $answers->where('is_correct', true)->count(),
            'total_questions' => $exam->questions()->count(),
            'total_bobot' => $totalBobot,
            'kkm' => $exam->kkm,
            'passed' => $score >= $exam->kkm,
        ];

        return $this->success($result, 'Ujian berhasil dikumpulkan');
    }

    public function recordTabSwitch(Request $request, Exam $exam, ExamSession $session)
    {
        $session->increment('tab_switch_count');

        return $this->success(null, 'Tercatat');
    }

    public function getResults(Request $request, Exam $exam)
    {
        if ($exam->user_id !== $request->user()->id) {
            return $this->error('Forbidden', 403);
        }

        $sessions = $exam->sessions()->where('status', 'completed')->get();

        $averageScore = $sessions->avg('score');
        $passedCount = $sessions->where('score', '>=', $exam->kkm)->count();
        $failedCount = $sessions->where('score', '<', $exam->kkm)->count();

        return $this->success([
            'exam' => $exam,
            'sessions' => $sessions,
            'statistics' => [
                'total_participants' => $sessions->count(),
                'average_score' => round($averageScore, 2),
                'passed' => $passedCount,
                'failed' => $failedCount,
                'highest_score' => $sessions->max('score'),
                'lowest_score' => $sessions->min('score'),
            ],
        ]);
    }

    public function studentResult(Request $request, Exam $exam, ExamSession $session)
    {
        if (!$exam->show_result && $session->status !== 'completed') {
            return $this->error('Hasil belum bisa dilihat.', 403);
        }

        return $this->success([
            'score' => $session->score,
            'correct_count' => $session->correct_count,
            'total_bobot' => $session->total_bobot,
            'kkm' => $exam->kkm,
            'passed' => $session->score >= $exam->kkm,
            'tab_switch_count' => $session->tab_switch_count,
        ]);
    }

    protected function generatePin(): string
    {
        do {
            $pin = (string) random_int(100000, 999999);
        } while (Exam::where('pin', $pin)->where('status', '!=', 'closed')->exists());

        return $pin;
    }
}
