<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'report_type',
        'category',
        'description',
        'location',
        'latitude',
        'longitude',
        'status',
        'verification_status',
        'priority',

        'water_level',
        'road_passability',
        'affected_residents',
        'location_risk',
        'assistance_evacuation_need',
        'additional_risk_factors',

        'triage_score',
        'triage_recommendation',
        'triage_remarks',
        'triage_assessed_at',
        'triage_assessed_by',

        'priority_override_reason',
        'priority_assigned_at',
        'priority_assigned_by',
    ];

    protected $casts = [
        'additional_risk_factors' => 'array',
        'triage_assessed_at' => 'datetime',
        'priority_assigned_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
