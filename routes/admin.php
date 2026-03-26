<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\ReviewController;

Route::middleware(['auth', 'admin'])->group(function () {
    // Services Management
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    // Categories Management
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Users Management
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    // Lead Management & Notes
    Route::post('/leads/{lead}/notes', [LeadController::class, 'addNote']);
    Route::get('/leads/{lead}/notes', [LeadController::class, 'getNotes']);

    // Review Moderation
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::put('/reviews/{review}/approve', [ReviewController::class, 'approve']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
});
