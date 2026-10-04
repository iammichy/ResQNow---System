<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminPriorityPhase4SmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_override_system_computed_priority_and_can_confirm_matching_result(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        $report = Report::create([
            'report_type' => 'Non-Emergency',
            'category' => 'Road Obstruction',
            'description' => 'Road is partially blocked.',
            'location' => 'Barangay road',
            'verification_status' => 'Verified',
            'status' => 'For Prioritization',

            /*
             * The authoritative result already computed
             * by the system from factual SVF answers.
             */
            'priority' => 'High',
            'triage_score' => 60,
            'triage_recommendation' => 'High',
            'triage_flags' => [
                'Road access is partially blocked',
                'People are at risk',
            ],
            'triage_rule_version' =>
                'camunatan-non-emergency-v1',
            'triage_recalculated_at' => now(),
        ]);

        /*
         * Admin attempts to force a different priority.
         * This must never be accepted.
         */
        $overrideAttempt = $this->patchJson(
            "/api/reports/{$report->id}/priority",
            [
                'priority' => 'Critical',
                'override_reason' =>
                    'Trying to manually raise the priority.',
            ]
        );

        $overrideAttempt
            ->assertStatus(422)
            ->assertJsonPath(
                'success',
                false
            )
            ->assertJsonPath(
                'message',
                'Manual priority changes are not allowed. Verify or correct the factual situation data so the system can recompute the priority.'
            );

        $report->refresh();

        $this->assertSame(
            'High',
            $report->priority
        );

        $this->assertSame(
            'High',
            $report->triage_recommendation
        );

        $this->assertSame(
            'For Prioritization',
            $report->status
        );

        $this->assertNull(
            $report->priority_override_reason
        );

        $this->assertDatabaseMissing(
            'audit_logs',
            [
                'target' => (string) $report->id,
                'action' => 'System Priority Confirmed',
            ]
        );

        /*
         * Admin confirms the exact result produced
         * by the system.
         */
        $confirmation = $this->patchJson(
            "/api/reports/{$report->id}/priority",
            [
                'priority' => 'High',
            ]
        );

        $confirmation
            ->assertOk()
            ->assertJsonPath(
                'success',
                true
            )
            ->assertJsonPath(
                'data.priority',
                'High'
            )
            ->assertJsonPath(
                'data.status',
                'Prioritized'
            );

        $report->refresh();

        $this->assertSame(
            'High',
            $report->priority
        );

        $this->assertSame(
            'High',
            $report->triage_recommendation
        );

        $this->assertSame(
            'Prioritized',
            $report->status
        );

        $this->assertNull(
            $report->priority_override_reason
        );

        $this->assertSame(
            $admin->id,
            $report->priority_assigned_by
        );

        $this->assertNotNull(
            $report->priority_assigned_at
        );

        $this->assertDatabaseHas(
            'audit_logs',
            [
                'target' => (string) $report->id,
                'action' => 'System Priority Confirmed',
                'field' => 'priority',
                'new_value' => 'High',
                'status' => 'Success',
            ]
        );
    }
}
