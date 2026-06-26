<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'pin',
        'duration',
        'random_soal',
        'random_opsi',
        'auto_save',
        'fullscreen',
        'detect_tab_switch',
        'show_result',
        'status',
        'kkm',
    ];

    protected function casts(): array
    {
        return [
            'duration' => 'integer',
            'random_soal' => 'boolean',
            'random_opsi' => 'boolean',
            'auto_save' => 'boolean',
            'fullscreen' => 'boolean',
            'detect_tab_switch' => 'boolean',
            'show_result' => 'boolean',
            'kkm' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function questions()
    {
        return $this->hasMany(ExamQuestion::class);
    }

    public function sessions()
    {
        return $this->hasMany(ExamSession::class);
    }
}
