<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Report;
use App\Services\TriageService;
use App\Services\NotificationService;
use App\Services\Triage\SvfVerificationService;
use App\Support\ReportBridge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(): JsonResponse
    {
        $reports = Report::with('user')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Reports retrieved successfully.',
            'data' => $reports,
        ]);
    }

    public function forVerification(
        SvfVerificationService $svfVerification
    ): JsonResponse {
        $reports = Report::with(['user', 'svfAnswer'])
            ->where('verification_status', 'Pending')
            ->latest()
            ->get();

        $reports->each(function (Report $report) use ($svfVerification) {
            $report->setAttribute(
                'svf_allowed_answers',
                $svfVerification->allowedAnswers($report)
            );
        });

        return response()->json([
            'success' => true,
            'message' => 'Reports for verification retrieved successfully.',
            'data' => $reports,
        ]);
    }

    public function verify(
        Request $request,
        Report $report,
        SvfVerificationService $svfVerification
    ): JsonResponse {
        if ($report->verification_status !== 'Pending') {
            return response()->json([
                'success' => false,
                'message' => 'This report has already been reviewed.',
            ], 422);
        }

        $validated = $request->validate([
            'svfAnswers' => ['sometimes', 'array'],
            'svfAnswers.*' => ['nullable', 'string', 'max:80'],
        ]);

        $submittedAnswers = array_key_exists('svfAnswers', $validated)
            ? $validated['svfAnswers']
            : null;

        $admin = $request->user();

        DB::transaction(function () use (
            $report,
            $submittedAnswers,
            $svfVerification,
            $admin
        ) {
            $prepared = $svfVerification->prepare(
                $report,
                $submittedAnswers
            );

            if ($prepared['hasSvf']) {
                $result = $prepared['result'];

                $report->svfAnswer->update([
                    'answers' => $prepared['mergedAnswers'],
                    'flags' => $result['flags'],
                    'rule_version' => $result['ruleVersion'],
                ]);

                $oldPriority = $report->priority;
                $oldScore = $report->triage_score;

                $report->update([
                    'priority' => $result['priority'],
                    'triage_score' => $result['score'],
                    'triage_recommendation' => $result['priority'],
                    'triage_flags' => $result['flags'],
                    'triage_rule_version' => $result['ruleVersion'],
                    'triage_recalculated_at' => now(),
                    'priority_override_reason' => null,
                ]);

                if ($prepared['oldFacts'] !== $prepared['facts']) {
                    AuditLog::create([
                        'action' => 'SVF Facts Corrected',
                        'category' => 'Report',
                        'target' => (string) $report->id,
                        'field' => 'svf_answers',
                        'old_value' => json_encode(
                            $prepared['oldFacts'],
                            JSON_UNESCAPED_SLASHES
                        ),
                        'new_value' => json_encode(
                            $prepared['facts'],
                            JSON_UNESCAPED_SLASHES
                        ),
                        'remarks' => 'Administrator corrected factual situation-check answers before verification.',
                        'user_name' => $admin?->name,
                        'user_role' => $admin?->role,
                        'status' => 'Success',
                    ]);
                }

                AuditLog::create([
                    'action' => 'System Triage Recomputed',
                    'category' => 'Report',
                    'target' => (string) $report->id,
                    'field' => 'priority',
                    'old_value' => $oldPriority,
                    'new_value' => $result['priority'],
                    'remarks' => sprintf(
                        'System recomputed triage from verified facts. Score: %s -> %s. Rule: %s.',
                        $oldScore ?? 'none',
                        $result['score'],
                        $result['ruleVersion']
                    ),
                    'user_name' => $admin?->name,
                    'user_role' => $admin?->role,
                    'status' => 'Success',
                ]);
            }

            $report->update([
                'verification_status' => 'Verified',
                'status' => 'For Prioritization',
            ]);

            AuditLog::create([
                'action' => 'Report Verified',
                'category' => 'Report',
                'target' => (string) $report->id,
                'field' => 'verification_status',
                'old_value' => 'Pending',
                'new_value' => 'Verified',
                'remarks' => $prepared['hasSvf']
                    ? 'Factual situation data verified and system triage recomputed.'
                    : 'Report passed initial verification.',
                'user_name' => $admin?->name,
                'user_role' => $admin?->role,
                'status' => 'Success',
            ]);
        });

        ReportBridge::record(
            $report,
            'Verified',
            'Your report has been verified by barangay personnel.',
            $admin?->id
        );

        $freshReport = $report->fresh(['user', 'svfAnswer']);

        $freshReport->setAttribute(
            'svf_allowed_answers',
            $svfVerification->allowedAnswers($freshReport)
        );

        return response()->json([
            'success' => true,
            'message' => 'Report verified successfully.',
            'data' => $freshReport,
        ]);
    }

      public function returnForReview(Request $request, Report $report): JsonResponse
    {
        if ($report->verification_status !== 'Pending') {
            return response()->json([
                'success' => false,
                'message' => 'This report has already been reviewed.',
            ], 422);
        }

        $validated = $request->validate([
            'remarks' => ['required', 'string', 'max:2000'],
        ]);

        $admin = $request->user();

        $report->update([
            'verification_status' => 'Returned',
            'verification_remarks' => $validated['remarks'],
            'returned_at' => now(),
            'returned_by' => $admin?->id,
        ]);

        AuditLog::create([
            'action' => 'Report Returned for Review',
            'category' => 'Report',
            'target' => (string) $report->id,
            'field' => 'verification_status',
            'old_value' => 'Pending',
            'new_value' => 'Returned',
            'remarks' => $validated['remarks'],
            'user_name' => $admin?->name,
            'user_role' => $admin?->role,
            'status' => 'Success',
        ]);

        ReportBridge::record(
            $report,
            'Pending Verification',
            $validated['remarks'],
            $admin?->id,
            'Returned for review'
        );

        return response()->json([
            'success' => true,
            'message' => 'Report returned for review successfully.',
            'data' => $report->fresh('user'),
        ]);
    }

    public function forPrioritization(): JsonResponse
    {

    
        $reports = Report::with('user')
            ->where('verification_status', 'Verified')
            ->where('status', 'For Prioritization')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Reports for prioritization retrieved successfully.',
            'data' => $reports,
        ]);
    
    }

    public function assessTriage(
        Request $request,
        Report $report,
        TriageService $triageService
    ): JsonResponse {
        if (
            $report->verification_status !== 'Verified' ||
            $report->status !== 'For Prioritization'
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Only verified reports awaiting prioritization can be triaged.',
            ], 422);
        }

        $validated = $request->validate([
            'water_level' => [
                'nullable',
                'string',
                'in:None,Not applicable,Below knee level,Knee level,Above knee level,Waist level or higher',
            ],
            'road_passability' => [
                'nullable',
                'string',
                'in:Fully passable,Passable with caution,Partially passable,Difficult to pass,Impassable',
            ],
            'affected_residents' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'location_risk' => [
                'nullable',
                'string',
                'in:Low,Moderate,High,Critical',
            ],
            'assistance_evacuation_need' => [
                'nullable',
                'string',
                'in:No immediate assistance needed,Assistance needed,Urgent assistance needed,Evacuation recommended,Immediate evacuation required',
            ],
            'additional_risk_factors' => [
                'nullable',
                'array',
            ],
            'additional_risk_factors.*' => [
                'string',
                'max:100',
            ],
            'triage_remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        $assessment = $triageService->assess($validated);
        $admin = $request->user();

        $report->update([
            'water_level' => $validated['water_level'] ?? null,
            'road_passability' => $validated['road_passability'] ?? null,
            'affected_residents' => $validated['affected_residents'] ?? null,
            'location_risk' => $validated['location_risk'] ?? null,
            'assistance_evacuation_need' => $validated['assistance_evacuation_need'] ?? null,
            'additional_risk_factors' => $validated['additional_risk_factors'] ?? [],
            'triage_score' => $assessment['score'],
            'triage_recommendation' => $assessment['recommendation'],
            'triage_remarks' => $validated['triage_remarks'] ?? null,
            'triage_assessed_at' => now(),
            'triage_assessed_by' => $admin?->id,
        ]);

        AuditLog::create([
            'action' => 'Triage Assessment Completed',
            'category' => 'Triage',
            'target' => (string) $report->id,
            'field' => 'triage_recommendation',
            'old_value' => $report->getOriginal('triage_recommendation'),
            'new_value' => $assessment['recommendation'],
            'remarks' => 'Triage score: ' . $assessment['score'] . '/20. Recommendation generated from predefined operational parameters.',
            'user_name' => $admin?->name,
            'user_role' => $admin?->role,
            'status' => 'Success',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Triage assessment completed successfully.',
            'data' => [
                'report' => $report->fresh('user'),
                'score' => $assessment['score'],
                'recommendation' => $assessment['recommendation'],
                'factor_scores' => $assessment['factor_scores'],
            ],
        ]);
    }
    public function assignPriority(
        Request $request,
        Report $report,
        NotificationService $notificationService
    ): JsonResponse {
        if (
            $report->verification_status !== 'Verified' ||
            $report->status !== 'For Prioritization'
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Only verified reports awaiting prioritization can be confirmed.',
            ], 422);
        }

        $systemPriority = $report->triage_recommendation;

        if (
            $systemPriority === null ||
            ! in_array(
                $systemPriority,
                ['Critical', 'High', 'Moderate', 'Low'],
                true
            )
        ) {
            return response()->json([
                'success' => false,
                'message' => 'A valid system-computed triage result is required before prioritization can be confirmed.',
            ], 422);
        }

        /*
         * Backward-compatible protection while the Admin frontend is
         * being updated:
         *
         * The client may still send the currently displayed priority,
         * but it can never change the system-computed result.
         */
        $requestedPriority = $request->input('priority');

        if (
            $requestedPriority !== null &&
            $requestedPriority !== $systemPriority
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Manual priority changes are not allowed. Verify or correct the factual situation data so the system can recompute the priority.',
            ], 422);
        }

        $oldPriority = $report->priority;
        $admin = $request->user();

        $report->update([
            'priority' => $systemPriority,
            'priority_override_reason' => null,
            'priority_assigned_at' => now(),
            'priority_assigned_by' => $admin?->id,
            'status' => 'Prioritized',
        ]);

        AuditLog::create([
            'action' => 'System Priority Confirmed',
            'category' => 'Prioritization',
            'target' => (string) $report->id,
            'field' => 'priority',
            'old_value' => $oldPriority,
            'new_value' => $systemPriority,
            'remarks' =>
                'System-computed priority confirmed. Manual priority override is disabled.',
            'user_name' => $admin?->name,
            'user_role' => $admin?->role,
            'status' => 'Success',
        ]);

        if ($systemPriority === 'Critical') {
            $notificationService->notifyCriticalReport($report);
        }

        return response()->json([
            'success' => true,
            'message' => 'System-computed report priority confirmed successfully.',
            'data' => $report->fresh('user'),
        ]);
    }

   public function store(
    Request $request,
    TriageService $triageService
): JsonResponse {
    $validated = $request->validate([
        'report_type' => ['required', 'string', 'max:255'],
        'category' => ['required', 'string', 'max:255'],
        'description' => ['nullable', 'string'],
        'location' => ['required', 'string', 'max:255'],
        'latitude' => ['nullable', 'numeric'],
        'longitude' => ['nullable', 'numeric'],

        'water_level' => ['nullable', 'string', 'max:100'],
        'road_passability' => ['nullable', 'string', 'max:100'],
        'affected_residents' => ['nullable', 'integer', 'min:0'],
        'location_risk' => ['nullable', 'string', 'max:100'],
        'assistance_evacuation_need' => ['nullable', 'string', 'max:150'],
        'additional_risk_factors' => ['nullable', 'array'],
        'triage_remarks' => ['nullable', 'string'],
    ]);

    /*
     * Calculate the initial automated triage.
     *
     * This is a SYSTEM RECOMMENDATION only.
     * It does not set the final report priority.
     */
    $triage = $triageService->assess([
        'water_level' => $validated['water_level'] ?? null,
        'road_passability' => $validated['road_passability'] ?? null,
        'affected_residents' => $validated['affected_residents'] ?? null,
        'location_risk' => $validated['location_risk'] ?? null,
        'assistance_evacuation_need' =>
            $validated['assistance_evacuation_need'] ?? null,
        'additional_risk_factors' =>
            $validated['additional_risk_factors'] ?? [],
    ]);

    $report = Report::create([
        'report_type' => $validated['report_type'],
        'category' => $validated['category'],
        'description' => $validated['description'] ?? null,
        'location' => $validated['location'],
        'latitude' => $validated['latitude'] ?? null,
        'longitude' => $validated['longitude'] ?? null,

        /*
         * Resident-submitted assessment data
         */
        'water_level' =>
            $validated['water_level'] ?? null,

        'road_passability' =>
            $validated['road_passability'] ?? null,

        'affected_residents' =>
            $validated['affected_residents'] ?? null,

        'location_risk' =>
            $validated['location_risk'] ?? null,

        'assistance_evacuation_need' =>
            $validated['assistance_evacuation_need'] ?? null,

        'additional_risk_factors' =>
            $validated['additional_risk_factors'] ?? null,

        'triage_remarks' =>
            $validated['triage_remarks'] ?? null,

        /*
         * SYSTEM-GENERATED TRIAGE
         */
        'triage_score' => $triage['score'],
        'triage_recommendation' => $triage['recommendation'],
        'triage_assessed_at' => now(),

        /*
         * Workflow state
         */
        'status' => 'For Verification',
        'verification_status' => 'Pending',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Report created and automatically assessed successfully.',
        'data' => $report,
    ], 201);
}
}