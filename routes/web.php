<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\UserController;

// =====================
// Auth
// =====================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/user', [AuthController::class, 'user']);

// =====================
// Services (публичный список + CRUD для админа)
// =====================
Route::get('/api/services', [ServiceController::class, 'index']);
Route::get('/api/services/{service}', [ServiceController::class, 'show']);

Route::middleware('auth')->group(function () {
    // Admin-only service management
    Route::middleware('admin')->group(function () {
        Route::post('/api/services', [ServiceController::class, 'store']);
        Route::put('/api/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/api/services/{service}', [ServiceController::class, 'destroy']);
    });

    // =====================
    // Leads (auth users)
    // =====================
    Route::get('/api/leads', [LeadController::class, 'index']);
    Route::post('/api/leads', [LeadController::class, 'store']);
    Route::get('/api/leads/{lead}', [LeadController::class, 'show']);
    Route::put('/api/leads/{lead}', [LeadController::class, 'update']);
    Route::delete('/api/leads/{lead}', [LeadController::class, 'destroy']);

    // =====================
    // Users (admin only)
    // =====================
    Route::middleware('admin')->group(function () {
        Route::get('/api/users', [UserController::class, 'index']);
        Route::post('/api/users', [UserController::class, 'store']);
        Route::get('/api/users/{user}', [UserController::class, 'show']);
        Route::put('/api/users/{user}', [UserController::class, 'update']);
        Route::delete('/api/users/{user}', [UserController::class, 'destroy']);
    });
});

// =====================
// SPA catch-all — возвращает React frontend
// =====================
Route::get('/{any}', function () {
    return file_get_contents(base_path('frontend/index.html'));
})->where('any', '^(?!api).*$');
