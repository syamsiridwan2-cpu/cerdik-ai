<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AIGeneratorController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\PoinController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Student routes (no auth required)
Route::post('/exams/join', [ExamController::class, 'join']);
Route::get('/exams/{exam}/session/{session}/questions', [ExamController::class, 'getQuestions']);
Route::post('/exams/{exam}/session/{session}/answer', [ExamController::class, 'saveAnswer']);
Route::post('/exams/{exam}/session/{session}/submit', [ExamController::class, 'submit']);
Route::post('/exams/{exam}/session/{session}/tab-switch', [ExamController::class, 'recordTabSwitch']);
Route::get('/exams/{exam}/session/{session}/result', [ExamController::class, 'studentResult']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // AI Generator (guru)
    Route::middleware('role:guru,admin')->group(function () {
        Route::post('/ai/generate-modul', [AIGeneratorController::class, 'generateModul']);
        Route::post('/ai/generate-lkpd', [AIGeneratorController::class, 'generateLkpd']);
        Route::post('/ai/generate-from-pdf', [AIGeneratorController::class, 'generateFromPdf']);
    });

    // Documents
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::get('/documents/{document}', [DocumentController::class, 'show']);
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);
    Route::get('/documents/{document}/export-docx', [DocumentController::class, 'exportDocx']);
    Route::get('/documents/{document}/export-pdf', [DocumentController::class, 'exportPdf']);

    // Exams (guru)
    Route::middleware('role:guru,admin')->group(function () {
        Route::get('/exams', [ExamController::class, 'index']);
        Route::post('/exams', [ExamController::class, 'store']);
        Route::get('/exams/{exam}', [ExamController::class, 'show']);
        Route::put('/exams/{exam}', [ExamController::class, 'update']);
        Route::delete('/exams/{exam}', [ExamController::class, 'destroy']);
        Route::post('/exams/{exam}/questions', [ExamController::class, 'addQuestion']);
        Route::put('/exams/{exam}/questions/{question}', [ExamController::class, 'updateQuestion']);
        Route::delete('/exams/{exam}/questions/{question}', [ExamController::class, 'deleteQuestion']);
        Route::post('/exams/{exam}/activate', [ExamController::class, 'activate']);
        Route::post('/exams/{exam}/close', [ExamController::class, 'close']);
        Route::get('/exams/{exam}/results', [ExamController::class, 'getResults']);
    });

    // Poin
    Route::get('/poin/balance', [PoinController::class, 'balance']);
    Route::get('/poin/packages', [PoinController::class, 'packages']);
    Route::get('/poin/history', [PoinController::class, 'history']);

    // Admin
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::put('/admin/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);
        Route::get('/admin/poin-packages', [AdminController::class, 'poinPackages']);
        Route::post('/admin/poin-packages', [AdminController::class, 'createPoinPackage']);
        Route::put('/admin/poin-packages/{package}', [AdminController::class, 'updatePoinPackage']);
        Route::delete('/admin/poin-packages/{package}', [AdminController::class, 'deletePoinPackage']);
        Route::get('/admin/statistics', [AdminController::class, 'statistics']);
        Route::get('/admin/activity-log', [AdminController::class, 'activityLog']);
    });
});
