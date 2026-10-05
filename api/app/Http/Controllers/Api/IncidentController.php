<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\AuditLog;
use App\Services\NotificationService;

class IncidentController extends Controller
{
    /**
     * Display all incidents.
     */
    public function index(): JsonResponse
    {
     $incidents = Incident::with(['report.statusLogs', 'personnel'])
    ->latest()
    ->get();

        return response()->json([
            'success' => true,
            'message' => 'Incidents retrieved successfully.',
            'data' => $incidents,
        ]);
    }

    /**
     * Create an official incident from a prioritized report.
     */
    public function storeFromReport(Report $report): JsonResponse
    {
        // Make sure the report has been prioritized first
        if ($report->status !== 'Prioritized' || empty($report->priority)) {
            return response()->json([
                'success' => false,
                'message' => 'Only prioritized reports can be converted into incidents.',
            ], 422);
        }

        // Prevent duplicate incidents from the same report
        $existingIncident = Incident::where('report_id', $report->id)->first();

        if ($existingIncident) {
            return response()->json([
                'success' => false,
                'message' => 'An incident already exists for this report.',
                'data' => $existingIncident,
            ], 409);
        }

        // Create the incident first
        $incident = Incident::create([
            'report_id' => $report->id,

            // Temporary code based on report ID
            'incident_code' => 'INC-' . str_pad(
                $report->id,
                4,
                '0',
                STR_PAD_LEFT
            ),

            'title' => $report->report_type,
            'type' => $report->report_type,
            'category' => $report->category,
            'description' => $report->description,

            'location' => $report->location,
            'latitude' => $report->latitude,
            'longitude' => $report->longitude,

            'priority' => $report->priority,

            'status' => 'Pending Response',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Incident created successfully from prioritized report.',
           'data' => $incident->load(['report', 'personnel']),
        ], 201);
    }

public function updateAssignment(
    Request $request,
    Incident $incident,
    NotificationService $notificationService
): JsonResponse {
    $validated = $request->validate([
        'assigned_personnel_id' => [
            'required',
            'exists:personnels,id',
        ],
    ]);

    $personnel = \App\Models\Personnel::find(
        $validated['assigned_personnel_id']
    );

    if (!$personnel) {
        return response()->json([
            'success' => false,
            'message' => 'Selected personnel was not found.',
        ], 404);
    }

    if ($personnel->status !== 'Active') {
        return response()->json([
            'success' => false,
            'message' => 'Selected personnel is not active.',
        ], 422);
    }

    if (
        $personnel->availability !== 'Available' &&
        $incident->assigned_personnel_id !== $personnel->id
    ) {
        return response()->json([
            'success' => false,
            'message' => 'Selected personnel is currently unavailable.',
        ], 422);
    }

    $previousPersonnelId = $incident->assigned_personnel_id;

    $incident->update([
        'assigned_personnel_id' => $personnel->id,
    ]);

    if (
        $previousPersonnelId &&
        $previousPersonnelId !== $personnel->id
    ) {
        $previousPersonnel = \App\Models\Personnel::find(
            $previousPersonnelId
        );

        if ($previousPersonnel) {
            $previousPersonnel->update([
                'availability' => 'Available',
                'assignment' => null,
            ]);
        }
    }

    $personnel->update([
        'availability' => 'Assigned',
        'assignment' => $incident->incident_code,
    ]);


    $admin = $request->user();

AuditLog::create([
    'action' => 'Incident Personnel Assigned',
    'category' => 'Incident',
    'target' => $incident->incident_code,
    'field' => 'assigned_personnel_id',
    'old_value' => $previousPersonnelId
        ? (string) $previousPersonnelId
        : null,
    'new_value' => (string) $personnel->id,
    'remarks' => "Personnel {$personnel->name} assigned to incident {$incident->incident_code}.",
    'user_name' => $admin?->name,
    'user_role' => $admin?->role,
    'status' => 'Success',
]);

$notificationService->notifyPersonnelAssignment(
    $incident,
    $personnel
);

\App\Support\ReportBridge::assigned(
    $incident->fresh()->load('report'),
    $personnel,
    $admin
);

    return response()->json([
        'success' => true,
        'message' => 'Personnel assigned to incident successfully.',
        'data' => $incident
            ->fresh()
            ->load(['report', 'personnel']),
    ]);
}

    /**
     * Display a specific incident.
     */
    public function show(Incident $incident): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Incident retrieved successfully.',
            'data' => $incident->load(['report', 'personnel']),
        ]);
    }

    /**
     * Update the response status of an incident.
     */
    public function updateStatus(
        Request $request,
        Incident $incident
    ): JsonResponse {
        $admin = $request->user();

        abort_unless(
            $admin &&
            $admin->role === 'admin',
            403,
            'Only an Admin account may resolve or close a response case.'
        );

        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:Pending Response,Dispatched,In Progress,Resolved,Closed',
            ],

            'resolution_type' => [
                'nullable',
                'string',
                'in:resolved_on_scene,referred_handoff,no_further_barangay_response,other',
            ],

            'resolution_remarks' => [
                'nullable',
                'string',
                'max:3000',
            ],

            'handoff_agency' => [
                'nullable',
                'string',
                'max:255',
            ],

            'handoff_details' => [
                'nullable',
                'string',
                'max:3000',
            ],

            'closure_field_outcome_reviewed' => [
                'nullable',
                'boolean',
            ],

            'closure_resolution_reviewed' => [
                'nullable',
                'boolean',
            ],

            'closure_handoff_information_verified' => [
                'nullable',
                'boolean',
            ],

            'closure_ready_confirmed' => [
                'nullable',
                'boolean',
            ],
        ]);

        $currentStatus = $incident->status;
        $newStatus = $validated['status'];

        /*
         * Repeated requests are safe and idempotent.
         * This protects against accidental double-clicks
         * without creating duplicate audit events.
         */
        if ($currentStatus === $newStatus) {
            return response()->json([
                'success' => true,
                'message' =>
                    "Incident is already {$currentStatus}.",
                'data' =>
                    $incident
                        ->fresh()
                        ->load([
                            'report',
                            'personnel',
                        ]),
            ]);
        }

        /*
         * Field progress belongs to the responder.
         * Admin controls only resolution and closure.
         */
        $allowedTransitions = [
            'Pending Response' => [],
            'Dispatched' => [],
            'In Progress' => [
                'Resolved',
            ],
            'Resolved' => [
                'Closed',
            ],
            'Closed' => [],
        ];

        if (
            ! in_array(
                $newStatus,
                $allowedTransitions[$currentStatus] ?? [],
                true
            )
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    "Invalid incident status transition from {$currentStatus} to {$newStatus}.",
            ], 422);
        }

        /*
         * Resolution requires the official responder
         * field outcome and an Admin resolution record.
         */
        if ($newStatus === 'Resolved') {
            $report = $incident->report;

            $hasFieldOutcome =
                $report &&
                $report
                    ->statusLogs()
                    ->where(
                        'activity',
                        'Responder submitted field outcome'
                    )
                    ->exists();

            if (! $hasFieldOutcome) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'A responder field outcome is required before this response case can be marked resolved.',
                ], 422);
            }

            $resolutionType =
                $validated['resolution_type'] ?? null;

            $resolutionRemarks =
                trim(
                    (string) (
                        $validated['resolution_remarks']
                        ?? ''
                    )
                );

            if (
                ! $resolutionType ||
                $resolutionRemarks === ''
            ) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'Resolution type and Admin resolution remarks are required before this response case can be marked resolved.',
                ], 422);
            }

            if (
                $resolutionType ===
                'referred_handoff'
            ) {
                $handoffAgency =
                    trim(
                        (string) (
                            $validated['handoff_agency']
                            ?? ''
                        )
                    );

                $handoffDetails =
                    trim(
                        (string) (
                            $validated['handoff_details']
                            ?? ''
                        )
                    );

                if (
                    $handoffAgency === '' ||
                    $handoffDetails === ''
                ) {
                    return response()->json([
                        'success' => false,
                        'message' =>
                            'Agency / Office and handoff details are required for a referred or handed-off case.',
                    ], 422);
                }
            }
        }

        /*
         * Final closure requires an existing resolution
         * record and all Admin closure confirmations.
         */
        if ($newStatus === 'Closed') {
            if (
                ! $incident->resolution_type ||
                trim(
                    (string)
                    $incident->resolution_remarks
                ) === ''
            ) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'A completed Admin resolution record is required before final closure.',
                ], 422);
            }

            if (
                $incident->resolution_type ===
                    'referred_handoff' &&
                (
                    trim(
                        (string)
                        $incident->handoff_agency
                    ) === '' ||
                    trim(
                        (string)
                        $incident->handoff_details
                    ) === ''
                )
            ) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'Required agency handoff information must be completed before final closure.',
                ], 422);
            }

            $closureComplete =
                $request->boolean(
                    'closure_field_outcome_reviewed'
                ) &&
                $request->boolean(
                    'closure_resolution_reviewed'
                ) &&
                $request->boolean(
                    'closure_handoff_information_verified'
                ) &&
                $request->boolean(
                    'closure_ready_confirmed'
                );

            if (! $closureComplete) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'Complete all final administrative closure confirmations before closing this response case.',
                ], 422);
            }
        }

        $updates = [
            'status' => $newStatus,
        ];

        if ($newStatus === 'Resolved') {
            if (! $incident->resolved_at) {
                $updates['resolved_at'] = now();
            }

            $updates['resolution_type'] =
                $validated['resolution_type'];

            $updates['resolution_remarks'] =
                trim(
                    (string)
                    $validated['resolution_remarks']
                );

            if (
                $validated['resolution_type'] ===
                'referred_handoff'
            ) {
                $updates['handoff_agency'] =
                    trim(
                        (string)
                        $validated['handoff_agency']
                    );

                $updates['handoff_details'] =
                    trim(
                        (string)
                        $validated['handoff_details']
                    );
            } else {
                $updates['handoff_agency'] = null;
                $updates['handoff_details'] = null;
            }
        }

        if ($newStatus === 'Closed') {
            $updates[
                'closure_field_outcome_reviewed'
            ] = true;

            $updates[
                'closure_resolution_reviewed'
            ] = true;

            $updates[
                'closure_handoff_information_verified'
            ] = true;

            $updates[
                'closure_ready_confirmed'
            ] = true;

            if (! $incident->closed_at) {
                $updates['closed_at'] = now();
            }
        }

        $incident->update($updates);

        /*
         * Assigned personnel becomes available only
         * after final administrative closure.
         */
        if (
            $newStatus === 'Closed' &&
            $incident->assigned_personnel_id
        ) {
            $personnel =
                \App\Models\Personnel::find(
                    $incident->assigned_personnel_id
                );

            if ($personnel) {
                $personnel->update([
                    'availability' => 'Available',
                    'assignment' => null,
                ]);
            }
        }

        /*
         * Resolution is mirrored to the resident report.
         * Administrative closure remains internal.
         */
        \App\Support\ReportBridge::incidentStatus(
            $incident->fresh()->load('report'),
            $admin
        );

        $auditRemarks =
            match ($newStatus) {
                'Resolved' =>
                    "Incident {$incident->incident_code} marked Resolved after Admin resolution review ({$validated['resolution_type']}).",

                'Closed' =>
                    "Incident {$incident->incident_code} closed after final administrative closure checklist.",

                default =>
                    "Incident {$incident->incident_code} status changed from {$currentStatus} to {$newStatus}.",
            };

        AuditLog::create([
            'action' =>
                'Incident Status Updated',
            'category' =>
                'Incident',
            'target' =>
                $incident->incident_code,
            'field' =>
                'status',
            'old_value' =>
                $currentStatus,
            'new_value' =>
                $newStatus,
            'remarks' =>
                $auditRemarks,
            'user_name' =>
                $admin?->name,
            'user_role' =>
                $admin?->role,
            'status' =>
                'Success',
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Incident status updated successfully.',
            'data' =>
                $incident
                    ->fresh()
                    ->load([
                        'report',
                        'personnel',
                    ]),
        ]);
    }
}