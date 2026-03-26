<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LeadController;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');
