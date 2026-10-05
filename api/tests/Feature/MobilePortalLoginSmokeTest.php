<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class MobilePortalLoginSmokeTest extends TestCase
{
    use RefreshDatabase;

    private function createMobileUser(
        string $role,
        string $email,
        string $password = 'ResQNowTest123!'
    ): User {
        return User::factory()->create([
            'name' => ucfirst($role) . ' Test User',
            'email' => $email,
            'password' => Hash::make($password),
            'role' => $role,
            'account_status' => 'Verified',
        ]);
    }

    public function test_resident_and_responder_can_sign_in_through_their_own_portals(): void
    {
        $password = 'ResQNowTest123!';

        $resident = $this->createMobileUser(
            'resident',
            'resident-login@test.local',
            $password
        );

        $responder = $this->createMobileUser(
            'responder',
            'responder-login@test.local',
            $password
        );

        $residentResponse = $this->postJson('/api/app/login', [
            'email' => $resident->email,
            'password' => $password,
            'portal' => 'resident',
        ]);

        $residentResponse
            ->assertOk()
            ->assertJsonPath('user.role', 'resident')
            ->assertJsonStructure([
                'token',
            ]);

        $responderResponse = $this->postJson('/api/app/login', [
            'email' => $responder->email,
            'password' => $password,
            'portal' => 'responder',
        ]);

        $responderResponse
            ->assertOk()
            ->assertJsonPath('user.role', 'responder')
            ->assertJsonStructure([
                'token',
            ]);

        $this->assertSame(
            2,
            PersonalAccessToken::count()
        );
    }

    public function test_accounts_are_rejected_when_using_the_wrong_mobile_portal(): void
    {
        $password = 'ResQNowTest123!';

        $resident = $this->createMobileUser(
            'resident',
            'resident-wrong-portal@test.local',
            $password
        );

        $responder = $this->createMobileUser(
            'responder',
            'responder-wrong-portal@test.local',
            $password
        );

        $this->postJson('/api/app/login', [
            'email' => $resident->email,
            'password' => $password,
            'portal' => 'responder',
        ])
            ->assertStatus(422)
            ->assertJson([
                'message' => 'The email or password you entered is incorrect.',
            ])
            ->assertJsonMissingPath('token');

        $this->postJson('/api/app/login', [
            'email' => $responder->email,
            'password' => $password,
            'portal' => 'resident',
        ])
            ->assertStatus(422)
            ->assertJson([
                'message' => 'The email or password you entered is incorrect.',
            ])
            ->assertJsonMissingPath('token');

        // Wrong-portal attempts must be rejected before Sanctum creates tokens.
        $this->assertSame(
            0,
            PersonalAccessToken::count()
        );
    }

    public function test_logging_out_one_mobile_account_does_not_revoke_the_other_token(): void
    {
        $password = 'ResQNowTest123!';

        $resident = $this->createMobileUser(
            'resident',
            'resident-isolation@test.local',
            $password
        );

        $responder = $this->createMobileUser(
            'responder',
            'responder-isolation@test.local',
            $password
        );

        $residentToken = $this
            ->postJson('/api/app/login', [
                'email' => $resident->email,
                'password' => $password,
                'portal' => 'resident',
            ])
            ->assertOk()
            ->json('token');

        $responderToken = $this
            ->postJson('/api/app/login', [
                'email' => $responder->email,
                'password' => $password,
                'portal' => 'responder',
            ])
            ->assertOk()
            ->json('token');

        $this->assertNotNull(
            PersonalAccessToken::findToken($residentToken)
        );

        $this->assertNotNull(
            PersonalAccessToken::findToken($responderToken)
        );

        $this
            ->withToken($residentToken)
            ->postJson('/api/app/logout')
            ->assertOk();

        // The resident token used for logout must be revoked.
        $this->assertNull(
            PersonalAccessToken::findToken($residentToken)
        );

        // The responder session must remain valid.
        $this->assertNotNull(
            PersonalAccessToken::findToken($responderToken)
        );

        $this->assertSame(
            1,
            PersonalAccessToken::count()
        );

        // Laravel may retain the resolved Sanctum guard inside the
        // same feature test. Reset it so the next request behaves
        // like a genuinely separate HTTP request.
        $this->app['auth']->forgetGuards();

        $this
            ->withToken($residentToken)
            ->getJson('/api/app/user')
            ->assertUnauthorized();

        $this->app['auth']->forgetGuards();

        $this
            ->withToken($responderToken)
            ->getJson('/api/app/user')
            ->assertOk()
            ->assertJsonPath(
                'data.role',
                'responder'
            );
    }

    public function test_admin_cannot_sign_in_through_mobile_portals(): void
    {
        $password = 'ResQNowTest123!';

        $admin = User::factory()->create([
            'name' => 'Admin Test User',
            'email' => 'admin-mobile@test.local',
            'password' => Hash::make($password),
            'role' => 'admin',
            'account_status' => 'Verified',
        ]);

        $this->postJson('/api/app/login', [
            'email' => $admin->email,
            'password' => $password,
            'portal' => 'resident',
        ])
            ->assertStatus(422)
            ->assertJson([
                'message' => 'The email or password you entered is incorrect.',
            ]);

        $this->assertSame(
            0,
            PersonalAccessToken::count()
        );
    }
}