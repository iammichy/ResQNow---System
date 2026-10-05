<?php

namespace Tests\Feature;

use App\Models\Incident;
use App\Models\Personnel;
use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResponderDeclineAssignmentSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_decline_requires_reason_and_returns_case_for_reassignment(): void
    {
        $case = $this->makeAssignedCase(
            'EM-920001',
            'INC-920001',
            false
        );

        $report = $case['report'];
        $responder = $case['responder'];
        $personnel = $case['personnel'];
        $incident = $case['incident'];
        $assignment = $case['assignment'];

        Sanctum::actingAs($responder);

        /*
         * Decline must never be accepted without
         * a documented reason.
         */
        $missingReason = $this->postJson(
            "/api/app/responder/reports/{$report->report_code}/actions",
            [
                'action' =>
                    'decline',

                'expectedVersion' =>
                    1,
            ]
        );

        $missingReason
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'remarks',
            ]);

        $this->assertNull(
            $assignment
                ->fresh()
                ->unassigned_at
        );

        $this->assertSame(
            $personnel->id,
            $incident
                ->fresh()
                ->assigned_personnel_id
        );

        /*
         * A valid decline ends only this assignment.
         * It does not resolve or cancel the report.
         */
        $decline = $this->postJson(
            "/api/app/responder/reports/{$report->report_code}/actions",
            [
                'action' =>
                    'decline',

                'remarks' =>
                    'Currently unavailable due to another active medical response.',

                'expectedVersion' =>
                    1,
            ]
        );

        $decline
            ->assertOk()
            ->assertJsonPath(
                'data.status',
                'Assigned'
            );

        $report->refresh();
        $incident->refresh();
        $personnel->refresh();
        $assignment->refresh();

        $this->assertSame(
            'Assigned',
            $report->status
        );

        $this->assertSame(
            2,
            (int) $report->version
        );

        $this->assertNotNull(
            $assignment->unassigned_at
        );

        $this->assertNull(
            $incident->assigned_personnel_id
        );

        $this->assertSame(
            'Pending Response',
            $incident->status
        );

        $this->assertSame(
            'Available',
            $personnel->availability
        );

        $this->assertNull(
            $personnel->assignment
        );

        $this->assertDatabaseHas(
            'report_status_logs',
            [
                'report_id' =>
                    $report->id,

                'status' =>
                    'Assigned',

                'activity' =>
                    'Responder declined assignment',

                'remarks' =>
                    'Currently unavailable due to another active medical response.',

                'changed_by_user_id' =>
                    $responder->id,

                'resident_visible' =>
                    false,
            ]
        );

        $this->assertDatabaseHas(
            'resqnow_attention_requests',
            [
                'report_id' =>
                    $report->id,

                'kind' =>
                    'reassignment',

                'requested_by' =>
                    $responder->id,

                'acknowledged_at' =>
                    null,
            ]
        );

        $this->assertDatabaseHas(
            'audit_logs',
            [
                'action' =>
                    'Responder Assignment Declined',

                'category' =>
                    'Incident',

                'target' =>
                    'INC-920001',

                'user_name' =>
                    $responder->name,

                'user_role' =>
                    'responder',

                'status' =>
                    'Success',
            ]
        );

        /*
         * Once the assignment is declined, this responder
         * must immediately lose assigned-only access.
         */
        $this->getJson(
            "/api/app/responder/reports/{$report->report_code}"
        )->assertNotFound();

        /*
         * The Admin must be able to assign a different
         * responder after the decline.
         */
        $replacementResponder =
            User::factory()->create([
                'role' =>
                    'responder',

                'verification_status' =>
                    'Verified',

                'status' =>
                    'active',

                'verified_at' =>
                    now(),
            ]);

        $replacementPersonnel =
            Personnel::create([
                'personnel_code' =>
                    'RESP-REASSIGN-920001',

                'name' =>
                    $replacementResponder->name,

                'role' =>
                    'Barangay Responder',

                'team' =>
                    'Medical / First Aid',

                'status' =>
                    'Active',

                'availability' =>
                    'Available',

                'assignment' =>
                    null,

                'user_id' =>
                    $replacementResponder->id,
            ]);

        $admin =
            User::factory()->create([
                'role' =>
                    'admin',

                'account_status' =>
                    'Verified',
            ]);

        Sanctum::actingAs($admin);

        $reassignment =
            $this->patchJson(
                "/api/incidents/{$incident->id}/assignment",
                [
                    'assigned_personnel_id' =>
                        $replacementPersonnel->id,
                ]
            );

        $reassignment
            ->assertOk()
            ->assertJsonPath(
                'data.assigned_personnel_id',
                $replacementPersonnel->id
            )
            ->assertJsonPath(
                'data.assignment_monitor.hasAssignment',
                true
            )
            ->assertJsonPath(
                'data.assignment_monitor.assignedUserId',
                $replacementResponder->id
            )
            ->assertJsonPath(
                'data.assignment_monitor.acknowledged',
                false
            );

        $incident->refresh();
        $report->refresh();
        $personnel->refresh();
        $replacementPersonnel->refresh();

        $this->assertSame(
            $replacementPersonnel->id,
            $incident->assigned_personnel_id
        );

        $this->assertSame(
            'Pending Response',
            $incident->status
        );

        $this->assertSame(
            'Assigned',
            $report->status
        );

        /*
         * Responder A remains released.
         */
        $this->assertSame(
            'Available',
            $personnel->availability
        );

        $this->assertNull(
            $personnel->assignment
        );

        /*
         * Responder B receives a new, unacknowledged
         * active assignment.
         */
        $this->assertSame(
            'Assigned',
            $replacementPersonnel->availability
        );

        $this->assertSame(
            $incident->incident_code,
            $replacementPersonnel->assignment
        );

        $this->assertDatabaseHas(
            'report_assignments',
            [
                'report_id' =>
                    $report->id,

                'assigned_user_id' =>
                    $replacementResponder->id,

                'unassigned_at' =>
                    null,

                'acknowledged_at' =>
                    null,
            ]
        );

        $this->assertSame(
            1,
            ReportAssignment::query()
                ->where(
                    'report_id',
                    $report->id
                )
                ->whereNull(
                    'unassigned_at'
                )
                ->count()
        );

        $this->assertDatabaseHas(
            'audit_logs',
            [
                'action' =>
                    'Incident Personnel Assigned',

                'category' =>
                    'Incident',

                'target' =>
                    'INC-920001',

                'new_value' =>
                    (string) $replacementPersonnel->id,

                'user_name' =>
                    $admin->name,

                'user_role' =>
                    'admin',

                'status' =>
                    'Success',
            ]
        );

        /*
         * The newly assigned responder can see the case.
         */
        Sanctum::actingAs(
            $replacementResponder
        );

        $this->getJson(
            "/api/app/responder/reports/{$report->report_code}"
        )->assertOk();

        /*
         * The responder who declined still cannot access it.
         */
        Sanctum::actingAs(
            $responder
        );

        $this->getJson(
            "/api/app/responder/reports/{$report->report_code}"
        )->assertNotFound();
    }

    public function test_decline_is_rejected_after_acknowledgement(): void
    {
        $case = $this->makeAssignedCase(
            'EM-920003',
            'INC-920003',
            true
        );

        $report = $case['report'];
        $responder = $case['responder'];
        $personnel = $case['personnel'];
        $incident = $case['incident'];
        $assignment = $case['assignment'];

        Sanctum::actingAs($responder);

        /*
         * Acknowledgement is acceptance of the assignment.
         * After this point the responder must start the
         * response or request operational support instead
         * of declining the accepted assignment.
         */
        $attempt = $this->postJson(
            "/api/app/responder/reports/{$report->report_code}/actions",
            [
                'action' =>
                    'decline',

                'remarks' =>
                    'Attempting to decline after accepting the assignment.',

                'expectedVersion' =>
                    1,
            ]
        );

        $attempt
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'action',
            ]);

        $this->assertNull(
            $assignment
                ->fresh()
                ->unassigned_at
        );

        $this->assertSame(
            $personnel->id,
            $incident
                ->fresh()
                ->assigned_personnel_id
        );

        $this->assertSame(
            'Assigned',
            $personnel
                ->fresh()
                ->availability
        );

        $this->assertDatabaseMissing(
            'report_status_logs',
            [
                'report_id' =>
                    $report->id,

                'activity' =>
                    'Responder declined assignment',
            ]
        );
    }

    public function test_decline_is_rejected_after_response_has_started(): void
    {
        $case = $this->makeAssignedCase(
            'EM-920002',
            'INC-920002',
            true
        );

        $report = $case['report'];
        $responder = $case['responder'];
        $personnel = $case['personnel'];
        $incident = $case['incident'];
        $assignment = $case['assignment'];

        $report->update([
            'status' =>
                'In Progress',
        ]);

        $incident->update([
            'status' =>
                'In Progress',
        ]);

        Sanctum::actingAs($responder);

        $attempt = $this->postJson(
            "/api/app/responder/reports/{$report->report_code}/actions",
            [
                'action' =>
                    'decline',

                'remarks' =>
                    'Attempting to decline after response already started.',

                'expectedVersion' =>
                    1,
            ]
        );

        $attempt
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'action',
            ]);

        $this->assertNull(
            $assignment
                ->fresh()
                ->unassigned_at
        );

        $this->assertSame(
            $personnel->id,
            $incident
                ->fresh()
                ->assigned_personnel_id
        );

        $this->assertSame(
            'Assigned',
            $personnel
                ->fresh()
                ->availability
        );

        $this->assertDatabaseMissing(
            'report_status_logs',
            [
                'report_id' =>
                    $report->id,

                'activity' =>
                    'Responder declined assignment',
            ]
        );
    }

    private function makeAssignedCase(
        string $reportCode,
        string $incidentCode,
        bool $acknowledged
    ): array {
        $resident =
            User::factory()->create([
                'role' =>
                    'resident',

                'account_status' =>
                    'Verified',
            ]);

        $responder =
            User::factory()->create([
                'role' =>
                    'responder',

                'verification_status' =>
                    'Verified',

                'status' =>
                    'active',

                'verified_at' =>
                    now(),
            ]);

        $personnel =
            Personnel::create([
                'personnel_code' =>
                    'RESP-' . substr(
                        $reportCode,
                        -6
                    ),

                'name' =>
                    $responder->name,

                'role' =>
                    'Barangay Responder',

                'team' =>
                    'Medical / First Aid',

                'status' =>
                    'Active',

                'availability' =>
                    'Assigned',

                'assignment' =>
                    $incidentCode,

                'user_id' =>
                    $responder->id,
            ]);

        $report =
            Report::create([
                'user_id' =>
                    $resident->id,

                'report_code' =>
                    $reportCode,

                'report_type' =>
                    'Emergency',

                'category' =>
                    'Medical Emergency',

                'description' =>
                    'Resident requires emergency assistance.',

                'location' =>
                    'Barangay Camunatan',

                'verification_status' =>
                    'Verified',

                'status' =>
                    'Assigned',

                'priority' =>
                    'Critical',
            ]);

        $incident =
            Incident::create([
                'report_id' =>
                    $report->id,

                'incident_code' =>
                    $incidentCode,

                'title' =>
                    'Medical Emergency',

                'type' =>
                    'Emergency',

                'category' =>
                    'Medical Emergency',

                'description' =>
                    'Resident requires emergency assistance.',

                'location' =>
                    'Barangay Camunatan',

                'priority' =>
                    'Critical',

                'assigned_personnel_id' =>
                    $personnel->id,

                'status' =>
                    'Pending Response',
            ]);

        $assignment =
            ReportAssignment::create([
                'report_id' =>
                    $report->id,

                'assigned_user_id' =>
                    $responder->id,

                'assigned_at' =>
                    now(),

                'acknowledged_at' =>
                    $acknowledged
                        ? now()
                        : null,
            ]);

        return [
            'resident' =>
                $resident,

            'responder' =>
                $responder,

            'personnel' =>
                $personnel,

            'report' =>
                $report,

            'incident' =>
                $incident,

            'assignment' =>
                $assignment,
        ];
    }
}