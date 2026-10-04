<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CancelReportRequest;
use App\Http\Requests\Api\StoreEmergencyReportRequest;
use App\Http\Requests\Api\StoreNonEmergencyReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Services\ReportNotifications;
use App\Services\Triage\EmergencyTriageService;
use App\Services\Triage\NonEmergencyTriageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ReportController extends Controller
{
    /**
     * Emergency concern codes and their
     * canonical resident-facing labels.
     */
    private const EMERGENCY_CONCERNS = [
        'fire' => 'Fire Emergency',
        'medical' => 'Medical Emergency',
        'violence' => 'Public Safety / Violence',
        'flood' => 'Flood Rescue Needed',
        'accident' => 'Road Accident',
        'evacuation' => 'Immediate Evacuation',
    ];

    /**
     * Non-emergency concern codes and their
     * canonical resident-facing labels.
     */
    private const NON_EMERGENCY_CONCERNS = [
        'evac-assistance' => 'Evacuation Preparation',
        'bhw-assistance' => 'Barangay Health Worker Assistance',
        'road-obstruction' => 'Road Obstruction',
        'damaged-facility' => 'Damaged Facility',
        'cleanup' => 'Clean-up Assistance',
        'community-concern' => 'Community Concern',
        'other-assistance' => 'Other Assistance',
    ];



    /**
     * Resident cancellation is available while assistance is still
     * pending or in progress. Once an on-scene response is recorded,
     * the incident should be completed by the responder workflow.
     */
    private const CANCELLABLE_STATUSES = [
        // Web-admin queue statuses.
        'For Verification',
        'For Prioritization',
        'Prioritized',
        'Submitted',
        'Pending Verification',
        'Verified',
        'Assigned',
        'In Progress',
        'Responders En Route',
    ];

    /**
     * Canonical human-readable resident cancellation reasons.
     */
    private const CANCELLATION_REASONS = [
        'safe_now' => 'Resident is safe now',
        'accidental' => 'Submitted by mistake / accidental SOS',
        'help_elsewhere' => 'Help arrived from another source',
        'duplicate' => 'Duplicate report',
        'issue_resolved' => 'Issue already resolved',
        'no_longer_needed' => 'Assistance is no longer needed',
        'other' => 'Other reason',
    ];

    /**
     * Get all reports belonging to
     * the currently authenticated resident.
     */
    public function index(
        Request $request
    ): AnonymousResourceCollection {
        $reports = Report::query()
            ->where(
                'user_id',
                $request->user()->id
            )
            ->with([
                'svfAnswer',
                'statusLogs',
                'activeAssignments.assignedUser',
            ])
            ->latest()
            ->get();

        return ReportResource::collection(
            $reports
        );
    }

    /**
     * Get one report belonging to
     * the currently authenticated resident.
     */
    public function show(
        Request $request,
        string $reportCode
    ): ReportResource {
        $report = Report::query()
            ->where(
                'user_id',
                $request->user()->id
            )
            ->where(
                'report_code',
                $reportCode
            )
            ->with([
                'svfAnswer',
                'statusLogs',
                'activeAssignments.assignedUser',
            ])
            ->firstOrFail();

        return new ReportResource(
            $report
        );
    }


    /**
     * Cancel one resident-owned report.
     *
     * This endpoint is shared by Emergency, Non-Emergency, and SOS
     * reports. Identity and ownership come from Sanctum, never from a
     * resident ID submitted by the browser.
     */
    public function cancel(
        CancelReportRequest $request,
        string $reportCode
    ): JsonResponse {
        $data = $request->validated();
        $user = $request->user();

        $report = DB::transaction(
            function () use (
                $data,
                $user,
                $reportCode
            ) {
                $report = Report::query()
                    ->where('user_id', $user->id)
                    ->where('report_code', $reportCode)
                    ->lockForUpdate()
                    ->firstOrFail();

                // Repeated requests against an already-cancelled report are
                // treated as idempotent reads rather than creating more logs.
                if ($report->status === 'Cancelled') {
                    return $report;
                }

                abort_if(
                    (int) $report->version !== (int) $data['expectedVersion'],
                    409,
                    'This report changed since it was loaded. Refresh it before cancelling.'
                );

                abort_unless(
                    in_array(
                        $report->status,
                        self::CANCELLABLE_STATUSES,
                        true
                    ),
                    409,
                    'This report can no longer be cancelled because its response is already complete or closed.'
                );

                // Capture responder recipients before active assignments are
                // closed so they can still be notified of the cancellation.
                $activeAssignments = $report
                    ->activeAssignments()
                    ->lockForUpdate()
                    ->get();

                $responderIds = $activeAssignments
                    ->pluck('assigned_user_id')
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();

                $cancelledAt = now();

                foreach ($activeAssignments as $assignment) {
                    $assignment->forceFill([
                        'unassigned_at' => $cancelledAt,
                    ])->save();
                }

                $reasonLabel = self::CANCELLATION_REASONS[
                    $data['reason']
                ];

                $extraRemarks = trim(
                    (string) ($data['remarks'] ?? '')
                );

                $remarks = 'Cancellation reason: ' . $reasonLabel . '.';

                if ($extraRemarks !== '') {
                    $remarks .= ' Resident note: ' . $extraRemarks;
                }

                $isSos = $report->concern_code === 'sos';

                $report->status = 'Cancelled';
                $report->version = ((int) $report->version) + 1;
                $report->save();

                $report->statusLogs()->create([
                    'status' => 'Cancelled',
                    'activity' => $isSos
                        ? 'Resident cancelled SOS rescue'
                        : 'Resident cancelled report',
                    'remarks' => $remarks,
                    'changed_by_user_id' => $user->id,
                ]);

                // Keep the resident's bell/history consistent with the saved
                // cancellation even though they performed the action.
                ReportNotifications::send(
                    [$user->id],
                    'report',
                    $report->report_code . ': Report cancelled',
                    $isSos
                        ? 'Your SOS rescue was cancelled. Open the report for the confirmed history.'
                        : 'Your report was cancelled. Open it for the confirmed history.',
                    $report->report_code
                );

                $staffRecipients = array_values(
                    array_unique(
                        array_merge(
                            $responderIds,
                            ReportNotifications::admins()
                        )
                    )
                );

                if ($staffRecipients !== []) {
                    ReportNotifications::send(
                        $staffRecipients,
                        'report',
                        $report->report_code . ': Resident cancelled report',
                        $reasonLabel . '.',
                        $report->report_code
                    );
                }

                return $report;
            }
        );

        $report->refresh();
        $report->load([
            'user.profile',
            'statusLogs.changedBy',
            'activeAssignments.assignedUser',
        ]);

        return response()->json([
            'message' => 'Report cancelled successfully.',
            'report' => new ReportResource($report),
        ]);
    }

    /**
     * Submit an Emergency report.
     */
    public function storeEmergency(
        StoreEmergencyReportRequest $request,
        EmergencyTriageService $triageService
    ): JsonResponse {
        $data = $request->validated();
        $user = $request->user();

        $fingerprintPayload = [
            'concernCode' => $data['concernCode'],
            'svfAnswers' => $data['svfAnswers'],
            'location' => $data['location'],
            'reportingForOther' => (bool) ($data['reportingForOther'] ?? false),
            'subjectName' => $data['subjectName'] ?? null,
            'subjectContact' => $data['subjectContact'] ?? null,
        ];

        $requestFingerprint = hash(
            'sha256',
            json_encode($fingerprintPayload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        );

        $triage = $triageService->compute(
            $data['concernCode'],
            $data['svfAnswers']
        );

        [$report, $result] = DB::transaction(
            function () use (
                $data,
                $user,
                $requestFingerprint,
                $triage
            ) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->lockForUpdate()
                    ->first();

                $existing = Report::query()
                    ->where('user_id', $user->id)
                    ->where('client_request_id', $data['clientRequestId'])
                    ->first();

                if ($existing) {
                    if (
                        $existing->request_fingerprint !== null
                        && $existing->request_fingerprint !== $requestFingerprint
                    ) {
                        return [$existing, 'conflict'];
                    }

                    return [$existing, 'idempotent'];
                }

                $report = Report::create([
                    'user_id' => $user->id,
                    'client_request_id' => $data['clientRequestId'],
                    'request_fingerprint' => $requestFingerprint,
                    'report_code' => null,
                    'report_type' => 'Emergency',
                    'concern_code' => $data['concernCode'],
                    'concern_type' => self::EMERGENCY_CONCERNS[$data['concernCode']],
                    'subcategory' => null,
                    'status' => 'Submitted',
                    'priority' => $triage['priority'],
                    'triage_score' => $triage['score'],
                    'triage_recommendation' => $triage['priority'],
                    'triage_assessed_at' => now(),
                    'triage_flags' => $triage['flags'],
                    'triage_rule_version' => $triage['ruleVersion'],
                    'triage_recalculated_at' => now(),
                    'reporting_for' => ! empty($data['reportingForOther'])
                        ? 'Another Person'
                        : 'Myself',
                    'subject_name' => $data['subjectName'] ?? null,
                    'subject_contact' => $data['subjectContact'] ?? null,
                    'relationship_note' => null,
                    'purok' => null,
                    'location' => $data['location'],
                    'landmark' => $data['landmark'] ?? null,
                    'latitude' => $data['latitude'] ?? null,
                    'longitude' => $data['longitude'] ?? null,
                    'location_source' => $data['locationSource'] ?? null,
                    'location_accuracy' => $data['locationAccuracy'] ?? null,
                    'location_captured_at' => $data['locationCapturedAt'] ?? null,
                    'description' => $data['description'] ?? null,
                    'required_assistance' => null,
                    'affected_individuals' => null,
                    'photo_path' => null,
                    'barangay_remarks' => null,
                    'invalid_reason' => null,
                    'resolved_remarks' => null,
                ]);

                $report->update([
                    'report_code' => sprintf('EM-%06d', $report->id),
                ]);

                $report->svfAnswer()->create([
                    'category' => $data['concernCode'],
                    'answers' => $data['svfAnswers'],
                    'flags' => $triage['flags'],
                    'rule_version' => $triage['ruleVersion'],
                ]);

                $report->statusLogs()->create([
                    'status' => 'Submitted',
                    'activity' => 'Resident submitted emergency report',
                    'remarks' => sprintf(
                        'Emergency report submitted. System triage computed as %s using rule %s.',
                        $triage['priority'],
                        $triage['ruleVersion']
                    ),
                    'changed_by_user_id' => $user->id,
                    'request_fingerprint' => $requestFingerprint,
                ]);

                return [$report, 'created'];
            }
        );

        if ($result === 'conflict') {
            return response()->json([
                'message' => 'This emergency request identifier was already used for different details. Refresh the form before trying again.',
            ], 409);
        }

        $report->load([
            'svfAnswer',
            'statusLogs',
            'activeAssignments.assignedUser',
        ]);

        return response()->json([
            'message' => $result === 'idempotent'
                ? 'This emergency report was already received. The existing report was returned instead of creating a duplicate.'
                : 'Emergency report submitted successfully.',
            'report' => new ReportResource($report),
            'duplicateSubmissionPrevented' => $result === 'idempotent',
        ], $result === 'created' ? 201 : 200);
    }

    /**
     * Submit a Non-Emergency report.
     */
    public function storeNonEmergency(
        StoreNonEmergencyReportRequest $request,
        NonEmergencyTriageService $triageService
    ): JsonResponse {
        $data = $request->validated();
        $user = $request->user();
        $photo = $request->file('photo');

        /*
         * Normalize values used for duplicate detection.
         */
        $fingerprintSvfAnswers =
            $data['svfAnswers'];

        ksort($fingerprintSvfAnswers);

        $affectedIndividuals =
            $data['affectedIndividuals'] ?? [];

        sort($affectedIndividuals);

        $noPhotoReason =
            isset($data['noPhotoReason'])
                ? trim(
                    (string) $data['noPhotoReason']
                )
                : null;

        $photoHash = $photo
            ? hash_file(
                'sha256',
                $photo->getRealPath()
            )
            : null;

        $fingerprintPayload = [
            'concernCode' =>
                $data['concernCode'],

            'subcategory' =>
                $data['subcategory'] ?? null,

            'svfAnswers' =>
                $fingerprintSvfAnswers,

            'noPhotoReason' =>
                $noPhotoReason,

            'reportingFor' =>
                $data['reportingFor'],

            'subjectName' =>
                $data['subjectName'] ?? null,

            'subjectContact' =>
                $data['subjectContact'] ?? null,

            'relationshipNote' =>
                $data['relationshipNote'] ?? null,

            'purok' =>
                $data['purok'],

            'location' =>
                $data['location'],

            'landmark' =>
                $data['landmark'] ?? null,

            'latitude' =>
                $data['latitude'] ?? null,

            'longitude' =>
                $data['longitude'] ?? null,

            'description' =>
                $data['description'],

            'requiredAssistance' =>
                $data['requiredAssistance'] ?? null,

            'affectedIndividuals' =>
                $affectedIndividuals,

            'photoHash' =>
                $photoHash,
        ];

        $requestFingerprint = hash(
            'sha256',
            json_encode(
                $fingerprintPayload,
                JSON_UNESCAPED_SLASHES
                    | JSON_UNESCAPED_UNICODE
            )
        );

        /*
         * The resident supplies facts only.
         * Laravel computes the priority.
         */
        $triage = $triageService->compute(
            $data['concernCode'],
            $data['svfAnswers']
        );

        /*
         * Evidence information is preserved with the
         * factual SVF answers for later verification.
         */
        $storedSvfAnswers =
            $data['svfAnswers'];

        $storedSvfAnswers['photoProvided'] =
            $photo ? 'yes' : 'no';

        if (
            $noPhotoReason !== null
            && $noPhotoReason !== ''
        ) {
            $storedSvfAnswers['noPhotoReason'] =
                $noPhotoReason;
        }

        $photoPath = null;

        try {
            [$report, $result] =
                DB::transaction(
                    function () use (
                        $data,
                        $user,
                        $photo,
                        &$photoPath,
                        $requestFingerprint,
                        $triage,
                        $storedSvfAnswers
                    ) {
                        /*
                         * Serialize submissions from this resident
                         * before checking the idempotency key.
                         */
                        DB::table('users')
                            ->where(
                                'id',
                                $user->id
                            )
                            ->lockForUpdate()
                            ->first();

                        $existing =
                            Report::query()
                                ->where(
                                    'user_id',
                                    $user->id
                                )
                                ->where(
                                    'client_request_id',
                                    $data[
                                        'clientRequestId'
                                    ]
                                )
                                ->first();

                        if ($existing) {
                            if (
                                $existing
                                    ->request_fingerprint
                                    !== null
                                && $existing
                                    ->request_fingerprint
                                    !== $requestFingerprint
                            ) {
                                return [
                                    $existing,
                                    'conflict',
                                ];
                            }

                            return [
                                $existing,
                                'idempotent',
                            ];
                        }

                        /*
                         * Only store an uploaded file after the
                         * duplicate check has passed.
                         */
                        if ($photo) {
                            $photoPath =
                                $photo->store(
                                    'reports',
                                    'public'
                                );
                        }

                        $report =
                            Report::create([
                                'user_id' =>
                                    $user->id,

                                'client_request_id' =>
                                    $data[
                                        'clientRequestId'
                                    ],

                                'request_fingerprint' =>
                                    $requestFingerprint,

                                'report_code' =>
                                    null,

                                'report_type' =>
                                    'Non-Emergency',

                                'concern_code' =>
                                    $data[
                                        'concernCode'
                                    ],

                                'concern_type' =>
                                    self::NON_EMERGENCY_CONCERNS[
                                        $data[
                                            'concernCode'
                                        ]
                                    ],

                                'subcategory' =>
                                    $data[
                                        'subcategory'
                                    ] ?? null,

                                'status' =>
                                    'Pending Verification',

                                'priority' =>
                                    $triage[
                                        'priority'
                                    ],

                                'triage_score' =>
                                    $triage[
                                        'score'
                                    ],

                                'triage_recommendation' =>
                                    $triage[
                                        'priority'
                                    ],

                                'triage_assessed_at' =>
                                    now(),

                                'triage_flags' =>
                                    $triage[
                                        'flags'
                                    ],

                                'triage_rule_version' =>
                                    $triage[
                                        'ruleVersion'
                                    ],

                                'triage_recalculated_at' =>
                                    now(),

                                'reporting_for' =>
                                    $data[
                                        'reportingFor'
                                    ],

                                'subject_name' =>
                                    $data[
                                        'subjectName'
                                    ] ?? null,

                                'subject_contact' =>
                                    $data[
                                        'subjectContact'
                                    ] ?? null,

                                'relationship_note' =>
                                    $data[
                                        'relationshipNote'
                                    ] ?? null,

                                'purok' =>
                                    $data[
                                        'purok'
                                    ],

                                'location' =>
                                    $data[
                                        'location'
                                    ],

                                'landmark' =>
                                    $data[
                                        'landmark'
                                    ] ?? null,

                                'latitude' =>
                                    $data[
                                        'latitude'
                                    ] ?? null,

                                'longitude' =>
                                    $data[
                                        'longitude'
                                    ] ?? null,

                                'description' =>
                                    $data[
                                        'description'
                                    ],

                                'required_assistance' =>
                                    $data[
                                        'requiredAssistance'
                                    ] ?? null,

                                'affected_individuals' =>
                                    $data[
                                        'affectedIndividuals'
                                    ] ?? [],

                                'photo_path' =>
                                    $photoPath,

                                'photo_disk' =>
                                    'public',

                                'barangay_remarks' =>
                                    null,

                                'invalid_reason' =>
                                    null,

                                'resolved_remarks' =>
                                    null,
                            ]);

                        $report->update([
                            'report_code' =>
                                sprintf(
                                    'NE-%06d',
                                    $report->id
                                ),
                        ]);

                        $report
                            ->svfAnswer()
                            ->create([
                                'category' =>
                                    $data[
                                        'concernCode'
                                    ],

                                'answers' =>
                                    $storedSvfAnswers,

                                'flags' =>
                                    $triage[
                                        'flags'
                                    ],

                                'rule_version' =>
                                    $triage[
                                        'ruleVersion'
                                    ],
                            ]);

                        $report
                            ->statusLogs()
                            ->create([
                                'status' =>
                                    'Submitted',

                                'activity' =>
                                    'Resident submitted non-emergency report',

                                'remarks' =>
                                    sprintf(
                                        'Non-emergency report submitted. System triage computed as %s using rule %s.',
                                        $triage[
                                            'priority'
                                        ],
                                        $triage[
                                            'ruleVersion'
                                        ]
                                    ),

                                'changed_by_user_id' =>
                                    $user->id,

                                'request_fingerprint' =>
                                    $requestFingerprint,
                            ]);

                        $report
                            ->statusLogs()
                            ->create([
                                'status' =>
                                    'Pending Verification',

                                'activity' =>
                                    'Report queued for barangay verification',

                                'remarks' =>
                                    'Waiting for barangay verification of the submitted facts.',

                                'changed_by_user_id' =>
                                    null,

                                'request_fingerprint' =>
                                    $requestFingerprint,
                            ]);

                        return [
                            $report,
                            'created',
                        ];
                    }
                );
        } catch (Throwable $exception) {
            /*
             * If storage succeeded but database work failed,
             * remove the abandoned file.
             */
            if ($photoPath) {
                Storage::disk(
                    'public'
                )->delete(
                    $photoPath
                );
            }

            throw $exception;
        }

        if ($result === 'conflict') {
            return response()->json([
                'message' =>
                    'This report request identifier was already used for different details. Refresh the form before trying again.',
            ], 409);
        }

        $report->load([
            'svfAnswer',
            'statusLogs',
            'activeAssignments.assignedUser',
        ]);

        return response()->json([
            'message' =>
                $result === 'idempotent'
                    ? 'This non-emergency report was already received. The existing report was returned instead of creating a duplicate.'
                    : 'Non-emergency report submitted successfully.',

            'report' =>
                new ReportResource(
                    $report
                ),

            'duplicateSubmissionPrevented' =>
                $result === 'idempotent',
        ], $result === 'created' ? 201 : 200);
    }
}