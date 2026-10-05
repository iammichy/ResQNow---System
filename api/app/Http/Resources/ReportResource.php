<?php

namespace App\Http\Resources;

use App\Support\ReportWorkflow;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * Shared report structure used by
     * Resident, Responder, and later Admin.
     *
     * @return array<string, mixed>
     */
    public function toArray(
        Request $request
    ): array {
        $residentView =
            $request->user()?->role ===
            'resident';

        return [
            // ============ IDENTIFIERS ============

            // Public code:
            // EM-000001 / NE-000001
            'id' =>
                $this->report_code,

            // Internal database ID.
            'databaseId' =>
                $this->id,

            // Used for stale-update protection.
            'version' =>
                (int) $this->version,


            // ============ REPORT ============

            'reportType' =>
                $this->report_type,

            'concernCode' =>
                $this->concern_code,

            'concernType' =>
                $this->concern_type,

            'subcategory' =>
                $this->subcategory,

            'status' =>
                $this->appStatus(),

            'priority' =>
                $residentView
                    ? null
                    : $this->priority,

            'triage' => $residentView ? null : [
                'computedResult' => $this->priority,
                'score' => $this->triage_score !== null
                    ? (int) $this->triage_score
                    : null,
                'factors' => $this->triage_flags ?? [],
                'ruleVersion' => $this->triage_rule_version,
                'recalculatedAt' => $this->triage_recalculated_at?->toISOString(),
            ],

            'svf' => ! $residentView &&
                $this->relationLoaded('svfAnswer') && $this->svfAnswer
                ? [
                    'category' => $this->svfAnswer->category,
                    'answers' => $this->svfAnswer->answers ?? [],
                    'flags' => $this->svfAnswer->flags ?? [],
                    'ruleVersion' => $this->svfAnswer->rule_version,
                ]
                : null,


            // ============ REPORTER / SUBJECT ============

            'reportingFor' =>
                $this->reporting_for,

            'reporter' =>
                $this->getReporter(),

            'subjectName' =>
                $this->subject_name,

            'subjectContact' =>
                $this->subject_contact,

            // Existing Resident compatibility.
            'victimName' =>
                $this->subject_name,

            'victimContact' =>
                $this->subject_contact,

            'relationshipNote' =>
                $this->relationship_note,


            // ============ LOCATION ============

            'purok' =>
                $this->purok,

            'location' =>
                $this->location,

            'landmark' =>
                $this->landmark,

            'latitude' =>
                $this->latitude !== null
                    ? (float) $this->latitude
                    : null,

            'longitude' =>
                $this->longitude !== null
                    ? (float) $this->longitude
                    : null,

            'locationSource' =>
                $this->location_source,

            'locationAccuracy' =>
                $this->location_accuracy !== null
                    ? (float) $this->location_accuracy
                    : null,

            'locationCapturedAt' =>
                $this->location_captured_at
                    ?->toISOString(),


            // ============ RESIDENT DETAILS ============

            'description' =>
                $this->description,

            'requiredAssistance' =>
                $this->required_assistance,

            'affectedIndividuals' =>
                $this->affected_individuals ?? [],

            // Assignment-scoped operational vulnerability context.
            'responderIntel' =>
                $this->getResponderIntel($request),


            // ============ RESIDENT EVIDENCE ============

            /*
             * Preserve the current Resident behavior
             * for now.
             *
             * Field evidence from responders will use
             * a protected endpoint later.
             */
            'photoUrl' =>
                $this->photo_path
                    ? asset(
                        'storage/' .
                        $this->photo_path
                    )
                    : null,


            // ============ BARANGAY INFORMATION ============

            'barangayRemarks' =>
                $this->barangay_remarks,

            'invalidReason' =>
                $this->invalid_reason,
            'resolvedRemarks' =>
                $residentView
                    ? null
                    : $this->resolved_remarks,


            // ============ HISTORY ============

            'timeline' =>
                $this->buildTimeline(),

            'events' =>
                $this->getEvents(
                $residentView
            ),

            'latestUpdate' =>
                $this->getLatestUpdateText(
                $residentView
            ),


            // ============ ASSIGNMENT ============
            'assignedPersonnel' =>
                $residentView
                    ? null
                    : $this->getAssignedPersonnelText(),

            'assignedPersonnelList' =>
                $residentView
                ? []
                : $this->getAssignedPersonnelList(),


            // ============ SUPPORT / REVIEW ============

            'attentionRequests' =>
                $residentView
                ? []
                : $this->getAttentionRequests(),


            // ============ RESPONDER ACTIONS ============

            /*
             * Only authenticated responder accounts
             * receive permitted field actions.
             */
            'responderActions' =>
                $this->getResponderActions(
                    $request
                ),


            // ============ DISPLAY TIMES ============

            'submittedAt' =>
                $this->created_at
                    ? $this->created_at->copy()->timezone('Asia/Manila')->format('Y-m-d h:i A')
                    : null,

            'updatedAt' =>
                $this->updated_at
                    ? $this->updated_at->copy()->timezone('Asia/Manila')->format('Y-m-d h:i A')
                    : null,


            // ============ ISO TIMES ============

            'createdAt' =>
                $this->created_at
                    ?->toISOString(),

            'updatedAtIso' =>
                $this->updated_at
                    ?->toISOString(),
        ];
    }



    /**
     * Operational vulnerability context for assigned responders/admins only.
     * Boolean resident-profile flags are never converted into invented counts.
     */
    private function getResponderIntel(Request $request): ?array
    {
        $viewerRole = $request->user()?->role;

        if (! in_array($viewerRole, ['responder', 'admin'], true)) {
            return null;
        }

        $profile = (
            $this->relationLoaded('user') &&
            $this->user?->relationLoaded('profile')
        )
            ? $this->user->profile
            : null;

        $householdFlags = [];

        if ($profile?->has_senior_citizen) {
            $householdFlags[] = 'Senior citizen in household';
        }
        if ($profile?->has_child) {
            $householdFlags[] = 'Child in household';
        }
        if ($profile?->has_pwd) {
            $householdFlags[] = 'PWD in household';
        }
        if ($profile?->has_pregnant_person) {
            $householdFlags[] = 'Pregnant person in household';
        }

        return [
            'affectedIndividuals' => $this->affected_individuals ?? [],
            'householdFlags' => $householdFlags,
            'householdCount' => $profile?->household_count,
        ];
    }

    /**
     * Resident who submitted the report.
     */
    private function getReporter(): ?array
    {
        if (
            !$this->relationLoaded('user') ||
            !$this->user
        ) {
            return null;
        }

        $profile =
            $this->user->relationLoaded(
                'profile'
            )
                ? $this->user->profile
                : null;

        return [
            'id' =>
                $this->user->id,

            'fullName' =>
                $this->user->name,

            'email' =>
                $this->user->email,

            'contactNumber' =>
                $profile?->contact_number,
        ];
    }


    /**
     * Build lifecycle progress for the
     * existing Resident tracking screen.
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildTimeline(): array
    {
        $workflow =
            $this->report_type ===
            'Emergency'
                ? [
                    'Submitted',
                    'Assigned',
                    'In Progress',
                    'Responders En Route',
                    'Responded',
                    'Resolved',
                ]
                : [
                    'Submitted',
                    'Pending Verification',
                    'Verified',
                    'Assigned',
                    'In Progress',
                    'Responded',
                    'Resolved',
                ];

        $logs =
            $this->relationLoaded(
                'statusLogs'
            )
                ? $this->statusLogs
                : collect();

        $timeline = [];

        foreach (
            $workflow as $status
        ) {
            $log =
                $logs
                    ->where(
                        'status',
                        $status
                    )
                    ->sortBy(
                        'created_at'
                    )
                    ->first();

            $timeline[] = [
                'status' =>
                    $status,

                'date' =>
                    $log?->created_at
                        ? $log
                            ->created_at
                            ->copy()->timezone('Asia/Manila')->format('Y-m-d h:i A')
                        : null,

                'done' =>
                    $log !== null,
            ];
        }

        if (
            $this->status ===
            'Invalid'
        ) {
            $invalidLog =
                $logs
                    ->where(
                        'status',
                        'Invalid'
                    )
                    ->sortByDesc(
                        'created_at'
                    )
                    ->first();

            $timeline[] = [
                'status' =>
                    'Invalid',

                'date' =>
                    $invalidLog?->created_at
                        ? $invalidLog
                            ->created_at
                            ->copy()->timezone('Asia/Manila')->format('Y-m-d h:i A')
                        : null,

                'done' =>
                    true,
            ];
        }

        if (
            $this->status ===
            'Cancelled'
        ) {
            // A cancelled report has no future lifecycle steps. Keep only
            // progression that really happened before the cancellation.
            $timeline = array_values(
                array_filter(
                    $timeline,
                    fn ($step) => $step['done']
                )
            );

            $cancelledLog =
                $logs
                    ->where(
                        'status',
                        'Cancelled'
                    )
                    ->sortByDesc(
                        'created_at'
                    )
                    ->first();

            $timeline[] = [
                'status' =>
                    'Cancelled',

                'date' =>
                    $cancelledLog?->created_at
                        ? $cancelledLog
                            ->created_at
                            ->copy()->timezone('Asia/Manila')->format('Y-m-d h:i A')
                        : null,

                'done' =>
                    true,
            ];
        }

        return $timeline;
    }


    /**
     * Real saved report activity.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getEvents(
        bool $residentView = false
    ): array
    {
        if (
            !$this->relationLoaded(
                'statusLogs'
            )
        ) {
            return [];
        }

        $logs =
            $residentView
                ? $this->statusLogs->where(
                    'resident_visible',
                    true
                )
                : $this->statusLogs;

        return $logs
            ->map(
                function ($log) {
                    $actor =
                        $log->relationLoaded(
                            'changedBy'
                        )
                            ? $log->changedBy
                            : null;

                    return [
                        'id' =>
                            $log->id,

                        'status' =>
                            $log->status,

                        'activity' =>
                            $log->activity,

                        'remarks' =>
                            $log->remarks,

                        'checklist' =>
                            $log->checklist ?? [],

                        /*
                         * Field evidence remains protected.
                         * We will add its authorized endpoint
                         * when the Responder controller is ready.
                         */
                        'hasPhoto' =>
                            !empty(
                                $log->photo_path
                            ),

                        'photoUrl' =>
                            null,

                        'actor' =>
                            $actor
                                ? [
                                    'id' =>
                                        $actor->id,

                                    'fullName' =>
                                        $actor->name,

                                    'role' =>
                                        $actor->role,
                                ]
                                : null,

                        'createdAt' =>
                            $log->created_at
                                ?->toISOString(),
                    ];
                }
            )
            ->values()
            ->all();
    }


    /**
     * Most recent readable update.
     */
    private function getLatestUpdateText(
        bool $residentView = false
    ): ?string
    {
        if (
            !$this->relationLoaded(
                'statusLogs'
            )
        ) {
            return null;
        }

        $logs =
            $residentView
                ? $this->statusLogs->where(
                    'resident_visible',
                    true
                )
                : $this->statusLogs;

        $latestLog =
            $logs
                ->sortByDesc('id')
                ->first();

        if (!$latestLog) {
            return match (
                $this->appStatus()
            ) {
                'Submitted' =>
                    'Your report has been received and is awaiting barangay action.',

                'Pending Verification' =>
                    'Waiting for barangay verification.',

                'Verified' =>
                    'Your report has been verified by barangay personnel.',

                'Assigned' =>
                    'Personnel have been assigned to your report.',

                'In Progress' =>
                    'Response work has started.',

                'Responders En Route' =>
                    'Assigned responders are on the way.',

                'Responded' =>
                    'Barangay personnel recorded a response to the incident.',

                'Resolved' =>
                    'This report has been resolved.',

                'Invalid' =>
                    'This report has been marked invalid.',

                'Cancelled' =>
                    'This report was cancelled.',

                default =>
                    'Your report is being processed by the barangay.',
            };
        }

        if ($latestLog->remarks) {
            return $latestLog->remarks;
        }

        if ($latestLog->activity) {
            return $latestLog->activity;
        }

        return match (
            $latestLog->status
        ) {
            'Submitted' =>
                'Your report has been submitted.',

            'Pending Verification' =>
                'Waiting for barangay verification.',

            'Verified' =>
                'Your report has been verified by barangay personnel.',

            'Assigned' =>
                'Personnel have been assigned to your report.',

            'In Progress' =>
                'Response work has started.',

            'Responders En Route' =>
                'Assigned responders recorded that they are en route.',

            'Responded' =>
                'Barangay personnel recorded a response to the incident.',

            'Resolved' =>
                'This report has been resolved.',

            'Invalid' =>
                'This report has been marked invalid.',

            'Cancelled' =>
                'This report was cancelled by the resident.',

            default =>
                'Your report status has been updated.',
        };
    }


    /**
     * Internal active assignment text.
     */
    private function getAssignedPersonnelText(): ?string
    {
        if (
            !$this->relationLoaded(
                'activeAssignments'
            )
        ) {
            return null;
        }

        $names =
            $this
                ->activeAssignments
                ->map(
                    fn ($assignment) =>
                        $assignment
                            ->assignedUser
                            ?->name
                )
                ->filter()
                ->values();

        if ($names->isEmpty()) {
            return null;
        }

        return $names->implode(', ');
    }


    /**
     * Structured active assignment data.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getAssignedPersonnelList(): array
    {
        if (
            !$this->relationLoaded(
                'activeAssignments'
            )
        ) {
            return [];
        }

        return $this
            ->activeAssignments
            ->filter(
                fn ($assignment) =>
                    $assignment
                        ->assignedUser !==
                    null
            )
            ->map(
                fn ($assignment) => [
                    'assignmentId' =>
                        $assignment->id,

                    'id' =>
                        $assignment
                            ->assignedUser
                            ->id,

                    'fullName' =>
                        $assignment
                            ->assignedUser
                            ->name,

                    'role' =>
                        $assignment
                            ->assignedUser
                            ->role,

                    'assignedAt' =>
                        $assignment
                            ->assigned_at
                            ?->toISOString(),

                    'acknowledged' =>
                        $assignment
                            ->acknowledged_at !==
                        null,

                    'acknowledgedAt' =>
                        $assignment
                            ->acknowledged_at
                            ?->toISOString(),

                    'notes' =>
                        $assignment->notes,
                ]
            )
            ->values()
            ->all();
    }


    /**
     * Saved support / location / review requests.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getAttentionRequests(): array
    {
        if (
            !$this->relationLoaded(
                'attentionRequests'
            )
        ) {
            return [];
        }

        return $this
            ->attentionRequests
            ->map(
                function ($attention) {
                    $requestedBy =
                        $attention->relationLoaded(
                            'requestedBy'
                        )
                            ? $attention
                                ->requestedBy
                            : null;

                    $acknowledgedBy =
                        $attention->relationLoaded(
                            'acknowledgedBy'
                        )
                            ? $attention
                                ->acknowledgedBy
                            : null;

                    return [
                        'id' =>
                            $attention->id,

                        'kind' =>
                            $attention->kind,

                        'response' =>
                            $attention->response,

                        'acknowledged' =>
                            $attention
                                ->acknowledged_at !==
                            null,

                        'acknowledgedAt' =>
                            $attention
                                ->acknowledged_at
                                ?->toISOString(),

                        'requestedBy' =>
                            $requestedBy
                                ? [
                                    'id' =>
                                        $requestedBy->id,

                                    'fullName' =>
                                        $requestedBy->name,

                                    'role' =>
                                        $requestedBy->role,
                                ]
                                : null,

                        'acknowledgedBy' =>
                            $acknowledgedBy
                                ? [
                                    'id' =>
                                        $acknowledgedBy->id,

                                    'fullName' =>
                                        $acknowledgedBy->name,

                                    'role' =>
                                        $acknowledgedBy->role,
                                ]
                                : null,

                        'createdAt' =>
                            $attention
                                ->created_at
                                ?->toISOString(),
                    ];
                }
            )
            ->values()
            ->all();
    }


    /**
     * Server-authorized field actions
     * for the authenticated Responder.
     *
     * @return array<int, array<string, string>>
     */
    private function getResponderActions(
        Request $request
    ): array {
        $user =
            $request->user();

        if (
            !$user ||
            $user->role !==
            'responder'
        ) {
            return [];
        }

        return ReportWorkflow::actionsFor(
            $this->resource,
            $user->id
        );
    }
}
