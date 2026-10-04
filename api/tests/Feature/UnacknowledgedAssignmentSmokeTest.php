<?php

namespace Tests\Feature;

use App\Models\Incident;
use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnacknowledgedAssignmentSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_incident_flags_an_overdue_unacknowledged_assignment(): void
    {
        config()->set(
            'resqnow.assignment_acknowledgement_timeout_minutes',
            5
        );

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
            'report_code' => 'EM-ACK-001',
            'report_type' => 'Emergency',
            'category' => 'Medical Emergency',
            'description' => 'Acknowledgement monitoring test.',
            'location' => 'Barangay Camunatan',
            'verification_status' => 'Verified',
            'status' => 'Assigned',
            'priority' => 'Critical',
        ]);

        $assignment = ReportAssignment::create([
            'report_id' => $report->id,
            'assigned_user_id' => $responder->id,
            'assigned_at' => now()->subMinutes(6),
            'acknowledged_at' => null,
        ]);

        $incident = Incident::create([
            'report_id' => $report->id,
            'incident_code' => 'INC-ACK-001',
            'title' => 'Medical Emergency',
            'type' => 'Emergency',
            'category' => 'Medical Emergency',
            'description' => 'Acknowledgement monitoring test.',
            'location' => 'Barangay Camunatan',
            'priority' => 'Critical',
            'status' => 'Pending Response',
        ]);

        $monitor = $incident
            ->fresh()
            ->assignment_monitor;

        $this->assertTrue(
            $monitor['hasAssignment']
        );

        $this->assertFalse(
            $monitor['acknowledged']
        );

        $this->assertTrue(
            $monitor['overdue']
        );

        $this->assertSame(
            5,
            $monitor['timeoutMinutes']
        );

        $this->assertSame(
            $responder->id,
            $monitor['assignedUserId']
        );

        $assignment->update([
            'acknowledged_at' => now(),
        ]);

        $monitorAfterAcknowledgement =
            $incident
                ->fresh()
                ->assignment_monitor;

        $this->assertTrue(
            $monitorAfterAcknowledgement['acknowledged']
        );

        $this->assertFalse(
            $monitorAfterAcknowledgement['overdue']
        );
    }
}
