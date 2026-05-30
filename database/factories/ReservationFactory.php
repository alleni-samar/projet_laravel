<?php

namespace Database\Factories;

use App\Models\Reservation;
use App\Models\User;
use App\Models\Flight;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'flight_id' => Flight::factory(),
            'booking_reference' => strtoupper('RES-'.uniqid()),
            'seats_reserved' => fake()->numberBetween(1, 4),
            'status' => 'confirmed',
        ];
    }
}