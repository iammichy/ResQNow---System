<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DeploymentIdentitySanitizerSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $nameMap = [];
            $phoneMap = [];

            /*
             * IMPORTANT:
             * Location/address/Purok/coordinates and every timestamp
             * are deliberately NOT modified by this sanitizer.
             */

            // =====================================================
            // USERS — NAMES ONLY
            // =====================================================

            if (Schema::hasTable('users')) {
                $counters = [
                    'admin' => 0,
                    'resident' => 0,
                    'responder' => 0,
                    'other' => 0,
                ];

                $users =
                    DB::table('users')
                        ->orderBy('id')
                        ->get();

                foreach ($users as $user) {
                    $role =
                        strtolower(
                            (string) ($user->role ?? 'other')
                        );

                    $bucket =
                        array_key_exists($role, $counters)
                            ? $role
                            : 'other';

                    $counters[$bucket]++;

                    $prefix = match ($bucket) {
                        'admin' =>
                            'Demo Admin',

                        'resident' =>
                            'Demo Resident',

                        'responder' =>
                            'Demo Responder',

                        default =>
                            'Demo User',
                    };

                    $newName =
                        sprintf(
                            '%s %02d',
                            $prefix,
                            $counters[$bucket]
                        );

                    $oldName =
                        trim(
                            (string) ($user->name ?? '')
                        );

                    if ($oldName !== '') {
                        $nameMap[$oldName] =
                            $newName;
                    }

                    DB::table('users')
                        ->where('id', $user->id)
                        ->update([
                            'name' =>
                                $newName,
                        ]);
                }
            }


            // =====================================================
            // RESIDENT CONTACT NUMBERS
            // =====================================================

            if (
                Schema::hasTable('resident_profiles') &&
                Schema::hasColumn(
                    'resident_profiles',
                    'contact_number'
                )
            ) {
                $profiles =
                    DB::table('resident_profiles')
                        ->orderBy('id')
                        ->get();

                foreach ($profiles as $profile) {
                    $oldPhone =
                        trim(
                            (string)
                            ($profile->contact_number ?? '')
                        );

                    $newPhone =
                        sprintf(
                            '0999%07d',
                            (int) $profile->id
                        );

                    if ($oldPhone !== '') {
                        $phoneMap[$oldPhone] =
                            $newPhone;
                    }

                    DB::table('resident_profiles')
                        ->where('id', $profile->id)
                        ->update([
                            'contact_number' =>
                                $newPhone,
                        ]);
                }
            }


            // =====================================================
            // OPTIONAL EMERGENCY CONTACT NAME / NUMBER
            // =====================================================

            if (Schema::hasTable('resident_profiles')) {
                $profiles =
                    DB::table('resident_profiles')
                        ->orderBy('id')
                        ->get();

                foreach ($profiles as $profile) {
                    $updates = [];

                    foreach ([
                        'emergency_contact_name',
                        'contact_person_name',
                    ] as $column) {
                        if (
                            Schema::hasColumn(
                                'resident_profiles',
                                $column
                            )
                        ) {
                            $old =
                                trim(
                                    (string)
                                    ($profile->{$column} ?? '')
                                );

                            $new =
                                sprintf(
                                    'Demo Emergency Contact %02d',
                                    (int) $profile->id
                                );

                            if ($old !== '') {
                                $nameMap[$old] =
                                    $new;

                                $updates[$column] =
                                    $new;
                            }
                        }
                    }

                    foreach ([
                        'emergency_contact_number',
                        'emergency_contact_phone',
                        'contact_person_number',
                    ] as $column) {
                        if (
                            Schema::hasColumn(
                                'resident_profiles',
                                $column
                            )
                        ) {
                            $old =
                                trim(
                                    (string)
                                    ($profile->{$column} ?? '')
                                );

                            $new =
                                sprintf(
                                    '0996%07d',
                                    (int) $profile->id
                                );

                            if ($old !== '') {
                                $phoneMap[$old] =
                                    $new;

                                $updates[$column] =
                                    $new;
                            }
                        }
                    }

                    if ($updates !== []) {
                        DB::table('resident_profiles')
                            ->where('id', $profile->id)
                            ->update($updates);
                    }
                }
            }


            // =====================================================
            // PERSONNEL NAME + MOBILE
            // =====================================================

            if (Schema::hasTable('personnel')) {
                $personnelRows =
                    DB::table('personnel')
                        ->orderBy('id')
                        ->get();

                foreach ($personnelRows as $index => $personnel) {
                    $linkedName = null;

                    if (
                        isset($personnel->user_id) &&
                        $personnel->user_id
                    ) {
                        $linkedName =
                            DB::table('users')
                                ->where(
                                    'id',
                                    $personnel->user_id
                                )
                                ->value('name');
                    }

                    $newName =
                        $linkedName
                        ?: sprintf(
                            'Demo Personnel %02d',
                            $index + 1
                        );

                    $oldName =
                        trim(
                            (string)
                            ($personnel->name ?? '')
                        );

                    if ($oldName !== '') {
                        $nameMap[$oldName] =
                            $newName;
                    }

                    $updates = [
                        'name' =>
                            $newName,
                    ];

                    if (
                        Schema::hasColumn(
                            'personnel',
                            'mobile'
                        )
                    ) {
                        $oldPhone =
                            trim(
                                (string)
                                ($personnel->mobile ?? '')
                            );

                        $newPhone =
                            sprintf(
                                '0998%07d',
                                (int) $personnel->id
                            );

                        if (
                            $oldPhone !== '' &&
                            strtolower($oldPhone) !==
                                'not provided'
                        ) {
                            $phoneMap[$oldPhone] =
                                $newPhone;
                        }

                        $updates['mobile'] =
                            $newPhone;
                    }

                    DB::table('personnel')
                        ->where(
                            'id',
                            $personnel->id
                        )
                        ->update($updates);
                }
            }


            // =====================================================
            // REPORT FOR ANOTHER PERSON
            // =====================================================

            if (Schema::hasTable('reports')) {
                $reports =
                    DB::table('reports')
                        ->orderBy('id')
                        ->get();

                foreach ($reports as $report) {
                    $updates = [];

                    if (
                        Schema::hasColumn(
                            'reports',
                            'affected_name'
                        ) &&
                        !empty($report->affected_name)
                    ) {
                        $oldName =
                            trim(
                                (string)
                                $report->affected_name
                            );

                        $newName =
                            sprintf(
                                'Demo Affected Person %02d',
                                (int) $report->id
                            );

                        $nameMap[$oldName] =
                            $newName;

                        $updates['affected_name'] =
                            $newName;
                    }

                    if (
                        Schema::hasColumn(
                            'reports',
                            'affected_contact'
                        ) &&
                        !empty($report->affected_contact)
                    ) {
                        $oldPhone =
                            trim(
                                (string)
                                $report->affected_contact
                            );

                        $newPhone =
                            sprintf(
                                '0997%07d',
                                (int) $report->id
                            );

                        $phoneMap[$oldPhone] =
                            $newPhone;

                        $updates['affected_contact'] =
                            $newPhone;
                    }

                    if ($updates !== []) {
                        DB::table('reports')
                            ->where(
                                'id',
                                $report->id
                            )
                            ->update($updates);
                    }
                }
            }


            // =====================================================
            // DENORMALIZED ACTOR NAMES IN AUDIT LOGS
            // =====================================================

            if (
                Schema::hasTable('audit_logs') &&
                Schema::hasColumn(
                    'audit_logs',
                    'user_name'
                )
            ) {
                $logs =
                    DB::table('audit_logs')
                        ->get();

                foreach ($logs as $log) {
                    $oldName =
                        trim(
                            (string)
                            ($log->user_name ?? '')
                        );

                    if (
                        $oldName !== '' &&
                        isset($nameMap[$oldName])
                    ) {
                        DB::table('audit_logs')
                            ->where(
                                'id',
                                $log->id
                            )
                            ->update([
                                'user_name' =>
                                    $nameMap[$oldName],
                            ]);
                    }
                }
            }


            // =====================================================
            // REPLACE PERSON NAMES / PHONE NUMBERS IF THEY WERE
            // COPIED INTO FREE-TEXT OPERATIONAL HISTORY.
            //
            // LOCATION AND TIME VALUES ARE NOT TOUCHED.
            // =====================================================

            $textTargets = [
                'audit_logs' => [
                    'remarks',
                ],

                'report_status_logs' => [
                    'remarks',
                ],

                'reports' => [
                    'description',
                    'barangay_remarks',
                    'invalid_reason',
                    'resolved_remarks',
                ],

                'incidents' => [
                    'resolution_remarks',
                    'handoff_details',
                ],

                'notifications' => [
                    'title',
                    'message',
                ],

                'announcements' => [
                    'title',
                    'message',
                    'content',
                    'body',
                ],
            ];

            $replaceMap =
                array_merge(
                    $nameMap,
                    $phoneMap
                );

            foreach (
                $textTargets as
                $table => $columns
            ) {
                if (! Schema::hasTable($table)) {
                    continue;
                }

                $existingColumns =
                    array_values(
                        array_filter(
                            $columns,
                            fn (string $column): bool =>
                                Schema::hasColumn(
                                    $table,
                                    $column
                                )
                        )
                    );

                if ($existingColumns === []) {
                    continue;
                }

                $rows =
                    DB::table($table)
                        ->get();

                foreach ($rows as $row) {
                    $updates = [];

                    foreach (
                        $existingColumns as
                        $column
                    ) {
                        $value =
                            $row->{$column} ?? null;

                        if (
                            ! is_string($value) ||
                            $value === ''
                        ) {
                            continue;
                        }

                        $sanitized =
                            str_replace(
                                array_keys($replaceMap),
                                array_values($replaceMap),
                                $value
                            );

                        if ($sanitized !== $value) {
                            $updates[$column] =
                                $sanitized;
                        }
                    }

                    if (
                        $updates !== [] &&
                        isset($row->id)
                    ) {
                        DB::table($table)
                            ->where(
                                'id',
                                $row->id
                            )
                            ->update($updates);
                    }
                }
            }
        });
    }
}