<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Exam;
use App\Models\ExamSession;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->success($this->adminStats());
        }

        if ($user->isSiswa()) {
            return $this->success($this->siswaStats($user));
        }

        return $this->success($this->guruStats($user));
    }

    protected function guruStats($user)
    {
        $totalDocuments = Document::where('user_id', $user->id)->count();
        $totalExams = Exam::where('user_id', $user->id)->count();
        $activeExams = Exam::where('user_id', $user->id)->where('status', 'active')->count();
        $recentDocuments = Document::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        $documentsByType = Document::where('user_id', $user->id)
            ->selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        return [
            'poin' => $user->poin,
            'total_documents' => $totalDocuments,
            'total_exams' => $totalExams,
            'active_exams' => $activeExams,
            'recent_documents' => $recentDocuments,
            'documents_by_type' => $documentsByType,
        ];
    }

    protected function siswaStats($user)
    {
        $sessions = ExamSession::where('student_name', $user->name)
            ->orWhere('nisn', $user->nisn)
            ->with(['exam' => function ($q) { $q->select('id', 'title', 'kkm', 'duration', 'status'); }])
            ->latest()
            ->get();

        $inProgress = $sessions->where('status', 'in_progress')->values();
        $completed = $sessions->where('status', 'completed')->values();

        return [
            'poin' => $user->poin,
            'total_exams_taken' => $sessions->count(),
            'in_progress_exams' => $inProgress,
            'completed_exams' => $completed,
        ];
    }

    protected function adminStats()
    {
        $totalUsers = \App\Models\User::count();
        $totalGuru = \App\Models\User::where('role', 'guru')->count();
        $totalSiswa = \App\Models\User::where('role', 'siswa')->count();
        $totalDocuments = Document::count();
        $totalExams = Exam::count();
        $totalAiUsage = \App\Models\AiUsageLog::sum('poin_spent');

        return [
            'total_users' => $totalUsers,
            'total_guru' => $totalGuru,
            'total_siswa' => $totalSiswa,
            'total_documents' => $totalDocuments,
            'total_exams' => $totalExams,
            'total_ai_usage' => $totalAiUsage,
        ];
    }
}
