<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('pin', 6)->unique();
            $table->integer('duration'); // in minutes
            $table->boolean('random_soal')->default(true);
            $table->boolean('random_opsi')->default(false);
            $table->boolean('auto_save')->default(true);
            $table->boolean('fullscreen')->default(true);
            $table->boolean('detect_tab_switch')->default(true);
            $table->boolean('show_result')->default(true);
            $table->enum('status', ['draft', 'active', 'closed'])->default('draft');
            $table->integer('kkm')->default(70);
            $table->timestamps();

            $table->index('pin');
            $table->index(['user_id', 'status']);
        });

        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->text('question');
            $table->json('options'); // {"A": "...", "B": "...", "C": "...", "D": "..."}
            $table->string('correct_answer', 1); // A, B, C, D
            $table->integer('bobot')->default(1);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('exam_id');
        });

        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->string('student_name');
            $table->string('nisn')->nullable();
            $table->string('pin', 6);
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->float('score')->nullable();
            $table->integer('total_bobot')->default(0);
            $table->integer('correct_count')->default(0);
            $table->integer('tab_switch_count')->default(0);
            $table->enum('status', ['in_progress', 'completed'])->default('in_progress');
            $table->timestamps();

            $table->index(['exam_id', 'student_name']);
        });

        Schema::create('exam_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('exam_sessions')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('exam_questions')->cascadeOnDelete();
            $table->string('answer', 10)->nullable();
            $table->boolean('is_correct')->default(false);
            $table->timestamps();

            $table->unique(['session_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_answers');
        Schema::dropIfExists('exam_sessions');
        Schema::dropIfExists('exam_questions');
        Schema::dropIfExists('exams');
    }
};
