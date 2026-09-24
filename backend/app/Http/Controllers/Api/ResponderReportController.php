<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Support\ReportAccess;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ResponderReportController extends Controller
{
    /**
     * Return reports currently assigned
     * to the authenticated Responder.
     */
    public function index(
        Request $request
    ): AnonymousResourceCollection {
        $user =
            $request->user();

        abort_unless(
            $user &&
            $user->role === 'responder',
            403,
            'Your account does not have responder access.'
        );

        $reports =
            ReportAccess::forUser(
                $user
            )
                ->with(
                    ReportAccess::RELATIONS
                )
                ->orderByRaw(
                    "
                    CASE priority
                        WHEN 'High' THEN 1
                        WHEN 'Medium' THEN 2
                        WHEN 'Low' THEN 3
                        ELSE 4
                    END
                    "
                )
                ->orderByDesc(
                    'created_at'
                )
                ->get();

        return ReportResource::collection(
            $reports
        );
    }


    /**
     * Return one report only when the
     * authenticated Responder currently
     * has access to that assignment.
     */
    public function show(
        Request $request,
        string $reportCode
    ): ReportResource {
        $user =
            $request->user();

        abort_unless(
            $user &&
            $user->role === 'responder',
            403,
            'Your account does not have responder access.'
        );

        $report =
            ReportAccess::forUser(
                $user
            )
                ->with(
                    ReportAccess::RELATIONS
                )
                ->where(
                    'report_code',
                    $reportCode
                )
                ->firstOrFail();

        return new ReportResource(
            $report
        );
    }
}
