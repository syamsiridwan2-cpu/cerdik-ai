<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PoinPackage;
use Illuminate\Http\Request;

class PoinController extends Controller
{
    public function balance(Request $request)
    {
        return $this->success([
            'poin' => $request->user()->poin,
        ]);
    }

    public function packages()
    {
        $packages = PoinPackage::where('is_active', true)->get();

        return $this->success($packages);
    }

    public function history(Request $request)
    {
        $logs = $request->user()->aiUsageLogs()->latest()->paginate(20);

        return $this->success($logs);
    }
}
