<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Report extends Model
{
    use HasFactory;

    /**
     * Fields that may be mass assigned.
     */
    protected $fillable = [
        'user_id',
        'report_code',
        'report_type',
        'concern_code',
        'concern_type',
        'subcategory',
        'status',
        'priority',
        'reporting_for',
        'subject_name',
        'subject_contact',
        'relationship_note',
        'purok',
        'location',
        'landmark',
        'latitude',
        'longitude',
        'description',
        'required_assistance',
        'affected_individuals',
        'photo_path',
        'barangay_remarks',
        'invalid_reason',
        'resolved_remarks',
    ];

    /**
     * Convert database values to useful PHP types.
     */
    protected function casts(): array
    {
        return [
            'affected_individuals' => 'array',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    /**
     * Resident who submitted the report.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Complete status history of the report.
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(ReportStatusLog::class)
            ->orderBy('created_at')
            ->orderBy('id');
    }

    /**
     * Most recent report status update.
     */
    public function latestStatusLog(): HasOne
    {
        return $this->hasOne(ReportStatusLog::class)
            ->latestOfMany();
    }

    /**
     * Complete personnel assignment history.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(ReportAssignment::class)
            ->orderBy('assigned_at');
    }

    /**
     * Personnel currently assigned to the report.
     */
    public function activeAssignments(): HasMany
    {
        return $this->hasMany(ReportAssignment::class)
            ->whereNull('unassigned_at')
            ->orderBy('assigned_at');
    }
}
