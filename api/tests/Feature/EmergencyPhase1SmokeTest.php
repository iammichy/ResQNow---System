<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmergencyPhase1SmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_resident_can_submit_emergency_with_svf_triage_and_idempotency(): void
    {
        $resident = User::factory()->create([
            'role' => 'resident',
            'account_status' => 'Verified',
        ]);

        Sanctum::actingAs($resident, ['*']);

        $requestId = (string) Str::uuid();

        $payload = [
            'clientRequestId' => $requestId,
            'concernCode' => 'fire',
            'svfAnswers' => [
                'immediateDanger' => 'no',
                'fireCondition' => 'small_contained',
                'electricalHazard' => 'none',
                'exitCondition' => 'clear',
            ],
            'location' => 'Purok 1, Barangay Camunatan, City of Ilagan',
            'locationSource' => 'manual',
            'reportingForOther' => false,
            'description' => 'Phase 1 local emergency smoke test.',
        ];

        $first = $this->postJson('/api/app/reports/emergency', $payload);

        $first
            ->assertCreated()
            ->assertJsonPath('duplicateSubmissionPrevented', false)
            ->assertJsonPath('report.priority', 'Moderate')
            ->assertJsonPath('report.triage.computedResult', 'Moderate')
            ->assertJsonPath('report.triage.score', 25)
            ->assertJsonPath('report.triage.ruleVersion', 'camunatan-emergency-v1')
            ->assertJsonPath('report.svf.category', 'fire')
            ->assertJsonPath('report.svf.answers.fireCondition', 'small_contained');

        $report = Report::query()
            ->where('user_id', $resident->id)
            ->where('client_request_id', $requestId)
            ->firstOrFail();

        $this->assertSame('Emergency', $report->report_type);
        $this->assertSame('Moderate', $report->priority);
        $this->assertSame(25, (int) $report->triage_score);
        $this->assertSame(
            'camunatan-emergency-v1',
            $report->triage_rule_version
        );

        $this->assertDatabaseHas('report_svf_answers', [
            'report_id' => $report->id,
            'category' => 'fire',
            'rule_version' => 'camunatan-emergency-v1',
        ]);

        $this->assertDatabaseHas('report_status_logs', [
            'report_id' => $report->id,
            'status' => 'Submitted',
            'activity' => 'Resident submitted emergency report',
        ]);

        $second = $this->postJson('/api/app/reports/emergency', $payload);

        $second
            ->assertOk()
            ->assertJsonPath('duplicateSubmissionPrevented', true)
            ->assertJsonPath('report.priority', 'Moderate');

        $this->assertSame(
            1,
            Report::query()
                ->where('user_id', $resident->id)
                ->where('client_request_id', $requestId)
                ->count()
        );
    }
}