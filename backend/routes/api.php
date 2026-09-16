<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
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

// Request password reset instructions
Route::post(
    '/forgot-password',
    [AuthController::class, 'forgotPassword']
)->middleware('throttle:5,1');

// Reset password using a valid reset token
Route::post(
    '/reset-password',
    [AuthController::class, 'resetPassword']
)->middleware('throttle:5,1');


// ============ AUTHENTICATED ROUTES ============
Route::middleware('auth:sanctum')->group(function () {

    // ============ AUTH ============

    // Current resident
    Route::get(
        '/user',
        [AuthController::class, 'user']
    );

    // Change authenticated resident password
    Route::post(
        '/change-password',
        [AuthController::class, 'changePassword']
    )->middleware('throttle:5,1');

    // Logout resident
    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );


    // ============ RESIDENT PROFILE ============

    // Update the logged-in resident profile
    Route::put(
        '/profile',
        [ProfileController::class, 'update']
    )->middleware('throttle:10,1');


    // ============ RESIDENT REPORTS ============

    // Get all reports belonging to the logged-in resident
    Route::get(
        '/reports',
        [ReportController::class, 'index']
    );

    // Submit an emergency report
    Route::post(
        '/reports/emergency',
        [ReportController::class, 'storeEmergency']
    )->middleware('throttle:10,1');

    // Submit a non-emergency report
    Route::post(
        '/reports/non-emergency',
        [ReportController::class, 'storeNonEmergency']
    )->middleware('throttle:10,1');

    // Get one resident report using its public report code
    Route::get(
        '/reports/{reportCode}',
        [ReportController::class, 'show']
    )->where(
        'reportCode',
        '^(EM|NE)-[0-9]{6}$'
    );
});


// ============ CONTACT DIRECTORY ROUTES ============

require __DIR__.'/contacts.php';
