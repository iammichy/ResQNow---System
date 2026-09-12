<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * Transform a report into the structure
     * expected by the React resident frontend.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $timeline = $this->buildTimeline();

        return [
            // Public report ID shown to residents
            // Example: EM-000001 / NE-000001
            'id' => $this->report_code,

            // Internal database ID
            'databaseId' => $this->id,

            // Main report information
            'reportType' => $this->report_type,
            'concernCode' => $this->concern_code,
            'concernType' => $this->concern_type,
            'subcategory' => $this->subcategory,

            // Current workflow state
            'status' => $this->status,
            'priority' => $this->priority,

            // Who the report is for
            'reportingFor' => $this->reporting_for,

            // Person / victim information
            //
            // We expose both names temporarily so
            // existing frontend components can use
            // victimName while newer code can use
            // subjectName.
            'subjectName' => $this->subject_name,
            'subjectContact' => $this->subject_contact,

            'victimName' => $this->subject_name,
            'victimContact' => $this->subject_contact,

            'relationshipNote' => $this->relationship_note,

            // Incident location
            'purok' => $this->purok,
            'location' => $this->location,
            'landmark' => $this->landmark,

            'latitude' => $this->latitude !== null
                ? (float) $this->latitude
                : null,

            'longitude' => $this->longitude !== null
                ? (float) $this->longitude
                : null,

            // Resident-provided details
            'description' => $this->description,

            'requiredAssistance' =>
                $this->required_assistance,

            'affectedIndividuals' =>
                $this->affected_individuals ?? [],

            // Photo evidence
            'photoUrl' => $this->photo_path
                ? asset('storage/' . $this->photo_path)
                : null,

            // Barangay-side information
            'barangayRemarks' =>
                $this->barangay_remarks,

            'invalidReason' =>
                $this->invalid_reason,

            'resolvedRemarks' =>
                $this->resolved_remarks,

            // Report timeline
            'timeline' => $timeline,

            // Latest report update
            'latestUpdate' =>
                $this->getLatestUpdateText(),

            // Personnel assignment
            'assignedPersonnel' =>
                $this->getAssignedPersonnelText(),

            'assignedPersonnelList' =>
                $this->getAssignedPersonnelList(),

            // Display timestamps expected by
            // the current resident interface
            'submittedAt' => $this->created_at
                ? $this->created_at->format(
                    'Y-m-d h:i A'
                )
                : null,

            'updatedAt' => $this->updated_at
                ? $this->updated_at->format(
                    'Y-m-d h:i A'
                )
                : null,

            // ISO timestamps are also included
            // for future frontend formatting
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAtIso' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Build the full progress timeline.
     *
     * Completed statuses come from report_status_logs.
     * Future statuses are also returned with done=false
     * so the current Track Report UI can display them.
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildTimeline(): array
    {
        $workflow = $this->report_type === 'Emergency'
            ? [
                'Submitted',
                'Assigned',
                'In Progress',
                'Responders En Route',
                'Responded',
                'Resolved',
            ]
            : [
                'Submitted',
                'Pending Verification',
                'Verified',
                'Assigned',
                'In Progress',
                'Responded',
                'Resolved',
            ];

        // Status logs should normally be eager loaded
        // by ReportController.
        $logs = $this->relationLoaded('statusLogs')
            ? $this->statusLogs
            : collect();


        $timeline = [];

        foreach ($workflow as $status) {
            $log = $logs
                ->where('status', $status)
                ->sortBy('created_at')
                ->first();

            $timeline[] = [
                'status' => $status,

                'date' => $log?->created_at
                    ? $log->created_at->format(
                        'Y-m-d h:i A'
                    )
                    : null,

                'done' => $log !== null,
            ];
        }

        // Invalid is not part of the normal workflow,
        // so add it only when the report was invalidated.
        if ($this->status === 'Invalid') {
            $invalidLog = $logs
                ->where('status', 'Invalid')
                ->sortByDesc('created_at')
                ->first();

            $timeline[] = [
                'status' => 'Invalid',

                'date' => $invalidLog?->created_at
                    ? $invalidLog->created_at->format(
                        'Y-m-d h:i A'
                    )
                    : null,

                'done' => true,
            ];
        }

        return $timeline;
    }

    /**
     * Get the most recent report update message.
     */
    private function getLatestUpdateText(): ?string
    {
        if (!$this->relationLoaded('statusLogs')) {
            return null;
        }

        $latestLog = $this->statusLogs
            ->sortByDesc('id')
            ->first();

        if (!$latestLog) {
            return null;
        }

        // Prefer a real remark from barangay personnel.
        if ($latestLog->remarks) {
            return $latestLog->remarks;
        }

        return match ($latestLog->status) {
            'Submitted' =>
                'Your report has been submitted.',

            'Pending Verification' =>
                'Waiting for barangay verification.',

            'Verified' =>
                'Your report has been verified by barangay personnel.',

            'Assigned' =>
                'Personnel have been assigned to your report.',

            'In Progress' =>
                'Your report is now being processed.',

            'Responders En Route' =>
                'Barangay responders are on the way to the reported location.',

            'Responded' =>
                'Barangay personnel have responded to the report.',

            'Resolved' =>
                'This report has been resolved.',

            'Invalid' =>
                'This report has been marked invalid.',

            default =>
                'Your report status has been updated.',
        };
    }

    /**
     * Build the text currently expected
     * by ReportDetail.jsx.
     */
    private function getAssignedPersonnelText(): ?string
    {
        if (!$this->relationLoaded('activeAssignments')) {
            return null;
        }

        $names = $this->activeAssignments
            ->map(
                fn ($assignment) =>
                    $assignment->assignedUser?->name
            )
            ->filter()
            ->values();

        if ($names->isEmpty()) {
            return null;
        }

        return $names->implode(', ');
    }

    /**
     * Return structured personnel information
     * for future frontend use.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getAssignedPersonnelList(): array
    {
        if (!$this->relationLoaded('activeAssignments')) {
            return [];
        }

        return $this->activeAssignments
            ->filter(
                fn ($assignment) =>
                    $assignment->assignedUser !== null
            )
            ->map(
                fn ($assignment) => [
                    'id' =>
                        $assignment->assignedUser->id,

                    'fullName' =>
                        $assignment->assignedUser->name,

                    'role' =>
                        $assignment->assignedUser->role,

                    'assignedAt' =>
                        $assignment->assigned_at?->toISOString(),

                    'notes' =>
                        $assignment->notes,
                ]
            )
            ->values()
            ->all();
    }
}
