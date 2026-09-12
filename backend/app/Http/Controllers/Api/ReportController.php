<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreEmergencyReportRequest;
use App\Http\Requests\Api\StoreNonEmergencyReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ReportController extends Controller
{
    /**
     * Emergency concern codes and their
     * canonical report labels.
     */
    private const EMERGENCY_CONCERNS = [
        'life-death' => 'Life and Death Emergency',
        'fire' => 'Fire Emergency',
        'medical' => 'Medical Emergency',
        'violence' => 'Public Safety / Violence',
        'flood' => 'Flood Rescue Needed',
        'accident' => 'Road Accident',
        'evacuation' => 'Immediate Evacuation',
    ];

    /**
     * Non-emergency concern codes and labels.
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
     * Get all reports submitted by
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
     * the authenticated resident.
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
                'statusLogs',
                'activeAssignments.assignedUser',
            ])
            ->firstOrFail();

        return new ReportResource(
            $report
        );
    }

    /**
     * Submit an emergency report.
     */
    public function storeEmergency(
        StoreEmergencyReportRequest $request
    ): JsonResponse {
        $data = $request->validated();

        $report = DB::transaction(
            function () use (
                $request,
                $data
            ) {
                // Create report first so we can
                // use the database ID in report_code.
                $report = Report::create([
                    'user_id' =>
                        $request->user()->id,

                    'report_code' =>
                        null,

                    'report_type' =>
                        'Emergency',

                    'concern_code' =>
                        $data['concernCode'],

                    'concern_type' =>
                        self::EMERGENCY_CONCERNS[
                            $data['concernCode']
                        ],

                    'subcategory' =>
                        null,

                    // Emergency reports immediately
                    // enter the response workflow.
                    'status' =>
                        'Submitted',

                    'priority' =>
                        'High',

                    'reporting_for' =>
                        !empty(
                            $data[
                                'reportingForOther'
                            ]
                        )
                            ? 'Another Person'
                            : 'Myself',

                    'subject_name' =>
                        $data[
                            'subjectName'
                        ] ?? null,

                    'subject_contact' =>
                        $data[
                            'subjectContact'
                        ] ?? null,

                    'relationship_note' =>
                        null,

                    'purok' =>
                        null,

                    'location' =>
                        $data['location'],

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
                        ] ?? null,

                    'required_assistance' =>
                        null,

                    'affected_individuals' =>
                        null,

                    'photo_path' =>
                        null,

                    'barangay_remarks' =>
                        null,

                    'invalid_reason' =>
                        null,

                    'resolved_remarks' =>
                        null,
                ]);

                // Public resident-facing report ID
                $report->update([
                    'report_code' =>
                        sprintf(
                            'EM-%06d',
                            $report->id
                        ),
                ]);

                // First timeline entry
                $report
                    ->statusLogs()
                    ->create([
                        'status' =>
                            'Submitted',

                        'remarks' =>
                            'Emergency report submitted by resident.',

                        'changed_by_user_id' =>
                            $request->user()->id,
                    ]);

                return $report;
            }
        );

        $report->load([
            'statusLogs',
            'activeAssignments.assignedUser',
        ]);

        return response()->json([
            'message' =>
                'Emergency report submitted successfully.',

            'report' =>
                new ReportResource(
                    $report
                ),
        ], 201);
    }

    /**
     * Submit a non-emergency report.
     */
    public function storeNonEmergency(
        StoreNonEmergencyReportRequest $request
    ): JsonResponse {
        $data =
            $request->validated();

        $photoPath = null;

        try {
            // Store optional photo evidence
            if (
                $request->hasFile('photo')
            ) {
                $photoPath =
                    $request
                        ->file('photo')
                        ->store(
                            'reports',
                            'public'
                        );
            }

            $report = DB::transaction(
                function () use (
                    $request,
                    $data,
                    $photoPath
                ) {
                    $report =
                        Report::create([
                            'user_id' =>
                                $request
                                    ->user()
                                    ->id,

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

                            // Non-emergency reports
                            // require barangay verification.
                            'status' =>
                                'Pending Verification',

                            'priority' =>
                                'Medium',

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

                            'barangay_remarks' =>
                                null,

                            'invalid_reason' =>
                                null,

                            'resolved_remarks' =>
                                null,
                        ]);

                    // Public resident-facing ID
                    $report->update([
                        'report_code' =>
                            sprintf(
                                'NE-%06d',
                                $report->id
                            ),
                    ]);

                    // Timeline begins with Submitted
                    $report
                        ->statusLogs()
                        ->create([
                            'status' =>
                                'Submitted',

                            'remarks' =>
                                'Non-emergency report submitted by resident.',

                            'changed_by_user_id' =>
                                $request
                                    ->user()
                                    ->id,
                        ]);

                    // Then enters verification queue
                    $report
                        ->statusLogs()
                        ->create([
                            'status' =>
                                'Pending Verification',

                            'remarks' =>
                                'Waiting for barangay verification.',

                            'changed_by_user_id' =>
                                null,
                        ]);

                    return $report;
                }
            );
        } catch (Throwable $exception) {
            // Prevent abandoned files if
            // database creation fails.
            if ($photoPath) {
                Storage::disk(
                    'public'
                )->delete(
                    $photoPath
                );
            }

            throw $exception;
        }

        $report->load([
            'statusLogs',
            'activeAssignments.assignedUser',
        ]);

        return response()->json([
            'message' =>
                'Non-emergency report submitted successfully.',

            'report' =>
                new ReportResource(
                    $report
                ),
        ], 201);
    }
}
