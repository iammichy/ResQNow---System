<?php

namespace App\Services\Triage;

use App\Models\Report;
use Illuminate\Validation\ValidationException;

class SvfVerificationService
{
    private const EMERGENCY = [
        'flood' => [
            'immediateDanger' => ['yes', 'no', 'unsure'],
            'waterDepth' => ['shallow', 'ankle_knee', 'knee_waist', 'waist_or_higher', 'unknown'],
            'risingRate' => ['stable', 'slow', 'fast', 'unknown'],
            'accessCondition' => ['passable', 'limited', 'blocked_or_evacuation', 'unknown'],
        ],
        'fire' => [
            'immediateDanger' => ['yes', 'no', 'unsure'],
            'fireCondition' => ['smoke_only', 'small_contained', 'active_flames', 'spreading_heavy_smoke', 'unknown'],
            'electricalHazard' => ['none', 'sparks_or_hot_wire', 'live_wire_exposed', 'unknown'],
            'exitCondition' => ['clear', 'difficult', 'cannot_exit', 'unknown'],
        ],
        'medical' => [
            'immediateDanger' => ['yes', 'no', 'unsure'],
            'patientCondition' => ['alert_stable', 'serious_pain_injury', 'breathing_difficulty', 'unconscious_not_breathing', 'unknown'],
            'transportNeed' => ['yes', 'no', 'unsure'],
            'affectedCount' => ['one', 'two_three', 'four_plus', 'unknown'],
        ],
        'violence' => [
            'immediateDanger' => ['yes', 'no', 'unsure'],
            'threatStatus' => ['ended', 'threatening', 'active', 'weapon', 'unknown'],
            'injuryStatus' => ['none', 'minor', 'serious', 'unknown'],
            'safeToStay' => ['yes', 'no', 'unsure'],
        ],
        'accident' => [
            'immediateDanger' => ['yes', 'no', 'unsure'],
            'trappedStatus' => ['yes', 'no', 'unknown'],
            'injuryStatus' => ['none', 'minor', 'serious', 'unknown'],
            'roadAccess' => ['passable', 'partial', 'blocked', 'unknown'],
        ],
        'evacuation' => [
            'immediateDanger' => ['yes', 'no', 'unsure'],
            'hazardProximity' => ['no_immediate', 'nearby', 'immediate', 'unknown'],
            'canLeave' => ['yes', 'needs_assistance', 'cannot_leave', 'unknown'],
            'evacAccess' => ['open', 'limited', 'blocked', 'unknown'],
        ],
    ];

    private const NON_EMERGENCY = [
        'evac-assistance' => [
            'hazardProximity' => ['none', 'nearby', 'affecting_now', 'unknown'],
            'canLeave' => ['independently', 'needs_assistance', 'cannot_leave', 'unknown'],
            'routeAccess' => ['open', 'limited', 'blocked', 'unknown'],
        ],
        'bhw-assistance' => [
            'personCondition' => ['alert_stable', 'needs_attention', 'worsening', 'severe_or_unresponsive', 'unknown'],
            'breathingCondition' => ['normal', 'difficulty', 'unknown'],
            'mobilityNeed' => ['none', 'needs_assistance', 'cannot_move', 'unknown'],
        ],
        'road-obstruction' => [
            'roadAccess' => ['passable', 'partial', 'blocked', 'unknown'],
            'peopleAtRisk' => ['no', 'yes', 'unsure'],
            'hazardCondition' => ['stable', 'worsening', 'dangerous_object_or_wire', 'unknown'],
        ],
        'damaged-facility' => [
            'publicAccess' => ['away_from_people', 'near_people', 'blocking_access', 'unknown'],
            'damageCondition' => ['minor', 'exposed_damage', 'collapse_or_electrical_risk', 'unknown'],
            'conditionTrend' => ['stable', 'worsening', 'unknown'],
        ],
        'cleanup' => [
            'areaImpact' => ['small', 'moderate', 'widespread', 'unknown'],
            'accessImpact' => ['none', 'limited', 'blocked', 'unknown'],
            'materialRisk' => ['ordinary_waste', 'sharp_or_contaminated', 'unknown'],
        ],
        'community-concern' => [
            'peopleAtRisk' => ['no', 'yes', 'unsure'],
            'accessImpact' => ['none', 'limited', 'blocked', 'unknown'],
            'conditionTrend' => ['stable', 'recurring', 'worsening', 'unknown'],
        ],
        'other-assistance' => [
            'immediateSafetyRisk' => ['no', 'yes', 'unsure'],
            'mobilitySupport' => ['none', 'needs_assistance', 'cannot_move', 'unknown'],
            'affectedCount' => ['one', 'two_three', 'four_plus', 'unknown'],
        ],
    ];

    public function __construct(
        private EmergencyTriageService $emergencyTriage,
        private NonEmergencyTriageService $nonEmergencyTriage,
    ) {
    }

    public function prepare(
        Report $report,
        ?array $submittedAnswers = null
    ): array {
        $report->loadMissing('svfAnswer');

        $svf = $report->svfAnswer;

        if (! $svf) {
            return [
                'hasSvf' => false,
            ];
        }

        $category = (string) ($report->concern_code ?: $svf->category);

        $isEmergency = $report->report_type === 'Emergency';

        $definition = $isEmergency
            ? (self::EMERGENCY[$category] ?? null)
            : (self::NON_EMERGENCY[$category] ?? null);

        if (! $definition) {
            throw ValidationException::withMessages([
                'svfAnswers' => [
                    'The stored situation-check category cannot be verified automatically.',
                ],
            ]);
        }

        if ($submittedAnswers !== null) {
            $unexpected = array_diff(
                array_keys($submittedAnswers),
                array_keys($definition)
            );

            if ($unexpected !== []) {
                throw ValidationException::withMessages([
                    'svfAnswers' => [
                        'Only factual situation-check answers may be corrected.',
                    ],
                ]);
            }
        }

        $storedAnswers = is_array($svf->answers)
            ? $svf->answers
            : [];

        $facts = [];

        foreach ($definition as $key => $allowedValues) {
            $value = $submittedAnswers !== null
                ? ($submittedAnswers[$key] ?? null)
                : ($storedAnswers[$key] ?? null);

            if (
                ! is_string($value)
                || trim($value) === ''
                || ! in_array($value, $allowedValues, true)
            ) {
                throw ValidationException::withMessages([
                    "svfAnswers.$key" => [
                        'Select a valid factual answer before verifying the report.',
                    ],
                ]);
            }

            $facts[$key] = $value;
        }

        $result = $isEmergency
            ? $this->emergencyTriage->compute($category, $facts)
            : $this->nonEmergencyTriage->compute($category, $facts);

        $oldFacts = [];

        foreach ($definition as $key => $_allowedValues) {
            if (array_key_exists($key, $storedAnswers)) {
                $oldFacts[$key] = $storedAnswers[$key];
            }
        }

        return [
            'hasSvf' => true,
            'category' => $category,
            'oldFacts' => $oldFacts,
            'facts' => $facts,
            'mergedAnswers' => array_merge(
                $storedAnswers,
                $facts
            ),
            'result' => $result,
        ];
    }

    public function allowedAnswers(Report $report): array
    {
        $report->loadMissing('svfAnswer');

        if (! $report->svfAnswer) {
            return [];
        }

        $category = (string) (
            $report->concern_code
            ?: $report->svfAnswer->category
        );

        return $report->report_type === 'Emergency'
            ? (self::EMERGENCY[$category] ?? [])
            : (self::NON_EMERGENCY[$category] ?? []);
    }
}
