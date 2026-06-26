<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamQuestion extends Model
{
    protected $fillable = [
        'exam_id',
        'question',
        'options',
        'correct_answer',
        'bobot',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'bobot' => 'integer',
            'order' => 'integer',
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
