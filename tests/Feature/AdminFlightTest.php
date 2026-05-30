<?php

namespace Tests\Feature;

use App\Models\Flight;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFlightTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function test_admin_can_create_a_flight()
    {
        $response = $this->actingAs($this->admin)->postJson('/api/admin/flights', [
            'flight_number' => 'AF-1042',
            'departure_city' => 'Paris',
            'arrival_city' => 'New York',
            'departure_time' => now()->addDays(2)->toDateTimeString(),
            'arrival_time' => now()->addDays(2)->addHours(8)->toDateTimeString(),
            'total_seats' => 150,
            'available_seats' => 150,
            'price' => 500
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('flights', ['flight_number' => 'AF-1042']);
    }

    /** @test */
    public function test_non_admin_cannot_create_flight()
    {
        $response = $this->actingAs($this->user)->postJson('/api/admin/flights', []);
        $response->assertStatus(403);
    }

    /** @test */
    public function test_admin_can_delete_flight()
    {
        $flight = Flight::factory()->create();
        $response = $this->actingAs($this->admin)->deleteJson("/api/admin/flights/{$flight->id}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('flights', ['id' => $flight->id]);
    }
}