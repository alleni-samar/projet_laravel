<?php

namespace Database\Factories;

use App\Models\Flight;
use Illuminate\Database\Eloquent\Factories\Factory;

class FlightFactory extends Factory
{
    protected $model = Flight::class;

    public function definition(): array
    {
        $departure = fake()->dateTimeBetween('+1 day', '+1 month');
        $arrival = (clone $departure)->modify('+'.fake()->numberBetween(1,8).' hours');
        $totalSeats = fake()->numberBetween(100, 200);
        return [
            'flight_number' => 'FL-' . fake()->unique()->numberBetween(1000, 9999),
            'departure_city' => fake()->city(),
            'arrival_city' => fake()->city(),
            'departure_time' => $departure,
            'arrival_time' => $arrival,
            'total_seats' => $totalSeats,
            'available_seats' => $totalSeats,
            'price' => fake()->numberBetween(50, 800),
        ];
    }
}