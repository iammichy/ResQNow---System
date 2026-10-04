<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SosPhase2SmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_resident_can_submit_critical_sos_with_quick_reason_and_replay_safely(): void
    {
        $resident = User::factory()->create([
            'role' => 'resident',
            'account_status' => 'Verified',
        ]);

        Sanctum::actingAs($resident);

        $clientRequestId = (string) Str::uuid();

        $headers = [
            'X-Idempotency-Key' => 'sos-' . $clientRequestId,
        ];

        $payload = [
            'reason' => 'medical',
            'location' => null,
        ];

        $first = $this
            ->withHeaders($headers)
            ->postJson('/api/app/reports/sos', $payload);

        $first
            ->assertCreated()
            ->assertJsonPath('idempotentReplay', false)
            ->assertJsonPath('activeRescue', false)
            ->assertJsonPath('report.concernCode', 'sos')
            ->assertJsonPath('report.subcategory', 'medical')
            ->assertJsonPath('report.priority', 'Critical')
            ->assertJsonPath('report.triage.computedResult', 'Critical')
            ->assertJsonPath('report.triage.score', 100)
            ->assertJsonPath('report.triage.ruleVersion', 'camunatan-sos-v1');

        $this->assertDatabaseHas('reports', [
            'user_id' => $resident->id,
            'client_request_id' => $clientRequestId,
            'concern_code' => 'sos',
            'subcategory' => 'medical',
            'priority' => 'Critical',
            'triage_score' => 100,
            'triage_recommendation' => 'Critical',
            'triage_rule_version' => 'camunatan-sos-v1',
        ]);

        $report = Report::query()
            ->where('user_id', $resident->id)
            ->where('client_request_id', $clientRequestId)
            ->firstOrFail();

        $this->assertStringContainsString(
            'Medical Emergency',
            $report->description
        );

        $this->assertDatabaseHas('report_status_logs', [
            'report_id' => $report->id,
            'status' => 'Submitted',
        ]);

        $this->assertStringContainsString(
            'Medical Emergency',
            (string) $report->statusLogs()
                ->latest('id')
                ->value('remarks')
        );

        $replay = $this
            ->withHeaders($headers)
            ->postJson('/api/app/reports/sos', $payload);

        $replay
            ->assertOk()
            ->assertJsonPath('idempotentReplay', true)
            ->assertJsonPath('activeRescue', false)
            ->assertJsonPath('report.subcategory', 'medical')
            ->assertJsonPath('report.priority', 'Critical');

        $this->assertDatabaseCount('reports', 1);

        $conflict = $this
            ->withHeaders($headers)
            ->postJson('/api/app/reports/sos', [
                'reason' => 'fire',
                'location' => null,
            ]);

        $conflict->assertStatus(409);

        $active = $this
            ->withHeaders([
                'X-Idempotency-Key' => 'sos-' . Str::uuid(),
            ])
            ->postJson('/api/app/reports/sos', [
                'reason' => 'fire',
                'location' => null,
            ]);

        $active
            ->assertOk()
            ->assertJsonPath('activeRescue', true)
            ->assertJsonPath('idempotentReplay', false)
            ->assertJsonPath('report.subcategory', 'medical')
            ->assertJsonPath('report.priority', 'Critical');

        $this->assertDatabaseCount('reports', 1);
    }
}