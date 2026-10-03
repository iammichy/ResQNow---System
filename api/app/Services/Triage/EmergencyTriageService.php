<?php

namespace App\Services\Triage;

/**
 * Prototype, versioned rule-based emergency triage.
 *
 * Residents provide factual SVF answers. They never choose Critical/High/
 * Moderate/Low directly. These rules are intentionally explicit and auditable
 * so Barangay Camunatan/adviser-approved thresholds can be revised later
 * without changing the report history.
 */
class EmergencyTriageService
{
    public const RULE_VERSION = 'camunatan-emergency-v1';

    /**
     * @return array{priority:string, score:int, flags:array<int,string>, ruleVersion:string}
     */
    public function compute(string $concernCode, array $answers): array
    {
        $flags = [];
        $score = 0;

        if (($answers['immediateDanger'] ?? null) === 'yes') {
            $flags[] = 'Immediate life/safety danger reported';
            $score += 100;
        } elseif (($answers['immediateDanger'] ?? null) === 'unsure') {
            $flags[] = 'Immediate danger uncertain';
            $score += 25;
        }

        match ($concernCode) {
            'flood' => $this->scoreFlood($answers, $flags, $score),
            'fire' => $this->scoreFire($answers, $flags, $score),
            'medical' => $this->scoreMedical($answers, $flags, $score),
            'violence' => $this->scoreViolence($answers, $flags, $score),
            'accident' => $this->scoreAccident($answers, $flags, $score),
            'evacuation' => $this->scoreEvacuation($answers, $flags, $score),
            default => null,
        };

        // Explicit danger indicators always win over the numeric band.
        $critical = $score >= 100;
        $priority = $critical
            ? 'Critical'
            : ($score >= 60
                ? 'High'
                : ($score >= 25 ? 'Moderate' : 'Low'));

        return [
            'priority' => $priority,
            'score' => min(100, $score),
            'flags' => array_values(array_unique($flags)),
            'ruleVersion' => self::RULE_VERSION,
        ];
    }

    private function scoreFlood(array $a, array &$flags, int &$score): void
    {
        match ($a['waterDepth'] ?? null) {
            'shallow' => null,
            'ankle_knee' => $this->add($flags, $score, 15, 'Flood water is ankle-to-knee deep'),
            'knee_waist' => $this->add($flags, $score, 35, 'Flood water is knee-to-waist deep'),
            'waist_or_higher' => $this->add($flags, $score, 60, 'Flood water is waist-deep or higher'),
            'unknown' => $this->add($flags, $score, 10, 'Flood depth is unknown'),
            default => null,
        };

        match ($a['risingRate'] ?? null) {
            'stable' => null,
            'slow' => $this->add($flags, $score, 15, 'Flood water is still rising'),
            'fast' => $this->add($flags, $score, 45, 'Flood water is rising quickly'),
            'unknown' => $this->add($flags, $score, 10, 'Rate of water rise is unknown'),
            default => null,
        };

        match ($a['accessCondition'] ?? null) {
            'passable' => null,
            'limited' => $this->add($flags, $score, 20, 'Road/access is limited'),
            'blocked_or_evacuation' => $this->add($flags, $score, 45, 'Road/access is blocked or evacuation is needed'),
            'unknown' => $this->add($flags, $score, 10, 'Road/access condition is unknown'),
            default => null,
        };

        if (($a['waterDepth'] ?? null) === 'waist_or_higher' && ($a['risingRate'] ?? null) === 'fast') {
            $this->add($flags, $score, 45, 'Deep flood water is rising quickly');
        }
    }

    private function scoreFire(array $a, array &$flags, int &$score): void
    {
        match ($a['fireCondition'] ?? null) {
            'smoke_only' => $this->add($flags, $score, 10, 'Smoke reported without visible active flame'),
            'small_contained' => $this->add($flags, $score, 25, 'Small/contained fire reported'),
            'active_flames' => $this->add($flags, $score, 55, 'Active flames reported'),
            'spreading_heavy_smoke' => $this->add($flags, $score, 80, 'Spreading fire or heavy smoke reported'),
            'unknown' => $this->add($flags, $score, 15, 'Fire/smoke condition is uncertain'),
            default => null,
        };

        match ($a['electricalHazard'] ?? null) {
            'none' => null,
            'sparks_or_hot_wire' => $this->add($flags, $score, 25, 'Electrical sparks/hot wire reported'),
            'live_wire_exposed' => $this->add($flags, $score, 65, 'Exposed live electrical wire reported'),
            'unknown' => $this->add($flags, $score, 10, 'Electrical hazard condition is unknown'),
            default => null,
        };

        if (($a['exitCondition'] ?? null) === 'cannot_exit') {
            $this->add($flags, $score, 100, 'Person may be unable to exit the affected area');
        } elseif (($a['exitCondition'] ?? null) === 'difficult') {
            $this->add($flags, $score, 30, 'Exit/access is difficult');
        }
    }

    private function scoreMedical(array $a, array &$flags, int &$score): void
    {
        match ($a['patientCondition'] ?? null) {
            'alert_stable' => $this->add($flags, $score, 15, 'Patient is alert/stable but needs urgent help'),
            'serious_pain_injury' => $this->add($flags, $score, 50, 'Serious pain/injury reported'),
            'breathing_difficulty' => $this->add($flags, $score, 80, 'Difficulty breathing reported'),
            'unconscious_not_breathing' => $this->add($flags, $score, 100, 'Unconscious/not breathing reported'),
            'unknown' => $this->add($flags, $score, 20, 'Patient condition is uncertain'),
            default => null,
        };

        if (($a['transportNeed'] ?? null) === 'yes') {
            $this->add($flags, $score, 20, 'Transport/medical assistance is needed');
        }

        match ($a['affectedCount'] ?? null) {
            'two_three' => $this->add($flags, $score, 10, 'Two to three people affected'),
            'four_plus' => $this->add($flags, $score, 25, 'Four or more people affected'),
            default => null,
        };
    }

    private function scoreViolence(array $a, array &$flags, int &$score): void
    {
        match ($a['threatStatus'] ?? null) {
            'ended' => null,
            'threatening' => $this->add($flags, $score, 35, 'Threatening behavior is ongoing/recent'),
            'active' => $this->add($flags, $score, 65, 'Active violence/safety threat reported'),
            'weapon' => $this->add($flags, $score, 100, 'Active threat involving a weapon reported'),
            'unknown' => $this->add($flags, $score, 20, 'Threat status is uncertain'),
            default => null,
        };

        match ($a['injuryStatus'] ?? null) {
            'minor' => $this->add($flags, $score, 20, 'Minor injury reported'),
            'serious' => $this->add($flags, $score, 80, 'Serious injury reported'),
            'unknown' => $this->add($flags, $score, 10, 'Injury status is unknown'),
            default => null,
        };

        if (($a['safeToStay'] ?? null) === 'no') {
            $this->add($flags, $score, 35, 'Resident reports it is not safe to remain at the location');
        }
    }

    private function scoreAccident(array $a, array &$flags, int &$score): void
    {
        if (($a['trappedStatus'] ?? null) === 'yes') {
            $this->add($flags, $score, 100, 'Person trapped in road accident');
        } elseif (($a['trappedStatus'] ?? null) === 'unknown') {
            $this->add($flags, $score, 20, 'Trapped-person status is unknown');
        }

        match ($a['injuryStatus'] ?? null) {
            'minor' => $this->add($flags, $score, 20, 'Minor injury reported'),
            'serious' => $this->add($flags, $score, 80, 'Serious injury reported'),
            'unknown' => $this->add($flags, $score, 10, 'Injury severity is unknown'),
            default => null,
        };

        match ($a['roadAccess'] ?? null) {
            'partial' => $this->add($flags, $score, 15, 'Road is partially obstructed'),
            'blocked' => $this->add($flags, $score, 35, 'Road is fully blocked'),
            'unknown' => $this->add($flags, $score, 10, 'Road access is unknown'),
            default => null,
        };
    }

    private function scoreEvacuation(array $a, array &$flags, int &$score): void
    {
        match ($a['hazardProximity'] ?? null) {
            'nearby' => $this->add($flags, $score, 20, 'Hazard is near the affected person/household'),
            'immediate' => $this->add($flags, $score, 55, 'Hazard is immediately affecting the location'),
            'unknown' => $this->add($flags, $score, 10, 'Hazard proximity is uncertain'),
            default => null,
        };

        match ($a['canLeave'] ?? null) {
            'needs_assistance' => $this->add($flags, $score, 35, 'Resident needs assistance to evacuate'),
            'cannot_leave' => $this->add($flags, $score, 80, 'Resident cannot leave without rescue/support'),
            'unknown' => $this->add($flags, $score, 10, 'Evacuation ability is uncertain'),
            default => null,
        };

        match ($a['evacAccess'] ?? null) {
            'limited' => $this->add($flags, $score, 20, 'Evacuation route/access is limited'),
            'blocked' => $this->add($flags, $score, 45, 'Evacuation route/access is blocked'),
            'unknown' => $this->add($flags, $score, 10, 'Evacuation route condition is unknown'),
            default => null,
        };
    }

    private function add(array &$flags, int &$score, int $points, string $flag): void
    {
        $score += $points;
        $flags[] = $flag;
    }
}
