<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmergencyReportRequest extends FormRequest
{
    /**
     * Only a verified resident may submit
     * an emergency report.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->role === 'resident'
            && $user->account_status === 'Verified';
    }

    /**
     * Validate emergency report information.
     */
    public function rules(): array
    {
        return [
            // Emergency category selected by resident
            'concernCode' => [
                'required',
                'string',
                Rule::in([
                    'life-death',
                    'fire',
                    'medical',
                    'violence',
                    'flood',
                    'accident',
                    'evacuation',
                ]),
            ],

            // Actual emergency location
            'location' => [
                'required',
                'string',
                'max:1000',
            ],

            // Optional map coordinates
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

            // Whether the resident is reporting
            // an emergency for another person
            'reportingForOther' => [
                'sometimes',
                'boolean',
            ],

            // Optional victim information
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

            // Optional emergency information
            'landmark' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    /**
     * User-friendly validation messages.
     */
    public function messages(): array
    {
        return [
            'concernCode.required' =>
                'Please select the type of emergency.',

            'concernCode.in' =>
                'The selected emergency type is invalid.',

            'location.required' =>
                'Please provide the emergency location.',

            'location.max' =>
                'The emergency location is too long.',

            'latitude.between' =>
                'The latitude is invalid.',

            'longitude.between' =>
                'The longitude is invalid.',

            'reportingForOther.boolean' =>
                'The reporting option is invalid.',

            'subjectName.max' =>
                'The victim name is too long.',

            'subjectContact.regex' =>
                'Enter a valid Philippine mobile number.',

            'description.max' =>
                'The description must not exceed 2000 characters.',
        ];
    }
}
