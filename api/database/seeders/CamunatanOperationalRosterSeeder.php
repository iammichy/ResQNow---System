<?php

namespace Database\Seeders;

use App\Models\Personnel;
use App\Models\ResponderProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CamunatanOperationalRosterSeeder extends Seeder
{
    /**
     * Provisional Barangay Camunatan operational roster.
     *
     * Source:
     * Barangay Camunatan BDRRMC organizational and evacuation
     * documents supplied to the ResQNow project team.
     *
     * Synthetic names and documented operational functions are used as reference
     * data for the capstone prototype. Contact numbers are not
     * invented. Internal @resqnow.test accounts exist only so
     * the assignment workflow can operate consistently.
     */
    public function run(): void
    {
        $roster = [
            [
                'code' => 'CAM-RSP-001',
                'slug' => 'demo.responder.001',
                'name' => 'Demo Responder 01',
                'official_position' => 'Punong Barangay / BDRRMC Chairperson',
                'responsibility' => 'Overall Emergency Coordination',
                'team' => 'BDRRMC Command',
            ],
            [
                'code' => 'CAM-RSP-002',
                'slug' => 'demo.responder.002',
                'name' => 'Demo Responder 02',
                'official_position' => 'Kagawad',
                'responsibility' => 'Emergency Response Coordination',
                'team' => 'Response Team',
            ],
            [
                'code' => 'CAM-RSP-003',
                'slug' => 'demo.responder.003',
                'name' => 'Demo Responder 03',
                'official_position' => 'BDRRMC Member',
                'responsibility' => 'Search, Rescue and Retrieval',
                'team' => 'Search, Rescue & Retrieval Team',
            ],
            [
                'code' => 'CAM-RSP-004',
                'slug' => 'demo.responder.004',
                'name' => 'Demo Responder 04',
                'official_position' => 'Chief Tanod / BDRRMC Member',
                'responsibility' => 'Security, Scene Safety and Crowd Control',
                'team' => 'Security & Safety Team',
            ],
            [
                'code' => 'CAM-RSP-005',
                'slug' => 'demo.responder.005',
                'name' => 'Demo Responder 05',
                'official_position' => 'Midwife',
                'responsibility' => 'First Aid and Medical Assistance',
                'team' => 'Health / First Aid Team',
            ],
            [
                'code' => 'CAM-RSP-006',
                'slug' => 'demo.responder.006',
                'name' => 'Demo Responder 06',
                'official_position' => 'Kagawad',
                'responsibility' => 'Evacuation and Camp Coordination',
                'team' => 'Evacuation / Camp Management Team',
            ],
            [
                'code' => 'CAM-RSP-007',
                'slug' => 'demo.responder.007',
                'name' => 'Demo Responder 07',
                'official_position' => 'Kagawad / BDRRMC Member',
                'responsibility' => 'Fire Response and Fire Safety',
                'team' => 'Fire Management Team',
            ],
            [
                'code' => 'CAM-RSP-008',
                'slug' => 'demo.responder.008',
                'name' => 'Demo Responder 08',
                'official_position' => 'BDRRMC Member',
                'responsibility' => 'Emergency Transportation',
                'team' => 'Transportation Team',
            ],
            [
                'code' => 'CAM-RSP-009',
                'slug' => 'demo.responder.009',
                'name' => 'Demo Responder 09',
                'official_position' => 'BDRRMC Member',
                'responsibility' => 'Emergency Communication and Warning',
                'team' => 'Communication & Warning Team',
            ],
            [
                'code' => 'CAM-RSP-010',
                'slug' => 'demo.responder.010',
                'name' => 'Demo Responder 10',
                'official_position' => 'BDRRMC Member',
                'responsibility' => 'Damage Assessment and Control',
                'team' => 'Damage Control Team',
            ],
            [
                'code' => 'CAM-RSP-011',
                'slug' => 'demo.responder.011',
                'name' => 'Demo Responder 11',
                'official_position' => 'BDRRMC Member',
                'responsibility' => 'Relief Distribution and Evacuee Support',
                'team' => 'Relief Distribution Team',
            ],
            [
                'code' => 'CAM-RSP-012',
                'slug' => 'demo.responder.012',
                'name' => 'Demo Responder 12',
                'official_position' => 'Barangay Secretary',
                'responsibility' => 'Incident Documentation and Planning',
                'team' => 'Research & Planning Team',
            ],
        ];

        DB::transaction(function () use ($roster) {
            foreach ($roster as $entry) {
                /*
                 * Internal prototype identity only.
                 * No real email address or phone number is invented.
                 */
                $email =
                    $entry['slug'] . '@resqnow.test';

                $user =
                    User::query()->updateOrCreate(
                        [
                            'email' =>
                                $email,
                        ],
                        [
                            'name' =>
                                $entry['name'],

                            /*
                             * Random inaccessible password.
                             * Existing real/demo responder credentials
                             * are not touched.
                             */
                            'password' =>
                                Str::random(48),

                            'role' =>
                                'responder',

                            'account_status' =>
                                'Verified',

                            'verification_status' =>
                                'Verified',

                            'status' =>
                                'active',

                            'verified_at' =>
                                now(),
                        ]
                    );

                ResponderProfile::query()->updateOrCreate(
                    [
                        'user_id' =>
                            $user->id,
                    ],
                    [
                        'is_on_duty' =>
                            true,

                        'responder_role' =>
                            $entry['responsibility'],

                        'current_asset' =>
                            null,

                        'team_name' =>
                            $entry['team'],

                        'last_duty_changed_at' =>
                            now(),
                    ]
                );

                /*
                 * Preserve a currently assigned case if this
                 * seeder is run again.
                 */
                $existing =
                    Personnel::query()
                        ->where(
                            'personnel_code',
                            $entry['code']
                        )
                        ->first();

                Personnel::query()->updateOrCreate(
                    [
                        'personnel_code' =>
                            $entry['code'],
                    ],
                    [
                        'name' =>
                            $entry['name'],

                        /*
                         * Personnel currently has one role field,
                         * so retain both official position and
                         * operational responsibility here.
                         */
                        'role' =>
                            $entry['official_position']
                            . ' — '
                            . $entry['responsibility'],

                        'team' =>
                            $entry['team'],

                        'mobile' =>
                            'Not provided',

                        'status' =>
                            'Active',

                        'availability' =>
                            $existing?->availability
                            ?: 'Available',

                        'assignment' =>
                            $existing?->assignment,

                        'location' =>
                            'Barangay Camunatan',

                        'joined_at' =>
                            $existing?->joined_at
                            ?: now(),

                        'user_id' =>
                            $user->id,
                    ]
                );
            }
        });
    }
}