<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('feature'); // generate_modul, generate_lkpd, generate_soal, etc
            $table->integer('prompt_tokens')->default(0);
            $table->integer('response_tokens')->default(0);
            $table->integer('poin_spent')->default(0);
            $table->string('model')->default('gemini-2.0-flash');
            $table->timestamps();

            $table->index(['user_id', 'feature']);
            $table->index('created_at');
        });

        Schema::create('poin_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('poin');
            $table->integer('price'); // in IDR
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('poin_packages');
        Schema::dropIfExists('ai_usage_logs');
    }
};
