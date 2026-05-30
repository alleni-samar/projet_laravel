<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Http\Request;
use Exception;

class ReservationController extends Controller
{
    protected ReservationService $reservationService;

    /**
     * Inject ReservationService.
     */
    public function __construct(ReservationService $reservationService)
    {
        $this->reservationService = $reservationService;
    }

    /**
     * Get the authenticated user's reservations.
     */
    public function index(Request $request)
    {
        $reservations = $request->user()
            ->reservations()
            ->with('flight')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'reservations' => $reservations
        ]);
    }

    /**
     * Store a new reservation.
     */
    public function store(Request $request)
    {
        $request->validate([
            'flight_id' => 'required|exists:flights,id',
            'seats_count' => 'required|integer|min:1',
        ]);

        $flight = Flight::find($request->flight_id);

        try {
            $reservation = $this->reservationService->createReservation(
                $request->user(),
                $flight,
                $request->seats_count
            );

            // Load flight relation to return comprehensive details
            $reservation->load('flight');

            return response()->json([
                'status' => 'success',
                'message' => 'Réservation effectuée avec succès.',
                'reservation' => $reservation
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Cancel a reservation.
     */
    public function cancel(Request $request, $id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Réservation non trouvée.'
            ], 404);
        }

        // Check if the user is authorized to cancel this reservation
        // Either the owner of the reservation, or an admin
        if ($reservation->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès refusé. Vous n\'êtes pas autorisé à annuler cette réservation.'
            ], 403);
        }

        try {
            $this->reservationService->cancelReservation($reservation);

            return response()->json([
                'status' => 'success',
                'message' => 'Réservation annulée avec succès.',
                'reservation' => $reservation->load('flight')
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
