<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use App\Services\Triage\NonEmergencyTriageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NonEmergencyPhase3SmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_emergency_triage_uses_all_canonical_priority_bands(): void
    {
        $service = app(
            NonEmergencyTriageService::class
        );

        $cases = [
            'Low' => [
                'cleanup',
                [
                    'areaImpact' => 'small',
                    'accessImpact' => 'none',
                    'materialRisk' => 'ordinary_waste',
                ],
            ],

            'Moderate' => [
                'road-obstruction',
                [
                    'roadAccess' => 'partial',
                    'peopleAtRisk' => 'unsure',
                    'hazardCondition' => 'stable',
                ],
            ],

            'High' => [
                'other-assistance',
                [
                    'immediateSafetyRisk' => 'yes',
                    'mobilitySupport' => 'none',
                    'affectedCount' => 'one',
                ],
            ],

            'Critical' => [
                'bhw-assistance',
                [
                    'personCondition' => 'severe_or_unresponsive',
                    'breathingCondition' => 'normal',
                    'mobilityNeed' => 'none',
                ],
            ],
        ];

        foreach ($cases as $expectedPriority => [$concernCode, $answers]) {
            $result = $service->compute(
                $concernCode,
                $answers
            );

            $this->assertSame(
                $expectedPriority,
                $result['priority']
            );

            $this->assertSame(
                'camunatan-non-emergency-v1',
                $result['ruleVersion']
            );
        }
    }

    public function test_verified_resident_can_submit_non_emergency_with_svf_and_replay_safely(): void
    {
        $resident = User::factory()->create([
            'role' => 'resident',
            'account_status' => 'Verified',
        ]);

        Sanctum::actingAs($resident);

        $clientRequestId =
            (string) Str::uuid();

        $payload = [
            'clientRequestId' =>
                $clientRequestId,

            'concernCode' =>
                'road-obstruction',

            'subcategory' =>
                'Fallen Tree / Branch',

            'svfAnswers' => [
                'roadAccess' =>
                    'partial',

                'peopleAtRisk' =>
                    'yes',

                'hazardCondition' =>
                    'stable',
            ],

            'noPhotoReason' =>
                'Unsafe to approach the obstruction.',

            'reportingFor' =>
                'Myself',

            'purok' =>
                'Purok 1',

            'location' =>
                'Near the main barangay road',

            'description' =>
                'A fallen branch is partially blocking the road.',

            'affectedIndividuals' => [
                'Senior Citizen',
            ],
        ];

        /*
         * 20 partial road
         * + 40 people at risk
         * = 60 => High
         */
        $first = $this->postJson(
            '/api/app/reports/non-emergency',
            $payload
        );

        $first
            ->assertCreated()
            ->assertJsonPath(
                'duplicateSubmissionPrevented',
                false
            )
            ->assertJsonPath(
                'report.concernCode',
                'road-obstruction'
            )
            ->assertJsonPath(
                'report.priority',
                'High'
            )
            ->assertJsonPath(
                'report.triage.computedResult',
                'High'
            )
            ->assertJsonPath(
                'report.triage.score',
                60
            )
            ->assertJsonPath(
                'report.triage.ruleVersion',
                'camunatan-non-emergency-v1'
            )
            ->assertJsonPath(
                'report.svf.category',
                'road-obstruction'
            )
            ->assertJsonPath(
                'report.svf.answers.photoProvided',
                'no'
            )
            ->assertJsonPath(
                'report.svf.answers.noPhotoReason',
                'Unsafe to approach the obstruction.'
            );

        $this->assertDatabaseHas(
            'reports',
            [
                'user_id' =>
                    $resident->id,

                'client_request_id' =>
                    $clientRequestId,

                'report_type' =>
                    'Non-Emergency',

                'concern_code' =>
                    'road-obstruction',

                'priority' =>
                    'High',

                'triage_score' =>
                    60,

                'triage_recommendation' =>
                    'High',

                'triage_rule_version' =>
                    'camunatan-non-emergency-v1',
            ]
        );

        $report =
            Report::query()
                ->where(
                    'user_id',
                    $resident->id
                )
                ->where(
                    'client_request_id',
                    $clientRequestId
                )
                ->firstOrFail();

        $report->load(
            'svfAnswer'
        );

        $this->assertNotNull(
            $report->svfAnswer
        );

        $this->assertSame(
            'no',
            $report
                ->svfAnswer
                ->answers[
                    'photoProvided'
                ]
        );

        $this->assertSame(
            'Unsafe to approach the obstruction.',
            $report
                ->svfAnswer
                ->answers[
                    'noPhotoReason'
                ]
        );

        $this->assertDatabaseHas(
            'report_status_logs',
            [
                'report_id' =>
                    $report->id,

                'status' =>
                    'Submitted',
            ]
        );

        $this->assertDatabaseHas(
            'report_status_logs',
            [
                'report_id' =>
                    $report->id,

                'status' =>
                    'Pending Verification',
            ]
        );

        /*
         * Same UUID + same facts must replay safely.
         */
        $replay = $this->postJson(
            '/api/app/reports/non-emergency',
            $payload
        );

        $replay
            ->assertOk()
            ->assertJsonPath(
                'duplicateSubmissionPrevented',
                true
            )
            ->assertJsonPath(
                'report.priority',
                'High'
            );

        $this->assertDatabaseCount(
            'reports',
            1
        );

        /*
         * Same UUID + changed facts must conflict.
         */
        $conflictPayload = $payload;

        $conflictPayload['description'] =
            'Different report details using the same request identifier.';

        $conflict = $this->postJson(
            '/api/app/reports/non-emergency',
            $conflictPayload
        );

        $conflict->assertStatus(
            409
        );

        $this->assertDatabaseCount(
            'reports',
            1
        );
    }

    public function test_physical_hazard_requires_photo_or_no_photo_reason_but_assistance_does_not(): void
    {
        $resident = User::factory()->create([
            'role' => 'resident',
            'account_status' => 'Verified',
        ]);

        Sanctum::actingAs($resident);

        /*
         * Physical hazard: neither photo nor reason.
         * Must be rejected.
         */
        $physical = $this->postJson(
            '/api/app/reports/non-emergency',
            [
                'clientRequestId' =>
                    (string) Str::uuid(),

                'concernCode' =>
                    'damaged-facility',

                'subcategory' =>
                    'Street Light',

                'svfAnswers' => [
                    'publicAccess' =>
                        'near_people',

                    'damageCondition' =>
                        'exposed_damage',

                    'conditionTrend' =>
                        'stable',
                ],

                'reportingFor' =>
                    'Myself',

                'purok' =>
                    'Purok 2',

                'location' =>
                    'Near the covered court',

                'description' =>
                    'The street light fixture appears damaged.',
            ]
        );

        $physical
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'noPhotoReason',
            ]);

        $this->assertDatabaseCount(
            'reports',
            0
        );

        /*
         * Assistance request: photo remains optional.
         */
        $assistance = $this->postJson(
            '/api/app/reports/non-emergency',
            [
                'clientRequestId' =>
                    (string) Str::uuid(),

                'concernCode' =>
                    'bhw-assistance',

                'subcategory' =>
                    'Health Check',

                'svfAnswers' => [
                    'personCondition' =>
                        'alert_stable',

                    'breathingCondition' =>
                        'normal',

                    'mobilityNeed' =>
                        'none',
                ],

                'reportingFor' =>
                    'Myself',

                'purok' =>
                    'Purok 3',

                'location' =>
                    'Resident home',

                'description' =>
                    'Requesting a routine barangay health worker visit.',
            ]
        );

        $assistance
            ->assertCreated()
            ->assertJsonPath(
                'report.priority',
                'Low'
            )
            ->assertJsonPath(
                'report.triage.score',
                0
            )
            ->assertJsonPath(
                'report.svf.answers.photoProvided',
                'no'
            );

        $this->assertDatabaseCount(
            'reports',
            1
        );
    }
}