<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreEmergencyReportRequest extends FormRequest
{
    private const CONCERNS = [
        'fire',
        'medical',
        'violence',
        'flood',
        'accident',
        'evacuation',
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
            'clientRequestId' => ['required', 'uuid'],
            'concernCode' => ['required', 'string', Rule::in(self::CONCERNS)],
            'svfAnswers' => ['required', 'array'],
            'svfAnswers.*' => ['nullable', 'string', 'max:80'],

            'location' => ['required', 'string', 'max:1000'],
            'latitude' => ['nullable', 'required_if:locationSource,gps', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'required_if:locationSource,gps', 'numeric', 'between:-180,180'],
            'locationSource' => ['nullable', 'string', Rule::in(['gps', 'saved', 'manual'])],
            'locationAccuracy' => ['nullable', 'required_if:locationSource,gps', 'numeric', 'min:0', 'max:100000'],
            'locationCapturedAt' => ['nullable', 'required_if:locationSource,gps', 'date'],

            'reportingForOther' => ['sometimes', 'boolean'],
            'subjectName' => ['nullable', 'string', 'max:150'],
            'subjectContact' => ['nullable', 'string', 'max:30', 'regex:/^(09|\+639)\d{9}$/'],
            'landmark' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $category = (string) $this->input('concernCode');
            $answers = $this->input('svfAnswers', []);

            if (! is_array($answers)) {
                return;
            }

            $required = match ($category) {
                'flood' => ['immediateDanger', 'waterDepth', 'risingRate', 'accessCondition'],
                'fire' => ['immediateDanger', 'fireCondition', 'electricalHazard', 'exitCondition'],
                'medical' => ['immediateDanger', 'patientCondition', 'transportNeed', 'affectedCount'],
                'violence' => ['immediateDanger', 'threatStatus', 'injuryStatus', 'safeToStay'],
                'accident' => ['immediateDanger', 'trappedStatus', 'injuryStatus', 'roadAccess'],
                'evacuation' => ['immediateDanger', 'hazardProximity', 'canLeave', 'evacAccess'],
                default => [],
            };

            foreach ($required as $key) {
                if (! isset($answers[$key]) || trim((string) $answers[$key]) === '') {
                    $validator->errors()->add(
                        'svfAnswers.' . $key,
                        'Please answer all quick situation-check questions before submitting.'
                    );
                }
            }

            $allowed = $this->allowedAnswers($category);
            foreach ($answers as $key => $value) {
                if (! isset($allowed[$key]) || ! in_array((string) $value, $allowed[$key], true)) {
                    $validator->errors()->add(
                        'svfAnswers.' . $key,
                        'One of the situation-check answers is invalid. Please review the emergency form.'
                    );
                }
            }
        });
    }

    private function allowedAnswers(string $category): array
    {
        $common = [
            'immediateDanger' => ['yes', 'no', 'unsure'],
        ];

        return $common + match ($category) {
            'flood' => [
                'waterDepth' => ['shallow', 'ankle_knee', 'knee_waist', 'waist_or_higher', 'unknown'],
                'risingRate' => ['stable', 'slow', 'fast', 'unknown'],
                'accessCondition' => ['passable', 'limited', 'blocked_or_evacuation', 'unknown'],
            ],
            'fire' => [
                'fireCondition' => ['smoke_only', 'small_contained', 'active_flames', 'spreading_heavy_smoke', 'unknown'],
                'electricalHazard' => ['none', 'sparks_or_hot_wire', 'live_wire_exposed', 'unknown'],
                'exitCondition' => ['clear', 'difficult', 'cannot_exit', 'unknown'],
            ],
            'medical' => [
                'patientCondition' => ['alert_stable', 'serious_pain_injury', 'breathing_difficulty', 'unconscious_not_breathing', 'unknown'],
                'transportNeed' => ['yes', 'no', 'unsure'],
                'affectedCount' => ['one', 'two_three', 'four_plus', 'unknown'],
            ],
            'violence' => [
                'threatStatus' => ['ended', 'threatening', 'active', 'weapon', 'unknown'],
                'injuryStatus' => ['none', 'minor', 'serious', 'unknown'],
                'safeToStay' => ['yes', 'no', 'unsure'],
            ],
            'accident' => [
                'trappedStatus' => ['yes', 'no', 'unknown'],
                'injuryStatus' => ['none', 'minor', 'serious', 'unknown'],
                'roadAccess' => ['passable', 'partial', 'blocked', 'unknown'],
            ],
            'evacuation' => [
                'hazardProximity' => ['no_immediate', 'nearby', 'immediate', 'unknown'],
                'canLeave' => ['yes', 'needs_assistance', 'cannot_leave', 'unknown'],
                'evacAccess' => ['open', 'limited', 'blocked', 'unknown'],
            ],
            default => [],
        };
    }

    public function messages(): array
    {
        return [
            'clientRequestId.required' => 'The emergency request could not be prepared safely. Refresh and try again.',
            'clientRequestId.uuid' => 'The emergency request identifier is invalid. Refresh and try again.',
            'concernCode.required' => 'Please select the type of emergency.',
            'concernCode.in' => 'The selected emergency type is invalid.',
            'svfAnswers.required' => 'Please complete the quick situation check.',
            'location.required' => 'Please provide the emergency location.',
            'location.max' => 'The emergency location is too long.',
            'latitude.between' => 'The latitude is invalid.',
            'longitude.between' => 'The longitude is invalid.',
            'latitude.required_if' => 'Current GPS latitude is missing. Please capture your location again.',
            'longitude.required_if' => 'Current GPS longitude is missing. Please capture your location again.',
            'locationSource.in' => 'The selected location method is invalid.',
            'locationAccuracy.required_if' => 'GPS accuracy is missing. Please capture your location again.',
            'locationCapturedAt.required_if' => 'GPS capture time is missing. Please capture your location again.',
            'reportingForOther.boolean' => 'The reporting option is invalid.',
            'subjectName.max' => 'The affected person name is too long.',
            'subjectContact.regex' => 'Enter a valid Philippine mobile number.',
            'description.max' => 'The description must not exceed 2000 characters.',
        ];
    }
}
