<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PoinPackage;
use App\Models\AiUsageLog;
use App\Models\Document;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->latest()->paginate($request->per_page ?? 20);

        return $this->success($users);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'in:guru,siswa,admin',
            'poin' => 'integer|min:0',
        ]);

        $user->update($validated);

        return $this->success($user, 'User berhasil diperbarui');
    }

    public function deleteUser(User $user)
    {
        $user->delete();

        return $this->success(null, 'User berhasil dihapus');
    }

    public function poinPackages()
    {
        $packages = PoinPackage::all();

        return $this->success($packages);
    }

    public function createPoinPackage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'poin' => 'required|integer|min:1',
            'price' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $package = PoinPackage::create($validated);

        return $this->success($package, 'Paket poin berhasil dibuat', 201);
    }

    public function updatePoinPackage(Request $request, PoinPackage $package)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'poin' => 'integer|min:1',
            'price' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $package->update($validated);

        return $this->success($package, 'Paket poin berhasil diperbarui');
    }

    public function deletePoinPackage(PoinPackage $package)
    {
        $package->delete();

        return $this->success(null, 'Paket poin berhasil dihapus');
    }

    public function statistics()
    {
        $totalUsers = User::count();
        $totalGuru = User::where('role', 'guru')->count();
        $totalSiswa = User::where('role', 'siswa')->count();
        $totalDocuments = Document::count();
        $totalPoinUsed = AiUsageLog::sum('poin_spent');

        $usageByFeature = AiUsageLog::selectRaw('feature, count(*) as total, sum(poin_spent) as poin')
            ->groupBy('feature')
            ->get();

        $registrationsLast7Days = User::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, count(*) as total')
            ->groupBy('date')
            ->pluck('total', 'date');

        return $this->success([
            'total_users' => $totalUsers,
            'total_guru' => $totalGuru,
            'total_siswa' => $totalSiswa,
            'total_documents' => $totalDocuments,
            'total_poin_used' => $totalPoinUsed,
            'usage_by_feature' => $usageByFeature,
            'registrations_last_7_days' => $registrationsLast7Days,
        ]);
    }

    public function activityLog()
    {
        $logs = AiUsageLog::with('user')
            ->latest()
            ->paginate(50);

        return $this->success($logs);
    }
}
