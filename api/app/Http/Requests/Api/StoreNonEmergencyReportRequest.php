<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreNonEmergencyReportRequest extends FormRequest
{
    private const CONCERNS = [
        'evac-assistance',
        'bhw-assistance',
        'road-obstruction',
        'damaged-facility',
        'cleanup',
        'community-concern',
        'other-assistance',
    ];

    private const PHOTO_OR_REASON_CONCERNS = [
        'road-obstruction',
        'damaged-facility',
        'cleanup',
    ];

    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->role === 'resident'
            && $user->account_status === 'Verified';
    }

    public function rules(): array
    {
        return [
            'clientRequestId' => [
                'required',
                'uuid',
            ],

            'concernCode' => [
                'required',
                'string',
                Rule::in(self::CONCERNS),
            ],

            'svfAnswers' => [
                'required',
                'array',
            ],

            'svfAnswers.*' => [
                'nullable',
                'string',
                'max:80',
            ],

            'noPhotoReason' => [
                'nullable',
                'string',
                'max:300',
            ],

            'subcategory' => [
                'nullable',
                'string',
                'max:150',
                Rule::in([
                    'Transportation',
                    'Temporary Shelter',
                    'Supplies',
                    'Health Check',
                    'Home Visit',
                    'Medicine Assistance',
                    'Fallen Tree / Branch',
                    'Debris Blocking Road',
                    'Vehicle / Object Blocking Road',
                    'Other Road Obstruction',
                    'Street Light',
                    'Road',
                    'Drainage',
                    'Barangay Facility',
                    'Waste Collection',
                    'Storm Debris / Branches',
                    'Drainage Clean-up',
                    'Sanitation',
                    'Noise',
                    'Stray Animals',
                    'Public Area',
                ]),
            ],

            'reportingFor' => [
                'required',
                'string',
                Rule::in([
                    'Myself',
                    'Another Person',
                ]),
            ],

            'subjectName' => [
                'nullable',
                'string',
                'max:150',
            ],

            'subjectContact' => [
                'nullable',
                'string',
                'max:30',
                'regex:/^(09|\+639)\d{9}$/',
            ],

            'relationshipNote' => [
                'nullable',
                'string',
                'max:150',
            ],

            'purok' => [
                'required',
                'string',
                Rule::in([
                    'Purok 1',
                    'Purok 2',
                    'Purok 3',
                ]),
            ],

            'location' => [
                'required',
                'string',
                'max:1000',
            ],

            'landmark' => [
                'nullable',
                'string',
                'max:255',
            ],

            'latitude' => [
                'nullable',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'nullable',
                'numeric',
                'between:-180,180',
            ],

            'description' => [
                'required',
                'string',
                'max:3000',
            ],

            'requiredAssistance' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'affectedIndividuals' => [
                'nullable',
                'array',
                'max:5',
            ],

            'affectedIndividuals.*' => [
                'string',
                Rule::in([
                    'Child',
                    'Senior Citizen',
                    'PWD',
                    'Pregnant Person',
                    'Injured Person',
                ]),
            ],

            'photo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png',
                'max:5120',
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $category =
                (string) $this->input('concernCode');

            $answers =
                $this->input('svfAnswers', []);

            if (! is_array($answers)) {
                return;
            }

            $required = match ($category) {
                'evac-assistance' => [
                    'hazardProximity',
                    'canLeave',
                    'routeAccess',
                ],

                'bhw-assistance' => [
                    'personCondition',
                    'breathingCondition',
                    'mobilityNeed',
                ],

                'road-obstruction' => [
                    'roadAccess',
                    'peopleAtRisk',
                    'hazardCondition',
                ],

                'damaged-facility' => [
                    'publicAccess',
                    'damageCondition',
                    'conditionTrend',
                ],

                'cleanup' => [
                    'areaImpact',
                    'accessImpact',
                    'materialRisk',
                ],

                'community-concern' => [
                    'peopleAtRisk',
                    'accessImpact',
                    'conditionTrend',
                ],

                'other-assistance' => [
                    'immediateSafetyRisk',
                    'mobilitySupport',
                    'affectedCount',
                ],

                default => [],
            };

            foreach ($required as $key) {
                if (
                    ! isset($answers[$key])
                    || trim((string) $answers[$key]) === ''
                ) {
                    $validator->errors()->add(
                        'svfAnswers.' . $key,
                        'Please answer all quick situation-check questions before submitting.'
                    );
                }
            }

            $allowed =
                $this->allowedAnswers($category);

            foreach ($answers as $key => $value) {
                if (
                    ! isset($allowed[$key])
                    || ! in_array(
                        (string) $value,
                        $allowed[$key],
                        true
                    )
                ) {
                    $validator->errors()->add(
                        'svfAnswers.' . $key,
                        'One of the situation-check answers is invalid.'
                    );
                }
            }

            if (
                in_array(
                    $category,
                    self::PHOTO_OR_REASON_CONCERNS,
                    true
                )
                && ! $this->hasFile('photo')
                && trim((string) $this->input('noPhotoReason', '')) === ''
            ) {
                $validator->errors()->add(
                    'noPhotoReason',
                    'Add a photo when safe, or select a reason why no photo is available.'
                );
            }
        });
    }

    private function allowedAnswers(string $category): array
    {
        return match ($category) {
            'evac-assistance' => [
                'hazardProximity' => [
                    'none',
                    'nearby',
                    'affecting_now',
                    'unknown',
                ],

                'canLeave' => [
                    'independently',
                    'needs_assistance',
                    'cannot_leave',
                    'unknown',
                ],

                'routeAccess' => [
                    'open',
                    'limited',
                    'blocked',
                    'unknown',
                ],
            ],

            'bhw-assistance' => [
                'personCondition' => [
                    'alert_stable',
                    'needs_attention',
                    'worsening',
                    'severe_or_unresponsive',
                    'unknown',
                ],

                'breathingCondition' => [
                    'normal',
                    'difficulty',
                    'unknown',
                ],

                'mobilityNeed' => [
                    'none',
                    'needs_assistance',
                    'cannot_move',
                    'unknown',
                ],
            ],

            'road-obstruction' => [
                'roadAccess' => [
                    'passable',
                    'partial',
                    'blocked',
                    'unknown',
                ],

                'peopleAtRisk' => [
                    'no',
                    'yes',
                    'unsure',
                ],

                'hazardCondition' => [
                    'stable',
                    'worsening',
                    'dangerous_object_or_wire',
                    'unknown',
                ],
            ],

            'damaged-facility' => [
                'publicAccess' => [
                    'away_from_people',
                    'near_people',
                    'blocking_access',
                    'unknown',
                ],

                'damageCondition' => [
                    'minor',
                    'exposed_damage',
                    'collapse_or_electrical_risk',
                    'unknown',
                ],

                'conditionTrend' => [
                    'stable',
                    'worsening',
                    'unknown',
                ],
            ],

            'cleanup' => [
                'areaImpact' => [
                    'small',
                    'moderate',
                    'widespread',
                    'unknown',
                ],

                'accessImpact' => [
                    'none',
                    'limited',
                    'blocked',
                    'unknown',
                ],

                'materialRisk' => [
                    'ordinary_waste',
                    'sharp_or_contaminated',
                    'unknown',
                ],
            ],

            'community-concern' => [
                'peopleAtRisk' => [
                    'no',
                    'yes',
                    'unsure',
                ],

                'accessImpact' => [
                    'none',
                    'limited',
                    'blocked',
                    'unknown',
                ],

                'conditionTrend' => [
                    'stable',
                    'recurring',
                    'worsening',
                    'unknown',
                ],
            ],

            'other-assistance' => [
                'immediateSafetyRisk' => [
                    'no',
                    'yes',
                    'unsure',
                ],

                'mobilitySupport' => [
                    'none',
                    'needs_assistance',
                    'cannot_move',
                    'unknown',
                ],

                'affectedCount' => [
                    'one',
                    'two_three',
                    'four_plus',
                    'unknown',
                ],
            ],

            default => [],
        };
    }

    public function messages(): array
    {
        return [
            'clientRequestId.required' =>
                'The report request could not be prepared safely. Refresh and try again.',

            'clientRequestId.uuid' =>
                'The report request identifier is invalid. Refresh and try again.',

            'concernCode.required' =>
                'Please select a concern type.',

            'concernCode.in' =>
                'The selected concern type is invalid.',

            'svfAnswers.required' =>
                'Please complete the quick situation check.',

            'subcategory.in' =>
                'The selected subcategory is invalid.',

            'reportingFor.required' =>
                'Please specify who this report is for.',

            'reportingFor.in' =>
                'The reporting option is invalid.',

            'subjectContact.regex' =>
                'Enter a valid Philippine mobile number.',

            'purok.required' =>
                'Please select the incident purok.',

            'purok.in' =>
                'The selected purok is invalid.',

            'location.required' =>
                'Please provide the incident location.',

            'description.required' =>
                'Please describe the concern.',

            'photo.image' =>
                'The uploaded file must be an image.',

            'photo.mimes' =>
                'The photo must be a JPG or PNG image.',

            'photo.max' =>
                'The photo must not exceed 5 MB.',

            'noPhotoReason.max' =>
                'The no-photo reason must not exceed 300 characters.',
        ];
    }
}