<?php

namespace Tests\Feature;

use App\Models\Flight;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlightApiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function test_user_can_search_flights_by_city()
    {
        Flight::factory()->create(['departure_city' => 'Paris', 'arrival_city' => 'Londres']);
        Flight::factory()->create(['departure_city' => 'Paris', 'arrival_city' => 'Berlin']);

        $response = $this->actingAs(User::factory()->create())->getJson('/api/flights?departure_city=Paris&arrival_city=Londres');

        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonCount(1, 'flights')
                 ->assertJsonPath('flights.0.arrival_city', 'Londres');
    }
}