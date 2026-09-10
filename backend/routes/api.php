<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// ============ PUBLIC AUTH ROUTES ============

// Resident registration
Route::post(
    '/register',
    [AuthController::class, 'register']
)->middleware('throttle:5,1');

// Resident login
Route::post(
    '/login',
    [AuthController::class, 'login']
)->middleware('throttle:10,1');

// ============ AUTHENTICATED ROUTES ============
Route::middleware(
    'auth:sanctum'
)->group(function () {

    // Current resident
    Route::get(
        '/user',
        [AuthController::class, 'user']
    );

    // Logout resident
    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );
});
