<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (
            Schema::hasTable('report_status_logs') &&
            ! Schema::hasColumn(
                'report_status_logs',
                'resident_visible'
            )
        ) {
            Schema::table(
                'report_status_logs',
                function (Blueprint $table) {
                    $table
                        ->boolean('resident_visible')
                        ->default(false)
                        ->index();
                }
            );
        }

        if (
            ! Schema::hasTable('report_status_logs') ||
            ! Schema::hasColumn(
                'report_status_logs',
                'resident_visible'
            )
        ) {
            return;
        }


        /*
         * Existing operational/internal events must not suddenly
         * become Resident-visible just because the new column
         * defaults to true.
         */
        DB::table('report_status_logs')
            ->whereIn(
                'activity',
                [
                    'Assignment acknowledged',
                    'Responder submitted field outcome',
                    'Responder added field update',
                    'Responder requested additional support',
                    'Responder requested location assistance',
                    'Responder requested incident review',
                    'Resident submitted emergency report',
                    'Resident submitted non-emergency report',
                ]
            )
            ->update([
                'resident_visible' => false,
            ]);

        DB::table('report_status_logs')
            ->where(
                'remarks',
                'like',
                'SOS triggered by resident.%'
            )
            ->update([
                'resident_visible' => false,
            ]);
    }

    public function down(): void
    {
        if (
            Schema::hasTable('report_status_logs') &&
            Schema::hasColumn(
                'report_status_logs',
                'resident_visible'
            )
        ) {
            Schema::table(
                'report_status_logs',
                function (Blueprint $table) {
                    $table->dropColumn(
                        'resident_visible'
                    );
                }
            );
        }
    }
};