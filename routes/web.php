<?php

use Illuminate\Support\Facades\Route;

// =====================
// API Routes
// =====================
Route::prefix('api')->group(function () {
    // Auth
    require __DIR__.'/auth.php';
    
    // Admin Routes
    require __DIR__.'/admin.php';
    
    // Public & User Routes
    require __DIR__.'/api_v1.php';
});

// ===================== 
// SPA catch-all — returns React frontend (ONLY for GET requests)
// =====================
Route::get('/{any?}', function () {
    return view('welcome');
})->where('any', '.*')->name('spa.fallback');
