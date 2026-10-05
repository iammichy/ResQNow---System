<?php

namespace App\Services\Triage;

/**
 * Versioned rule-based triage for resident Non-Emergency / Assistance reports.
 *
 * Residents answer factual situation questions only. They never select
 * Critical, High, Moderate, or Low themselves.
 */
class NonEmergencyTriageService
{
    public const RULE_VERSION = 'camunatan-non-emergency-v1';

    /**
     * @return array{priority:string, score:int, flags:array<int,string>, ruleVersion:string}
     */
    public function compute(string $concernCode, array $answers): array
    {
        $flags = [];
        $score = 0;

        match ($concernCode) {
            'evac-assistance' =>
                $this->scoreEvacuation($answers, $flags, $score),

            'bhw-assistance' =>
                $this->scoreHealthAssistance($answers, $flags, $score),

            'road-obstruction' =>
                $this->scoreRoadObstruction($answers, $flags, $score),

            'damaged-facility' =>
                $this->scoreDamagedFacility($answers, $flags, $score),

            'cleanup' =>
                $this->scoreCleanup($answers, $flags, $score),

            'community-concern' =>
                $this->scoreCommunityConcern($answers, $flags, $score),

            'other-assistance' =>
                $this->scoreOtherAssistance($answers, $flags, $score),

            default => null,
        };

        $priority = $score >= 100
            ? 'Critical'
            : ($score >= 60
                ? 'High'
                : ($score >= 25
                    ? 'Moderate'
                    : 'Low'));

        return [
            'priority' => $priority,
            'score' => min(100, $score),
            'flags' => array_values(array_unique($flags)),
            'ruleVersion' => self::RULE_VERSION,
        ];
    }

    private function scoreEvacuation(
        array $a,
        array &$flags,
        int &$score
    ): void {
        match ($a['hazardProximity'] ?? null) {
            'none' => null,
            'nearby' =>
                $this->add($flags, $score, 20, 'Hazard is near the household'),
            'affecting_now' =>
                $this->add($flags, $score, 45, 'Hazard is currently affecting the household'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Hazard proximity is uncertain'),
            default => null,
        };

        match ($a['canLeave'] ?? null) {
            'independently' => null,
            'needs_assistance' =>
                $this->add($flags, $score, 30, 'Assistance is needed to evacuate'),
            'cannot_leave' =>
                $this->add($flags, $score, 70, 'Resident reports they cannot leave without assistance'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Ability to evacuate is uncertain'),
            default => null,
        };

        match ($a['routeAccess'] ?? null) {
            'open' => null,
            'limited' =>
                $this->add($flags, $score, 20, 'Evacuation route is limited'),
            'blocked' =>
                $this->add($flags, $score, 45, 'Evacuation route is blocked'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Evacuation route condition is unknown'),
            default => null,
        };

        if (
            ($a['hazardProximity'] ?? null) === 'affecting_now'
            && ($a['canLeave'] ?? null) === 'cannot_leave'
        ) {
            $this->add(
                $flags,
                $score,
                30,
                'Household is affected and cannot leave without assistance'
            );
        }
    }

    private function scoreHealthAssistance(
        array $a,
        array &$flags,
        int &$score
    ): void {
        match ($a['personCondition'] ?? null) {
            'alert_stable' => null,
            'needs_attention' =>
                $this->add($flags, $score, 20, 'Person needs health attention'),
            'worsening' =>
                $this->add($flags, $score, 45, 'Person condition is worsening'),
            'severe_or_unresponsive' =>
                $this->add($flags, $score, 100, 'Severe condition or unresponsiveness reported'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Person condition is uncertain'),
            default => null,
        };

        match ($a['breathingCondition'] ?? null) {
            'normal' => null,
            'difficulty' =>
                $this->add($flags, $score, 100, 'Difficulty breathing reported'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Breathing condition is uncertain'),
            default => null,
        };

        match ($a['mobilityNeed'] ?? null) {
            'none' => null,
            'needs_assistance' =>
                $this->add($flags, $score, 20, 'Mobility assistance is needed'),
            'cannot_move' =>
                $this->add($flags, $score, 40, 'Person cannot move without assistance'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Mobility condition is uncertain'),
            default => null,
        };
    }

    private function scoreRoadObstruction(
        array $a,
        array &$flags,
        int &$score
    ): void {
        match ($a['roadAccess'] ?? null) {
            'passable' => null,
            'partial' =>
                $this->add($flags, $score, 20, 'Road is partially obstructed'),
            'blocked' =>
                $this->add($flags, $score, 40, 'Road or pathway is fully blocked'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Road access is uncertain'),
            default => null,
        };

        match ($a['peopleAtRisk'] ?? null) {
            'no' => null,
            'yes' =>
                $this->add($flags, $score, 40, 'People may be directly exposed to the obstruction'),
            'unsure' =>
                $this->add($flags, $score, 15, 'Risk to people is uncertain'),
            default => null,
        };

        match ($a['hazardCondition'] ?? null) {
            'stable' => null,
            'worsening' =>
                $this->add($flags, $score, 25, 'Obstruction condition is worsening'),
            'dangerous_object_or_wire' =>
                $this->add($flags, $score, 70, 'Dangerous object or electrical wire reported'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Hazard condition is uncertain'),
            default => null,
        };

        if (
            ($a['roadAccess'] ?? null) === 'blocked'
            && ($a['hazardCondition'] ?? null) === 'dangerous_object_or_wire'
        ) {
            $this->add(
                $flags,
                $score,
                25,
                'Blocked access involves a dangerous object or wire'
            );
        }
    }

    private function scoreDamagedFacility(
        array $a,
        array &$flags,
        int &$score
    ): void {
        match ($a['publicAccess'] ?? null) {
            'away_from_people' => null,
            'near_people' =>
                $this->add($flags, $score, 20, 'Damage is near people or a public area'),
            'blocking_access' =>
                $this->add($flags, $score, 35, 'Damage is blocking public access'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Public access impact is uncertain'),
            default => null,
        };

        match ($a['damageCondition'] ?? null) {
            'minor' => null,
            'exposed_damage' =>
                $this->add($flags, $score, 25, 'Exposed facility damage reported'),
            'collapse_or_electrical_risk' =>
                $this->add($flags, $score, 80, 'Collapse or electrical risk reported'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Damage condition is uncertain'),
            default => null,
        };

        match ($a['conditionTrend'] ?? null) {
            'stable' => null,
            'worsening' =>
                $this->add($flags, $score, 25, 'Facility condition is worsening'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Condition trend is uncertain'),
            default => null,
        };
    }

    private function scoreCleanup(
        array $a,
        array &$flags,
        int &$score
    ): void {
        match ($a['areaImpact'] ?? null) {
            'small' => null,
            'moderate' =>
                $this->add($flags, $score, 15, 'Moderate area affected by drainage or water buildup'),
            'widespread' =>
                $this->add($flags, $score, 30, 'Widespread drainage or water buildup reported'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Affected area size is uncertain'),
            default => null,
        };

        match ($a['accessImpact'] ?? null) {
            'none' => null,
            'limited' =>
                $this->add($flags, $score, 20, 'Drainage or water buildup limits access'),
            'blocked' =>
                $this->add($flags, $score, 40, 'Drainage or water buildup blocks access'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Access impact is uncertain'),
            default => null,
        };

        match ($a['materialRisk'] ?? null) {
            'ordinary_waste' => null,
            'sharp_or_contaminated' =>
                $this->add($flags, $score, 35, 'Sharp or potentially contaminated material reported'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Material risk is uncertain'),
            default => null,
        };
    }

    private function scoreCommunityConcern(
        array $a,
        array &$flags,
        int &$score
    ): void {
        match ($a['peopleAtRisk'] ?? null) {
            'no' => null,
            'yes' =>
                $this->add($flags, $score, 40, 'People may be directly affected'),
            'unsure' =>
                $this->add($flags, $score, 15, 'Risk to people is uncertain'),
            default => null,
        };

        match ($a['accessImpact'] ?? null) {
            'none' => null,
            'limited' =>
                $this->add($flags, $score, 20, 'Community access is limited'),
            'blocked' =>
                $this->add($flags, $score, 40, 'Community access is blocked'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Access impact is uncertain'),
            default => null,
        };

        match ($a['conditionTrend'] ?? null) {
            'stable' => null,
            'recurring' =>
                $this->add($flags, $score, 15, 'Concern is recurring'),
            'worsening' =>
                $this->add($flags, $score, 30, 'Concern is worsening'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Condition trend is uncertain'),
            default => null,
        };
    }

    private function scoreOtherAssistance(
        array $a,
        array &$flags,
        int &$score
    ): void {
        match ($a['immediateSafetyRisk'] ?? null) {
            'no' => null,
            'yes' =>
                $this->add($flags, $score, 70, 'Immediate safety risk reported'),
            'unsure' =>
                $this->add($flags, $score, 20, 'Immediate safety risk is uncertain'),
            default => null,
        };

        match ($a['mobilitySupport'] ?? null) {
            'none' => null,
            'needs_assistance' =>
                $this->add($flags, $score, 20, 'Mobility assistance is needed'),
            'cannot_move' =>
                $this->add($flags, $score, 40, 'Person cannot move without assistance'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Mobility need is uncertain'),
            default => null,
        };

        match ($a['affectedCount'] ?? null) {
            'one' => null,
            'two_three' =>
                $this->add($flags, $score, 10, 'Two to three people are affected'),
            'four_plus' =>
                $this->add($flags, $score, 25, 'Four or more people are affected'),
            'unknown' =>
                $this->add($flags, $score, 10, 'Number of affected people is uncertain'),
            default => null,
        };
    }

    private function add(
        array &$flags,
        int &$score,
        int $points,
        string $flag
    ): void {
        $score += $points;
        $flags[] = $flag;
    }
}