<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('api')->group(function () {
    require __DIR__.'/auth.php';
    require __DIR__.'/admin.php';
    require __DIR__.'/api_v1.php';
});

Route::get('/', fn () => Inertia::render('Landing'))->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', fn () => Inertia::render('Login'))->name('login');
    Route::get('/register', fn () => Inertia::render('Register'))->name('register');
});

Route::middleware('auth')->group(function () {
    Route::get('/account', fn () => Inertia::render('Account'))->name('account');
    Route::get('/dashboard', fn () => Inertia::render('UserDashboard'))->name('dashboard');
});

Route::middleware(['auth', 'staff'])->group(function () {
    Route::get('/manager', fn () => Inertia::render('ManagerDashboard'))->name('manager.dashboard');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', fn () => Inertia::render('AdminDashboard'))->name('admin.dashboard');
});

Route::fallback(fn () => to_route('home'));
