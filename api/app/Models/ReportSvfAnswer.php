<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportSvfAnswer extends Model
{
    protected $fillable = [
        'report_id',
        'category',
        'answers',
        'flags',
        'rule_version',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'flags' => 'array',
        ];
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
