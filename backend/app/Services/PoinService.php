<?php

namespace App\Services;

use App\Models\User;
use App\Models\AiUsageLog;

class PoinService
{
    protected array $poinCost = [
        'generate_modul' => 10,
        'generate_lkpd' => 8,
        'generate_soal' => 5,
        'generate_rpp' => 10,
        'generate_kisi' => 5,
        'generate_rubrik' => 5,
    ];

    public function getCost(string $feature): int
    {
        return $this->poinCost[$feature] ?? 5;
    }

    public function hasEnoughPoin(User $user, string $feature): bool
    {
        return $user->poin >= $this->getCost($feature);
    }

    public function deductPoin(User $user, string $feature, int $promptTokens = 0, int $responseTokens = 0): bool
    {
        $cost = $this->getCost($feature);

        if ($user->poin < $cost) {
            return false;
        }

        $user->decrement('poin', $cost);

        AiUsageLog::create([
            'user_id' => $user->id,
            'feature' => $feature,
            'prompt_tokens' => $promptTokens,
            'response_tokens' => $responseTokens,
            'poin_spent' => $cost,
            'model' => 'gemini-2.0-flash',
        ]);

        return true;
    }

    public function addPoin(User $user, int $amount): void
    {
        $user->increment('poin', $amount);
    }
}
