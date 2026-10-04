<?php

namespace Tests\Feature;

use App\Models\Incident;
use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminResponderRoleSeparationSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_bypass_responder_field_progress_and_can_finalize_after_field_outcome(): void
    {
        $resident = User::factory()->create([
            'role' => 'resident',
        ]);

        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $responder = User::factory()->create([
            'role' => 'responder',
            'verification_status' => 'Verified',
            'status' => 'active',
            'verified_at' => now(),
        ]);

        $report = Report::create([
            'user_id' => $resident->id,
            'report_code' => 'EM-910001',
            'report_type' => 'Emergency',
            'category' => 'Medical Emergency',
            'description' => 'Resident requires emergency assistance.',
            'location' => 'Barangay Camunatan',
            'verification_status' => 'Verified',
            'status' => 'Assigned',
            'priority' => 'Critical',
        ]);

        $incident = Incident::create([
            'report_id' => $report->id,
            'incident_code' => 'INC-910001',
            'title' => 'Emergency',
            'type' => 'Emergency',
            'category' => 'Medical Emergency',
            'description' => 'Resident requires emergency assistance.',
            'location' => 'Barangay Camunatan',
            'priority' => 'Critical',
            'status' => 'Pending Response',
        ]);

        ReportAssignment::create([
            'report_id' => $report->id,
            'assigned_user_id' => $responder->id,
            'assigned_by_user_id' => $admin->id,
            'assigned_at' => now(),
            'acknowledged_at' => now(),
        ]);

        /*
         * Admin must not perform responder-owned
         * dispatch / field-progress transitions.
         */
        Sanctum::actingAs($admin);

        $dispatchAttempt = $this->patchJson(
            "/api/incidents/{$incident->id}/status",
            [
                'status' => 'Dispatched',
            ]
        );

        $dispatchAttempt
            ->assertStatus(422)
            ->assertJsonPath(
                'success',
                false
            );

        $incident->refresh();

        $this->assertSame(
            'Pending Response',
            $incident->status
        );

        /*
         * Simulate the legitimate responder lifecycle
         * having reached the scene. The case is active,
         * but no field outcome has been submitted yet.
         */
        $incident->update([
            'status' => 'In Progress',
        ]);

        $report->update([
            'status' => 'Responded',
        ]);

        /*
         * Arrival alone is insufficient for Admin
         * resolution.
         */
        $resolveWithoutOutcome = $this->patchJson(
            "/api/incidents/{$incident->id}/status",
            [
                'status' => 'Resolved',
            ]
        );

        $resolveWithoutOutcome
            ->assertStatus(422)
            ->assertJsonPath(
                'success',
                false
            )
            ->assertJsonPath(
                'message',
                'A responder field outcome is required before this response case can be marked resolved.'
            );

        $incident->refresh();

        $this->assertSame(
            'In Progress',
            $incident->status
        );

        /*
         * The field outcome must come from the
         * assigned Responder workflow.
         */
        Sanctum::actingAs($responder);

        $fieldOutcome = $this->postJson(
            "/api/app/responder/reports/{$report->report_code}/actions",
            [
                'action' => 'field-outcome',
                'remarks' =>
                    'Patient assessed on scene and transferred for further care.',
                'expectedVersion' =>
                    (int) $report->fresh()->version,
            ]
        );

        $fieldOutcome->assertOk();

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
         * Once the responder field outcome exists,
         * Admin may finalize the operational response.
         */
        Sanctum::actingAs($admin);

        $resolve = $this->patchJson(
            "/api/incidents/{$incident->id}/status",
            [
                'status' => 'Resolved',
            ]
        );

        $resolve
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'data.status',
                'Resolved'
            );

        $incident->refresh();
        $report->refresh();

        $this->assertSame(
            'Resolved',
            $incident->status
        );

        $this->assertNotNull(
            $incident->resolved_at
        );

        $this->assertSame(
            'Resolved',
            $report->status
        );

        /*
         * Final administrative closure remains
         * an Admin responsibility.
         */
        $close = $this->patchJson(
            "/api/incidents/{$incident->id}/status",
            [
                'status' => 'Closed',
            ]
        );

        $close
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'data.status',
                'Closed'
            );

        $incident->refresh();

        $this->assertSame(
            'Closed',
            $incident->status
        );

        $this->assertDatabaseHas(
            'audit_logs',
            [
                'action' => 'Incident Status Updated',
                'category' => 'Incident',
                'target' => 'INC-910001',
                'old_value' => 'Resolved',
                'new_value' => 'Closed',
                'status' => 'Success',
            ]
        );
    }
}