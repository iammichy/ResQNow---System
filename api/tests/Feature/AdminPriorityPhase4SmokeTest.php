<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
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

    public function test_admin_fact_correction_recomputes_priority_automatically(): void
    {
        /*
         * Resident first submits factual SVF answers that
         * produce a High system priority.
         */
        $resident = User::factory()->create([
            'role' => 'resident',
            'account_status' => 'Verified',
        ]);

        Sanctum::actingAs($resident);

        $clientRequestId = (string) Str::uuid();

        $submission = $this->postJson(
            '/api/app/reports/non-emergency',
            [
                'clientRequestId' => $clientRequestId,
                'concernCode' => 'road-obstruction',
                'subcategory' => 'Fallen Tree / Branch',

                'svfAnswers' => [
                    'roadAccess' => 'partial',
                    'peopleAtRisk' => 'yes',
                    'hazardCondition' => 'stable',
                ],

                'noPhotoReason' =>
                    'Unsafe to approach the obstruction.',

                'reportingFor' => 'Myself',
                'purok' => 'Purok 1',
                'location' => 'Main barangay road',

                'description' =>
                    'A fallen branch is partially blocking the road.',
            ]
        );

        $submission
            ->assertCreated()
            ->assertJsonPath(
                'report.priority',
                null
            )
            ->assertJsonPath(
                'report.triage.score',
                null
            );

        $report = Report::query()
            ->where(
                'client_request_id',
                $clientRequestId
            )
            ->firstOrFail();

        /*
         * Admin now reviews the report.
         */
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        /*
         * The verification queue must expose the allowed
         * factual choices to the Admin UI.
         */
        $queue = $this->getJson(
            '/api/reports/for-verification'
        );

        $queue
            ->assertOk()
            ->assertJsonPath(
                'data.0.svf_allowed_answers.roadAccess.2',
                'blocked'
            )
            ->assertJsonPath(
                'data.0.svf_allowed_answers.hazardCondition.2',
                'dangerous_object_or_wire'
            );

        /*
         * Admin corrects FACTS only.
         *
         * blocked road            = 40
         * people at risk          = 40
         * dangerous object/wire   = 70
         * blocked + dangerous     = 25
         *
         * Score is capped at 100 => Critical.
         *
         * Admin never submits "Critical".
         */
        $verification = $this->patchJson(
            "/api/reports/{$report->id}/verify",
            [
                'svfAnswers' => [
                    'roadAccess' => 'blocked',
                    'peopleAtRisk' => 'yes',
                    'hazardCondition' =>
                        'dangerous_object_or_wire',
                ],
            ]
        );

        $verification
            ->assertOk()
            ->assertJsonPath(
                'data.verification_status',
                'Verified'
            )
            ->assertJsonPath(
                'data.status',
                'For Prioritization'
            )
            ->assertJsonPath(
                'data.priority',
                'Critical'
            )
            ->assertJsonPath(
                'data.triage_score',
                100
            )
            ->assertJsonPath(
                'data.triage_recommendation',
                'Critical'
            )
            ->assertJsonPath(
                'data.triage_rule_version',
                'camunatan-non-emergency-v1'
            )
            ->assertJsonPath(
                'data.svf_answer.answers.roadAccess',
                'blocked'
            )
            ->assertJsonPath(
                'data.svf_answer.answers.peopleAtRisk',
                'yes'
            )
            ->assertJsonPath(
                'data.svf_answer.answers.hazardCondition',
                'dangerous_object_or_wire'
            );

        $report->refresh();
        $report->load('svfAnswer');

        $this->assertSame(
            'Critical',
            $report->priority
        );

        $this->assertSame(
            100,
            $report->triage_score
        );

        $this->assertSame(
            'Critical',
            $report->triage_recommendation
        );

        $this->assertSame(
            'blocked',
            $report->svfAnswer->answers['roadAccess']
        );

        $this->assertSame(
            'dangerous_object_or_wire',
            $report->svfAnswer->answers['hazardCondition']
        );

        $this->assertNull(
            $report->priority_override_reason
        );

        /*
         * Audit trail must prove:
         * facts changed -> system recomputed -> report verified.
         */
        $this->assertDatabaseHas(
            'audit_logs',
            [
                'target' => (string) $report->id,
                'action' => 'SVF Facts Corrected',
                'field' => 'svf_answers',
                'status' => 'Success',
            ]
        );

        $this->assertDatabaseHas(
            'audit_logs',
            [
                'target' => (string) $report->id,
                'action' => 'System Triage Recomputed',
                'field' => 'priority',
                'old_value' => 'High',
                'new_value' => 'Critical',
                'status' => 'Success',
            ]
        );

        $this->assertDatabaseHas(
            'audit_logs',
            [
                'target' => (string) $report->id,
                'action' => 'Report Verified',
                'old_value' => 'Pending',
                'new_value' => 'Verified',
                'status' => 'Success',
            ]
        );
    }

    public function test_authoritative_triage_cannot_be_reassessed_and_can_be_confirmed_without_client_priority(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        Sanctum::actingAs($admin);

        /*
         * Modern resident report with an SVF-based triage result.
         */
        $report = Report::create([
            'report_type' => 'Non-Emergency',
            'category' => 'Road Obstruction',
            'description' => 'Road obstruction report.',
            'location' => 'Barangay road',
            'verification_status' => 'Verified',
            'status' => 'For Prioritization',
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

        $report->svfAnswer()->create([
            'category' => 'road-obstruction',
            'answers' => [
                'roadAccess' => 'partial',
                'peopleAtRisk' => 'yes',
                'hazardCondition' => 'stable',
            ],
            'flags' => [
                'Road access is partially blocked',
                'People are at risk',
            ],
            'rule_version' =>
                'camunatan-non-emergency-v1',
        ]);

        /*
         * The obsolete 20-point questionnaire must not be
         * allowed to replace this authoritative result.
         */
        $legacyAttempt = $this->postJson(
            "/api/reports/{$report->id}/triage",
            [
                'water_level' => 'Waist level or higher',
                'road_passability' => 'Impassable',
                'affected_residents' => 50,
                'location_risk' => 'Critical',
                'assistance_evacuation_need' =>
                    'Immediate evacuation required',
            ]
        );

        $legacyAttempt
            ->assertStatus(422)
            ->assertJsonPath(
                'success',
                false
            )
            ->assertJsonPath(
                'message',
                'This report already has an authoritative system triage result. Confirm the existing system priority instead of reassessing it.'
            );

        $report->refresh();

        $this->assertSame(
            60,
            $report->triage_score
        );

        $this->assertSame(
            'High',
            $report->triage_recommendation
        );

        /*
         * Modern Admin UI sends no chosen priority.
         * Backend must confirm its own stored result.
         */
        $confirmation = $this->patchJson(
            "/api/reports/{$report->id}/priority",
            []
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
            'Prioritized',
            $report->status
        );

        $this->assertSame(
            $admin->id,
            $report->priority_assigned_by
        );

        $this->assertDatabaseHas(
            'audit_logs',
            [
                'target' => (string) $report->id,
                'action' => 'System Priority Confirmed',
                'new_value' => 'High',
                'status' => 'Success',
            ]
        );

        /*
         * SOS has no SVF row, but its camunatan-sos-v1 result
         * is also authoritative and must never enter legacy triage.
         */
        $sosReport = Report::create([
            'report_type' => 'Emergency',
            'category' => 'SOS',
            'description' => 'Immediate emergency assistance requested.',
            'location' => 'Barangay Camunatan',
            'verification_status' => 'Verified',
            'status' => 'For Prioritization',
            'priority' => 'Critical',
            'triage_score' => 100,
            'triage_recommendation' => 'Critical',
            'triage_flags' => [
                'SOS emergency report',
            ],
            'triage_rule_version' =>
                'camunatan-sos-v1',
            'triage_recalculated_at' => now(),
        ]);

        $sosLegacyAttempt = $this->postJson(
            "/api/reports/{$sosReport->id}/triage",
            [
                'water_level' => 'None',
                'road_passability' => 'Fully passable',
                'affected_residents' => 1,
                'location_risk' => 'Low',
                'assistance_evacuation_need' =>
                    'No immediate assistance needed',
            ]
        );

        $sosLegacyAttempt
            ->assertStatus(422)
            ->assertJsonPath(
                'success',
                false
            );

        $sosReport->refresh();

        $this->assertSame(
            100,
            $sosReport->triage_score
        );

        $this->assertSame(
            'Critical',
            $sosReport->triage_recommendation
        );
    }
}
