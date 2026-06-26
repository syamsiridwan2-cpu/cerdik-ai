<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiUsageLog extends Model
{
    protected $fillable = [
        'user_id',
        'feature',
        'prompt_tokens',
        'response_tokens',
        'poin_spent',
        'model',
    ];

    protected function casts(): array
    {
        return [
            'prompt_tokens' => 'integer',
            'response_tokens' => 'integer',
            'poin_spent' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
