<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Display a listing of the flights (with optional filters).
     */
    public function index(Request $request)
    {
        $query = Flight::query();

        if ($request->filled('departure_city')) {
            $query->where('departure_city', 'like', '%' . $request->departure_city . '%');
        }

        if ($request->filled('arrival_city')) {
            $query->where('arrival_city', 'like', '%' . $request->arrival_city . '%');
        }

        if ($request->filled('date')) {
            $query->whereDate('departure_time', $request->date);
        }

        // Return future flights or all for admin? Let's return flights ordered by date
        $flights = $query->orderBy('departure_time', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'flights' => $flights
        ]);
    }

    /**
     * Store a newly created flight in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'flight_number' => 'required|string|unique:flights,flight_number|max:20',
            'departure_city' => 'required|string|max:255',
            'arrival_city' => 'required|string|max:255',
            'departure_time' => 'required|date|after_or_equal:today',
            'arrival_time' => 'required|date|after:departure_time',
            'price' => 'required|numeric|min:0',
            'total_seats' => 'required|integer|min:1',
        ]);

        $flight = Flight::create([
            'flight_number' => strtoupper($request->flight_number),
            'departure_city' => $request->departure_city,
            'arrival_city' => $request->arrival_city,
            'departure_time' => $request->departure_time,
            'arrival_time' => $request->arrival_time,
            'price' => $request->price,
            'total_seats' => $request->total_seats,
            'available_seats' => $request->total_seats // Initially equal to total_seats
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Vol créé avec succès.',
            'flight' => $flight
        ], 201);
    }

    /**
     * Display the specified flight.
     */
    public function show($id)
    {
        $flight = Flight::find($id);

        if (!$flight) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vol non trouvé.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'flight' => $flight
        ]);
    }

    /**
     * Update the specified flight in storage.
     */
    public function update(Request $request, $id)
    {
        $flight = Flight::find($id);

        if (!$flight) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vol non trouvé.'
            ], 404);
        }

        $request->validate([
            'flight_number' => 'required|string|max:20|unique:flights,flight_number,' . $flight->id,
            'departure_city' => 'required|string|max:255',
            'arrival_city' => 'required|string|max:255',
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date|after:departure_time',
            'price' => 'required|numeric|min:0',
            'total_seats' => 'required|integer|min:1',
        ]);

        // Adjust available_seats based on seats already reserved in confirmed reservations
        $reservedSeats = $flight->reservations()
            ->where('status', 'confirmed')
            ->sum('seats_count');

        $newAvailableSeats = $request->total_seats - $reservedSeats;

        if ($newAvailableSeats < 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de réduire le nombre total de sièges à une valeur inférieure au nombre de sièges déjà réservés (' . $reservedSeats . ').'
            ], 422);
        }

        $flight->update([
            'flight_number' => strtoupper($request->flight_number),
            'departure_city' => $request->departure_city,
            'arrival_city' => $request->arrival_city,
            'departure_time' => $request->departure_time,
            'arrival_time' => $request->arrival_time,
            'price' => $request->price,
            'total_seats' => $request->total_seats,
            'available_seats' => $newAvailableSeats
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Vol mis à jour avec succès.',
            'flight' => $flight
        ]);
    }

    /**
     * Remove the specified flight from storage.
     */
    public function destroy($id)
    {
        $flight = Flight::find($id);

        if (!$flight) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vol non trouvé.'
            ], 404);
        }

        $flight->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Vol supprimé avec succès.'
        ]);
    }
}
