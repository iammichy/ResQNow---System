<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // ============ REGISTER ============
    /**
     * Register a new resident account.
     */
    public function register(
        RegisterRequest $request
    ): JsonResponse {
        $data =
            $request->validated();

        $user = DB::transaction(
            function () use ($data) {
                // Create account
                $user = User::create([
                    'name' =>
                        $data['fullName'],

                    'email' =>
                        strtolower(
                            $data['email']
                        ),

                    'password' =>
                        Hash::make(
                            $data['password']
                        ),

                    'role' =>
                        'resident',

                    'account_status' =>
                        'Pending Verification',
                ]);

                // Create resident profile
                $householdProfile =
                    $data['householdProfile'] ?? [];

                $user
                    ->profile()
                    ->create([
                        'contact_number' =>
                            $data['contactNumber'],

                        'purok' =>
                            $data['purok'],

                        'address' =>
                            $data['address'],

                        'household_count' =>
                            $data['householdCount'] ?? 1,

                        'has_senior_citizen' =>
                            $householdProfile['hasSeniorCitizen'] ?? false,

                        'has_child' =>
                            $householdProfile['hasChild'] ?? false,

                        'has_pwd' =>
                            $householdProfile['hasPWD'] ?? false,

                        'has_pregnant_person' =>
                            $householdProfile['hasPregnantPerson'] ?? false,

                        'home_latitude' =>
                            $data['homeLatitude'] ?? null,

                        'home_longitude' =>
                            $data['homeLongitude'] ?? null,
                    ]);

                return $user;
            }
        );

        $user->load('profile');

        return response()->json([
            'message' =>
                'Resident account created successfully. Your account is pending barangay verification.',

            'user' =>
                new UserResource(
                    $user
                ),
        ], 201);
    }

    // ============ LOGIN ============
    /**
     * Authenticate a verified resident.
     */
    public function login(
        LoginRequest $request
    ): JsonResponse {
        $data =
            $request->validated();

        $remember =
            $data['remember'] ?? false;

        // Check email and password
        if (
            !Auth::attempt(
                [
                    'email' =>
                        strtolower(
                            $data['email']
                        ),

                    'password' =>
                        $data['password'],
                ],
                $remember
            )
        ) {
            return response()->json([
                'message' =>
                    'The email or password you entered is incorrect.',
            ], 422);
        }

        $request
            ->session()
            ->regenerate();

        /** @var User $user */
        $user =
            $request->user();

        // Resident portal only
        if (
            $user->role !==
            'resident'
        ) {
            $this->endSession(
                $request
            );

            return response()->json([
                'message' =>
                    'This account does not have resident access.',
            ], 403);
        }

        // Barangay must verify resident first
        if (
            $user->account_status !==
            'Verified'
        ) {
            $accountStatus =
                $user->account_status;

            $this->endSession(
                $request
            );

            return response()->json([
                'message' =>
                    $accountStatus === 'Pending Verification'
                        ? 'Your account is still waiting for barangay verification.'
                        : 'Your account is currently unavailable.',

                'accountStatus' =>
                    $accountStatus,
            ], 403);
        }

        $user->load('profile');

        return response()->json([
            'message' =>
                'Signed in successfully.',

            'user' =>
                new UserResource(
                    $user
                ),
        ]);
    }

    // ============ CURRENT USER ============
    /**
     * Return the authenticated resident.
     */
    public function user(
        Request $request
    ): UserResource {
        /** @var User $user */
        $user =
            $request->user();

        $user->load('profile');

        return new UserResource(
            $user
        );
    }

    // ============ LOGOUT ============
    /**
     * End the resident session.
     */
    public function logout(
        Request $request
    ): JsonResponse {
        $this->endSession(
            $request
        );

        return response()->json([
            'message' =>
                'Signed out successfully.',
        ]);
    }

    // ============ SESSION ============
    /**
     * Safely destroy an authenticated session.
     */
    private function endSession(
        Request $request
    ): void {
        Auth::guard('web')
            ->logout();

        $request
            ->session()
            ->invalidate();

        $request
            ->session()
            ->regenerateToken();
    }
}
