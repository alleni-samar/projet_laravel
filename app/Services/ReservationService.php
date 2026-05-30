<?php

namespace App\Services;

use App\Models\Flight;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class ReservationService
{
    /**
     * Create a new reservation for a user.
     *
     * @param User $user
     * @param Flight $flight
     * @param int $seatsCount
     * @return Reservation
     * @throws Exception
     */
    public function createReservation(User $user, Flight $flight, int $seatsCount): Reservation
    {
        return DB::transaction(function () use ($user, $flight, $seatsCount) {
            // Lock flight for writing to prevent race conditions
            $flight = Flight::where('id', $flight->id)->lockForUpdate()->first();

            if (!$flight) {
                throw new Exception("Le vol demandé n'existe pas.");
            }

            if ($flight->available_seats < $seatsCount) {
                throw new Exception("Nombre de sièges insuffisant. Sièges disponibles : {$flight->available_seats}.");
            }

            // Decrement available seats
            $flight->available_seats -= $seatsCount;
            $flight->save();

            // Generate unique reservation number
            do {
                $reservationNumber = 'RSV-' . strtoupper(Str::random(6));
            } while (Reservation::where('reservation_number', $reservationNumber)->exists());

            $totalPrice = $flight->price * $seatsCount;

            return Reservation::create([
                'user_id' => $user->id,
                'flight_id' => $flight->id,
                'reservation_number' => $reservationNumber,
                'seats_count' => $seatsCount,
                'total_price' => $totalPrice,
                'status' => 'confirmed'
            ]);
        });
    }

    /**
     * Cancel an existing reservation.
     *
     * @param Reservation $reservation
     * @return bool
     * @throws Exception
     */
    public function cancelReservation(Reservation $reservation): bool
    {
        return DB::transaction(function () use ($reservation) {
            if ($reservation->status === 'cancelled') {
                throw new Exception("Cette réservation est déjà annulée.");
            }

            $flight = Flight::where('id', $reservation->flight_id)->lockForUpdate()->first();
            
            if ($flight) {
                // Restock available seats
                $flight->available_seats += $reservation->seats_count;
                // Double check that we don't exceed total seats
                if ($flight->available_seats > $flight->total_seats) {
                    $flight->available_seats = $flight->total_seats;
                }
                $flight->save();
            }

            // Update status
            $reservation->status = 'cancelled';
            $reservation->save();

            return true;
        });
    }
}
