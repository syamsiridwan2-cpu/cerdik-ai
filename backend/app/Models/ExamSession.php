<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSession extends Model
{
    protected $fillable = [
        'exam_id',
        'student_name',
        'nisn',
        'pin',
        'start_at',
        'end_at',
        'score',
        'total_bobot',
        'correct_count',
        'tab_switch_count',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'score' => 'float',
            'total_bobot' => 'integer',
            'correct_count' => 'integer',
            'tab_switch_count' => 'integer',
        ];
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function answers()
    {
        return $this->hasMany(ExamAnswer::class);
    }
}
