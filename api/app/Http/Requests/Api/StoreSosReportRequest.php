<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreSosReportRequest extends FormRequest
{
    /**
     * Only a verified resident may trigger SOS.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->role === 'resident'
            && $user->account_status === 'Verified';
    }

    /**
     * GPS is best-effort. SOS remains valid when
     * location is missing, denied, or times out.
     */
    public function rules(): array
    {
        return [
            'reason' => [
                'required',
                'string',
                'in:fire,flood,medical,accident,violence,other',
            ],

            'location' => [
                'nullable',
                'array',
            ],

            'location.latitude' => [
                'nullable',
                'required_with:location.longitude',
                'numeric',
                'between:-90,90',
            ],

            'location.longitude' => [
                'nullable',
                'required_with:location.latitude',
                'numeric',
                'between:-180,180',
            ],

            'location.accuracy' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100000',
            ],

            'location.capturedAt' => [
                'nullable',
                'date',
            ],
            'location.source' => [
                'nullable',
                'string',
                'in:gps,manual',
            ],

            'location.label' => [
                'nullable',
                'string',
                'max:240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' =>
                'Choose the SOS reason before sending.',

            'reason.in' =>
                'The selected SOS reason is invalid.',

            'location.latitude.between' =>
                'The captured SOS latitude is invalid.',

            'location.longitude.between' =>
                'The captured SOS longitude is invalid.',

            'location.latitude.required_with' =>
                'The captured SOS location is incomplete.',

            'location.longitude.required_with' =>
                'The captured SOS location is incomplete.',
        ];
    }
}
