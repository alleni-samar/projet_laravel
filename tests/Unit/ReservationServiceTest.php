<?php

namespace Tests\Unit;

use App\Models\Flight;
use App\Models\User;
use App\Services\ReservationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationServiceTest extends TestCase
{
    use RefreshDatabase;

    private ReservationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ReservationService();
    }

    /** @test */
    public function test_it_creates_reservation_and_decreases_available_seats()
    {
        $flight = Flight::factory()->create(['available_seats' => 10]);
        $user = User::factory()->create();

        $reservation = $this->service->createReservation($user, $flight, 2);

        $this->assertDatabaseHas('reservations', [
            'user_id' => $user->id,
            'flight_id' => $flight->id,
            'seats_count' => 2,
        ]);
        $this->assertEquals(8, $flight->fresh()->available_seats);
        $this->assertNotNull($reservation->reservation_number);
    }

    /** @test */
    public function test_it_throws_exception_when_not_enough_seats()
    {
        $this->expectException(\Exception::class);
        $flight = Flight::factory()->create(['available_seats' => 1]);
        $user = User::factory()->create();

        $this->service->createReservation($user, $flight, 2);
    }

    /** @test */
    public function test_it_cancels_reservation_and_restores_seats()
    {
        $flight = Flight::factory()->create(['available_seats' => 10]);
        $user = User::factory()->create();
        $reservation = $this->service->createReservation($user, $flight, 3);

        $this->service->cancelReservation($reservation);

        $this->assertEquals('cancelled', $reservation->fresh()->status);
        $this->assertEquals(10, $flight->fresh()->available_seats);
    }
}