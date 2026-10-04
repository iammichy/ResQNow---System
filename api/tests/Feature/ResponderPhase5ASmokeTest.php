<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResponderPhase5ASmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_responder_can_submit_field_outcome_but_cannot_resolve_report(): void
    {
        $resident = User::factory()->create([
            'role' => 'resident',
        ]);

        $responder = User::factory()->create([
            'role' => 'responder',
            'verification_status' => 'Verified',
            'status' => 'active',
            'verified_at' => now(),
        ]);

        $report = Report::create([
            'user_id' => $resident->id,
            'report_code' => 'EM-900001',
            'report_type' => 'Emergency',
            'category' => 'Medical Emergency',
            'description' => 'Resident requires emergency assistance.',
            'location' => 'Barangay Camunatan',
            'verification_status' => 'Verified',
            'status' => 'Responded',
            'priority' => 'Critical',
        ]);

        ReportAssignment::create([
            'report_id' => $report->id,
            'assigned_user_id' => $responder->id,
            'assigned_at' => now(),
            'acknowledged_at' => now(),
        ]);

        Sanctum::actingAs($responder);

        /*
         * Diagnostic guards: prove that the seeded report and
         * active assignment are visible through the same access
         * scope used by the responder controller.
         */
        $this->assertSame(
            'EM-900001',
            $report->fresh()->report_code
        );

        $this->assertDatabaseHas(
            'report_assignments',
            [
                'report_id' => $report->id,
                'assigned_user_id' => $responder->id,
                'unassigned_at' => null,
            ]
        );

        $this->assertTrue(
            \App\Support\ReportAccess::forUser($responder)
                ->where(
                    'report_code',
                    $report->report_code
                )
                ->exists()
        );

        /*
         * A responder may submit the field outcome,
         * but this must NOT close or resolve the report.
         */
        $fieldOutcome = $this->postJson(
            "/api/app/responder/reports/{$report->report_code}/actions",
            [
                'action' => 'field-outcome',
                'remarks' =>
                    'Patient assessed on scene and transferred for further care.',
                'expectedVersion' => 1,
            ]
        );

        $fieldOutcome->assertOk();

        $report->refresh();

        $this->assertSame(
            'Responded',
            $report->status
        );

        $this->assertNull(
            $report->resolved_remarks
        );

        $this->assertSame(
            2,
            (int) $report->version
        );

        $this->assertDatabaseHas(
            'report_status_logs',
            [
                'report_id' => $report->id,
                'status' => 'Responded',
                'activity' =>
                    'Responder submitted field outcome',
                'changed_by_user_id' =>
                    $responder->id,
            ]
        );
        /*
         * The official field outcome is one-time only.
         * A repeated direct API request must be rejected
         * without changing the report or creating another
         * official field-outcome record.
         */
        $duplicateFieldOutcome = $this->postJson(
            "/api/app/responder/reports/{$report->report_code}/actions",
            [
                'action' => 'field-outcome',
                'remarks' =>
                    'Duplicate field outcome must not be accepted.',
                'expectedVersion' => 2,
            ]
        );

        $duplicateFieldOutcome
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'action',
            ]);

        $report->refresh();

        $this->assertSame(
            2,
            (int) $report->version
        );

        $this->assertSame(
            1,
            $report
                ->statusLogs()
                ->where(
                    'activity',
                    'Responder submitted field outcome'
                )
                ->count()
        );

        /*
         * Operational exception requests must be recorded
         * for barangay/Admin attention without changing
         * the report lifecycle status.
         */
        $supportRequest = $this->postJson(
            "/api/app/responder/reports/{$report->report_code}/actions",
            [
                'action' => 'support',
                'remarks' =>
                    'Additional medical transport support is required.',
                'expectedVersion' => 2,
            ]
        );

        $supportRequest->assertOk();

        $report->refresh();

        $this->assertSame(
            'Responded',
            $report->status
        );

        $this->assertSame(
            3,
            (int) $report->version
        );

        $this->assertDatabaseHas(
            'resqnow_attention_requests',
            [
                'report_id' => $report->id,
                'kind' => 'support',
                'requested_by' => $responder->id,
            ]
        );

        /*
         * Final resolution belongs to the barangay/Admin.
         * The responder API must reject the old resolve action.
         */
        $resolveAttempt = $this->postJson(
            "/api/app/responder/reports/{$report->report_code}/actions",
            [
                'action' => 'resolve',
                'remarks' =>
                    'Responder attempted to close the case.',
                'expectedVersion' => 3,
            ]
        );

        $resolveAttempt
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'action',
            ]);

        $report->refresh();

        $this->assertSame(
            'Responded',
            $report->status
        );

        $this->assertNull(
            $report->resolved_remarks
        );
    }
}
