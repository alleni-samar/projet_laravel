<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Flight;
use App\Models\Reservation;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Directeur des Vols',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // 2. Create Regular User
        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Samir Dupont',
                'password' => Hash::make('password'),
                'role' => 'user',
            ]
        );

        // 3. Create Flights
        $flightsData = [
            [
                'flight_number' => 'AF-1042',
                'departure_city' => 'Paris',
                'arrival_city' => 'New York',
                'departure_time' => Carbon::now()->addDays(2)->setHour(10)->setMinute(00),
                'arrival_time' => Carbon::now()->addDays(2)->setHour(18)->setMinute(30),
                'price' => 450.00,
                'total_seats' => 200,
                'available_seats' => 197 // 3 seats taken
            ],
            [
                'flight_number' => 'LH-2234',
                'departure_city' => 'Marseille',
                'arrival_city' => 'Munich',
                'departure_time' => Carbon::now()->addDays(1)->setHour(14)->setMinute(15),
                'arrival_time' => Carbon::now()->addDays(1)->setHour(16)->setMinute(00),
                'price' => 120.00,
                'total_seats' => 120,
                'available_seats' => 116 // 4 seats taken
            ],
            [
                'flight_number' => 'EK-074',
                'departure_city' => 'Paris',
                'arrival_city' => 'Dubai',
                'departure_time' => Carbon::now()->addDays(5)->setHour(21)->setMinute(45),
                'arrival_time' => Carbon::now()->addDays(6)->setHour(6)->setMinute(15),
                'price' => 680.00,
                'total_seats' => 300,
                'available_seats' => 298 // 2 seats taken
            ],
            [
                'flight_number' => 'IB-3120',
                'departure_city' => 'Lyon',
                'arrival_city' => 'Madrid',
                'departure_time' => Carbon::now()->addDays(3)->setHour(8)->setMinute(30),
                'arrival_time' => Carbon::now()->addDays(3)->setHour(10)->setMinute(15),
                'price' => 85.00,
                'total_seats' => 150,
                'available_seats' => 150
            ],
            [
                'flight_number' => 'TO-4402',
                'departure_city' => 'Nantes',
                'arrival_city' => 'Marrakech',
                'departure_time' => Carbon::now()->addDays(4)->setHour(6)->setMinute(00),
                'arrival_time' => Carbon::now()->addDays(4)->setHour(9)->setMinute(30),
                'price' => 140.00,
                'total_seats' => 189,
                'available_seats' => 189
            ],
        ];

        $flights = [];
        foreach ($flightsData as $data) {
            $flights[] = Flight::firstOrCreate(
                ['flight_number' => $data['flight_number']],
                $data
            );
        }

        // 4. Create some past and present reservations for समीर/Samir
        // Let's create two active reservations
        Reservation::firstOrCreate(
            ['reservation_number' => 'RSV-AA11BB'],
            [
                'user_id' => $user->id,
                'flight_id' => $flights[0]->id, // AF-1042
                'reservation_number' => 'RSV-AA11BB',
                'seats_count' => 3,
                'total_price' => 1350.00,
                'status' => 'confirmed',
                'created_at' => Carbon::now()->subMonths(1)
            ]
        );

        Reservation::firstOrCreate(
            ['reservation_number' => 'RSV-CC22DD'],
            [
                'user_id' => $user->id,
                'flight_id' => $flights[1]->id, // LH-2234
                'reservation_number' => 'RSV-CC22DD',
                'seats_count' => 4,
                'total_price' => 480.00,
                'status' => 'confirmed',
                'created_at' => Carbon::now()
            ]
        );

        // Let's create an admin or other user reservation for top flights statistics
        Reservation::firstOrCreate(
            ['reservation_number' => 'RSV-EE33FF'],
            [
                'user_id' => $admin->id,
                'flight_id' => $flights[2]->id, // EK-074
                'reservation_number' => 'RSV-EE33FF',
                'seats_count' => 2,
                'total_price' => 1360.00,
                'status' => 'confirmed',
                'created_at' => Carbon::now()->subMonths(2)
            ]
        );

        // Let's create a cancelled reservation for समीर
        Reservation::firstOrCreate(
            ['reservation_number' => 'RSV-XX99YY'],
            [
                'user_id' => $user->id,
                'flight_id' => $flights[2]->id, // EK-074
                'reservation_number' => 'RSV-XX99YY',
                'seats_count' => 1,
                'total_price' => 680.00,
                'status' => 'cancelled',
                'created_at' => Carbon::now()->subMonths(3)
            ]
        );
    }
}
