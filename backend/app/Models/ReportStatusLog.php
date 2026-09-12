<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportStatusLog extends Model
{
    use HasFactory;

    /**
     * Fields that may be mass assigned.
     */
    protected $fillable = [
        'report_id',
        'status',
        'remarks',
        'changed_by_user_id',
    ];

    /**
     * Report this status update belongs to.
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    /**
     * User who caused the status change.
     *
     * This may be null for system-generated updates.
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'changed_by_user_id'
        );
    }
}
