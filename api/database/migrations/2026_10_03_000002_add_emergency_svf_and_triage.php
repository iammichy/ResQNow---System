<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $columns = [
            'triage_flags' => fn (Blueprint $table) => $table->json('triage_flags')->nullable(),
            'triage_rule_version' => fn (Blueprint $table) => $table->string('triage_rule_version', 80)->nullable(),
            'triage_recalculated_at' => fn (Blueprint $table) => $table->timestamp('triage_recalculated_at')->nullable(),
        ];

        foreach ($columns as $name => $define) {
            if (! Schema::hasColumn('reports', $name)) {
                Schema::table('reports', function (Blueprint $table) use ($define) {
                    $define($table);
                });
            }
        }

        if (! Schema::hasTable('report_svf_answers')) {
            Schema::create('report_svf_answers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('report_id')->unique()->constrained('reports')->cascadeOnDelete();
                $table->string('category', 80);
                $table->json('answers');
                $table->json('flags')->nullable();
                $table->string('rule_version', 80);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('report_svf_answers');

        $drop = [];
        foreach (['triage_flags', 'triage_rule_version', 'triage_recalculated_at'] as $column) {
            if (Schema::hasColumn('reports', $column)) {
                $drop[] = $column;
            }
        }

        if ($drop !== []) {
            Schema::table('reports', function (Blueprint $table) use ($drop) {
                $table->dropColumn($drop);
            });
        }
    }
};
