<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Services\ReportNotifications;
use App\Support\ReportAccess;
use App\Support\ReportWorkflow;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

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
                        WHEN 'Critical' THEN 1
                        WHEN 'High' THEN 2
                        WHEN 'Moderate' THEN 3
                        WHEN 'Low' THEN 4
                        ELSE 5
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
     * Acknowledge the authenticated responder's
     * active assignment.
     *
     * This intentionally does not change the report's
     * lifecycle status. It records acknowledgement,
     * writes a real history event, and advances the
     * report version so stale clients can be detected.
     */
    public function acknowledge(
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

        $validated =
            $request->validate([
                'expectedVersion' => [
                    'required',
                    'integer',
                    'min:1',
                ],
            ]);

        $report =
            DB::transaction(
                function () use (
                    $user,
                    $reportCode,
                    $validated
                ) {
                    $report =
                        ReportAccess::forUser(
                            $user
                        )
                            ->where(
                                'report_code',
                                $reportCode
                            )
                            ->lockForUpdate()
                            ->firstOrFail();

                    $assignment =
                        $report
                            ->activeAssignments()
                            ->where(
                                'assigned_user_id',
                                $user->id
                            )
                            ->lockForUpdate()
                            ->firstOrFail();

                    /*
                     * Idempotent acknowledgement:
                     * a double tap / network retry should
                     * not create another history row.
                     */
                    if (
                        $assignment->acknowledged_at
                    ) {
                        return $report;
                    }

                    $this->assertVersion(
                        $report->version,
                        $validated['expectedVersion']
                    );

                    $allowedActions =
                        array_column(
                            ReportWorkflow::actionsFor(
                                $report,
                                $user->id
                            ),
                            'value'
                        );

                    abort_unless(
                        in_array(
                            'acknowledge',
                            $allowedActions,
                            true
                        ),
                        409,
                        'This assignment can no longer be acknowledged. Refresh the incident and review its current state.'
                    );

                    $assignment
                        ->forceFill([
                            'acknowledged_at' =>
                                now(),
                        ])
                        ->save();

                    $report->version =
                        ((int) $report->version) + 1;

                    $report->save();

                    $statusLog =
                        $report
                            ->statusLogs()
                            ->create([
                            'status' =>
                                $report->status,

                            'activity' =>
                                'Assignment acknowledged',

                            'remarks' =>
                                'The assigned responder acknowledged this incident.',
                            'resident_visible' => false,

                            'changed_by_user_id' =>
                                $user->id,
                        ]);

                    ReportNotifications::progress(
                        $report,
                        'Responder acknowledged the assignment',
                        $user->id
                    );

                    return $report;
                }
            );

        return $this->freshResource(
            $report
        );
    }


    /**
     * Perform one server-authorized lifecycle action.
     *
     * Allowed values are deliberately limited here.
     * Lifecycle and operational actions are authorized by ReportWorkflow.
     * Required action remarks are validated before the event is saved.
     */
    public function action(
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

        $validated =
            $request->validate([
                'action' => [
                    'required',
                    'string',
                    'in:start,en-route,arrived,field-outcome,note,support,unable-locate,invalid-finding,decline',
                ],

                'remarks' => [
                    'nullable',
                    'string',
                    'max:2000',
                    'required_if:action,field-outcome,note,support,unable-locate,invalid-finding,decline',
                ],

                'expectedVersion' => [
                    'required',
                    'integer',
                    'min:1',
                ],
            ]);

        $report =
            DB::transaction(
                function () use (
                    $user,
                    $reportCode,
                    $validated
                ) {
                    $report =
                        ReportAccess::forUser(
                            $user
                        )
                            ->where(
                                'report_code',
                                $reportCode
                            )
                            ->lockForUpdate()
                            ->firstOrFail();

                    /*
                     * Lock the active assignment as well.
                     * This prevents an assignment change from
                     * racing the field action in the same row set.
                     */
                    $assignment =
                        $report
                            ->activeAssignments()
                            ->where(
                                'assigned_user_id',
                                $user->id
                            )
                            ->lockForUpdate()
                            ->firstOrFail();

                    $this->assertVersion(
                        $report->version,
                        $validated['expectedVersion']
                    );

                    $action =
                        $validated['action'];

                    $nextStatus =
                        ReportWorkflow::nextStatus(
                            $report,
                            $action,
                            $user->id
                        );

                    $activity =
                        match ($action) {
                            'start' =>
                                'Response started',

                            'en-route' =>
                                'Responder marked en route',

                            'arrived' =>
                                'Responder recorded arrival / response',

                            'field-outcome' =>
                                'Responder submitted field outcome',

                            'note' =>
                                'Responder added field update',

                            'support' =>
                                'Responder requested additional support',

                            'unable-locate' =>
                                'Responder requested location assistance',

                            'invalid-finding' =>
                                'Responder requested incident review',

                            'decline' =>
                                'Responder declined assignment',
                        };

                    $report->status =
                        $nextStatus;

                    $report->version =
                        ((int) $report->version) + 1;



                    $report->save();

                    $statusLog =
                        $report
                            ->statusLogs()
                            ->create([
                            'status' =>
                                $nextStatus,

                            'activity' =>
                                $activity,

                            'resident_visible' =>
                                in_array(
                                    $action,
                                    [
                                        'start',
                                        'en-route',
                                        'arrived',
                                    ],
                                    true
                                ),

                            'remarks' =>
                                isset(
                                    $validated['remarks']
                                ) &&
                                trim(
                                    (string) $validated['remarks']
                                ) !== ''
                                    ? trim(
                                        (string) $validated['remarks']
                                    )
                                    : null,

                            'changed_by_user_id' =>
                                $user->id,
                        ]);

                    /*
                     * Operational exceptions are sent to the Admin
                     * attention queue. They do not close the report.
                     */
                    $attentionKind =
                        match ($action) {
                            'support' =>
                                'support',

                            'unable-locate' =>
                                'location',

                            'invalid-finding' =>
                                'review',

                            'decline' =>
                                'reassignment',

                            default =>
                                null,
                        };

                    if ($attentionKind !== null) {
                        $report
                            ->attentionRequests()
                            ->create([
                                'event_id' =>
                                    $statusLog->id,

                                'kind' =>
                                    $attentionKind,

                                'requested_by' =>
                                    $user->id,
                            ]);
                    }

                    /*
                     * A declined assignment returns the case to Admin
                     * for manual reassignment. The report itself stays
                     * active and is not resolved, cancelled, or closed.
                     */
                    if ($action === 'decline') {
                        $assignment
                            ->forceFill([
                                'unassigned_at' =>
                                    now(),
                            ])
                            ->save();

                        $personnel =
                            \App\Models\Personnel::query()
                                ->where(
                                    'user_id',
                                    $user->id
                                )
                                ->lockForUpdate()
                                ->first();

                        $incident =
                            \App\Models\Incident::query()
                                ->where(
                                    'report_id',
                                    $report->id
                                )
                                ->lockForUpdate()
                                ->first();

                        $releasedPersonnelId = null;

                        if (
                            $incident &&
                            $personnel &&
                            (int) $incident
                                ->assigned_personnel_id ===
                                (int) $personnel->id
                        ) {
                            $releasedPersonnelId =
                                $personnel->id;

                            $incident->update([
                                'assigned_personnel_id' =>
                                    null,
                            ]);

                            if (
                                $personnel->assignment ===
                                $incident->incident_code
                            ) {
                                $personnel->update([
                                    'availability' =>
                                        'Available',

                                    'assignment' =>
                                        null,
                                ]);
                            }
                        }

                        \App\Models\AuditLog::create([
                            'action' =>
                                'Responder Assignment Declined',

                            'category' =>
                                'Incident',

                            'target' =>
                                $incident
                                    ? $incident
                                        ->incident_code
                                    : $report
                                        ->report_code,

                            'field' =>
                                'assigned_personnel_id',

                            'old_value' =>
                                $releasedPersonnelId
                                    ? (string)
                                        $releasedPersonnelId
                                    : null,

                            'new_value' =>
                                null,

                            'remarks' =>
                                'Responder ' .
                                $user->name .
                                ' declined the assignment. Reason: ' .
                                trim(
                                    (string)
                                    $validated['remarks']
                                ),

                            'user_name' =>
                                $user->name,

                            'user_role' =>
                                $user->role,

                            'status' =>
                                'Success',
                        ]);
                    }

                    /*
                     * Internal notes and exception requests are not
                     * automatically exposed as resident progress.
                     */
                    if (
                        !in_array(
                            $action,
                            [
                                'field-outcome',
                                'note',
                                'support',
                                'unable-locate',
                                'invalid-finding',
                                'decline',
                            ],
                            true
                        )
                    ) {
                        ReportNotifications::progress(
                            $report,
                            $activity,
                            $user->id
                        );
                    }

                    // Keep the web-admin incident in step.
                    \App\Support\ReportBridge::syncIncident($report);

                    return $report;
                }
            );

        return $this->freshResource(
            $report
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


    /**
     * Reject writes made from a stale incident copy.
     */
    private function assertVersion(
        mixed $currentVersion,
        mixed $expectedVersion
    ): void {
        abort_if(
            (int) $currentVersion !==
            (int) $expectedVersion,
            409,
            'This incident changed since it was loaded. Refresh it before saving your action.'
        );
    }


    /**
     * Reload every relationship required by ReportResource
     * after a successful mutation.
     */
    private function freshResource(
        $report
    ): ReportResource {
        $report->refresh();

        $report->load(
            ReportAccess::RELATIONS
        );

        return new ReportResource(
            $report
        );
    }
}
