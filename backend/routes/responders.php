<?php

use App\Http\Controllers\Api\ResponderReportController;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\EnsureVerifiedAccount;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Responder Routes
|--------------------------------------------------------------------------
|
| These endpoints are available only to:
|
| 1. Authenticated users
| 2. Verified accounts
| 3. Users whose stored role is "responder"
|
| ReportAccess performs the additional report-level check so a responder
| can retrieve only incidents currently assigned to that account.
|
*/

Route::prefix('responder')
    ->middleware([
        'auth:sanctum',
        EnsureVerifiedAccount::class,
        EnsureRole::class . ':responder',
    ])
    ->group(function () {

        /*
         * List reports currently assigned
         * to the authenticated responder.
         */
        Route::get(
            '/reports',
            [
                ResponderReportController::class,
                'index',
            ]
        );

        /*
         * Open one currently assigned report.
         */
        Route::get(
            '/reports/{reportCode}',
            [
                ResponderReportController::class,
                'show',
            ]
        )->where(
            'reportCode',
            '^(EM|NE)-[0-9]{6}$'
        );
    });
