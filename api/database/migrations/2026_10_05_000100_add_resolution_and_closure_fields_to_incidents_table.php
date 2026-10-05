<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('incidents', function (Blueprint $table) {
            $table->string('resolution_type')->nullable();
            $table->text('resolution_remarks')->nullable();

            $table->string('handoff_agency')->nullable();
            $table->text('handoff_details')->nullable();

            $table->boolean('closure_field_outcome_reviewed')
                ->default(false);

            $table->boolean('closure_resolution_reviewed')
                ->default(false);

            $table->boolean('closure_handoff_information_verified')
                ->default(false);

            $table->boolean('closure_ready_confirmed')
                ->default(false);

            $table->timestamp('closed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('incidents', function (Blueprint $table) {
            $table->dropColumn([
                'resolution_type',
                'resolution_remarks',
                'handoff_agency',
                'handoff_details',
                'closure_field_outcome_reviewed',
                'closure_resolution_reviewed',
                'closure_handoff_information_verified',
                'closure_ready_confirmed',
                'closed_at',
            ]);
        });
    }
};