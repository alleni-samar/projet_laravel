<?php

namespace Tests\Unit;

use App\Models\Flight;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlightTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function scope_future_returns_only_flights_with_departure_after_now()
    {
        // Given
        Flight::factory()->create(['departure_time' => now()->subDay()]);   // passé
        Flight::factory()->create(['departure_time' => now()->addDay()]);   // futur
        Flight::factory()->create(['departure_time' => now()->addWeek()]);  // futur

        // When
        $futureFlights = Flight::future()->get();

        // Then
        $this->assertCount(2, $futureFlights);
    }
}