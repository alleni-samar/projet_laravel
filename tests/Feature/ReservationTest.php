<?php

namespace Tests\Feature;

use App\Models\Flight;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function test_authenticated_user_can_book_a_flight()
    {
        $user = User::factory()->create();
        $flight = Flight::factory()->create(['available_seats' => 5]);

        $response = $this->actingAs($user)->postJson('/api/reservations', [
            'flight_id' => $flight->id,
            'seats_count' => 2,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('reservations', [
            'user_id' => $user->id,
            'flight_id' => $flight->id,
            'seats_count' => 2,
        ]);
        $this->assertEquals(3, $flight->fresh()->available_seats);
    }

    /** @test */
    public function test_unauthenticated_user_cannot_book()
    {
        $flight = Flight::factory()->create();
        $response = $this->postJson('/api/reservations', [
            'flight_id' => $flight->id,
            'seats_count' => 1,
        ]);
        $response->assertStatus(401);
    }
}