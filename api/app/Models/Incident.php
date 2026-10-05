<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'incident_code',
        'title',
        'type',
        'category',
        'description',
        'location',
        'latitude',
        'longitude',
        'priority',
        'assigned_personnel_id',
        'status',
        'dispatched_at',
        'resolved_at',
        'resolution_type',
        'resolution_remarks',
        'handoff_agency',
        'handoff_details',
        'closure_field_outcome_reviewed',
        'closure_resolution_reviewed',
        'closure_handoff_information_verified',
        'closure_ready_confirmed',
        'closed_at',
    ];

    protected $casts = [
        'dispatched_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',

        'closure_field_outcome_reviewed' => 'boolean',
        'closure_resolution_reviewed' => 'boolean',
        'closure_handoff_information_verified' => 'boolean',
        'closure_ready_confirmed' => 'boolean',
    ];

    /**
     * Computed operational assignment state returned
     * with every Incident API response.
     */
    protected $appends = [
        'assignment_monitor',
    ];

    /**
     * Server-computed acknowledgement monitoring.
     *
     * This is derived from the active report assignment,
     * so it works for every current and future responder.
     */
    public function getAssignmentMonitorAttribute(): array
    {
        $timeoutMinutes = max(
            1,
            (int) config(
                'resqnow.assignment_acknowledgement_timeout_minutes',
                5
            )
        );

        $report = $this->relationLoaded('report')
            ? $this->report
            : $this->report()->first();

        if (! $report) {
            return [
                'hasAssignment' => false,
                'assignmentId' => null,
                'assignedUserId' => null,
                'assignedAt' => null,
                'acknowledged' => false,
                'acknowledgedAt' => null,
                'timeoutMinutes' => $timeoutMinutes,
                'deadlineAt' => null,
                'minutesWaiting' => 0,
                'overdue' => false,
            ];
        }

        $assignment = $report->relationLoaded(
            'activeAssignments'
        )
            ? $report
                ->activeAssignments
                ->sortByDesc('assigned_at')
                ->first()
            : $report
                ->activeAssignments()
                ->latest('assigned_at')
                ->first();

        if (! $assignment) {
            return [
                'hasAssignment' => false,
                'assignmentId' => null,
                'assignedUserId' => null,
                'assignedAt' => null,
                'acknowledged' => false,
                'acknowledgedAt' => null,
                'timeoutMinutes' => $timeoutMinutes,
                'deadlineAt' => null,
                'minutesWaiting' => 0,
                'overdue' => false,
            ];
        }

        $assignedAt = $assignment->assigned_at;

        $deadlineAt = $assignedAt
            ? $assignedAt
                ->copy()
                ->addMinutes($timeoutMinutes)
            : null;

        $acknowledged =
            $assignment->acknowledged_at !== null;

        $overdue =
            ! $acknowledged &&
            $deadlineAt !== null &&
            now()->greaterThanOrEqualTo($deadlineAt);

        $minutesWaiting =
            ! $acknowledged &&
            $assignedAt !== null
                ? max(
                    0,
                    (int) floor(
                        $assignedAt->diffInMinutes(now())
                    )
                )
                : 0;

        return [
            'hasAssignment' => true,
            'assignmentId' => $assignment->id,
            'assignedUserId' => $assignment->assigned_user_id,

            'assignedAt' =>
                $assignedAt?->toISOString(),

            'acknowledged' =>
                $acknowledged,

            'acknowledgedAt' =>
                $assignment
                    ->acknowledged_at
                    ?->toISOString(),

            'timeoutMinutes' =>
                $timeoutMinutes,

            'deadlineAt' =>
                $deadlineAt?->toISOString(),

            'minutesWaiting' =>
                $minutesWaiting,

            'overdue' =>
                $overdue,
        ];
    }

    /**
     * The original hazard/incident report.
     */
    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    /**
     * The personnel assigned to this incident.
     */
    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'assigned_personnel_id');
    }
}