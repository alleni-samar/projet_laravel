<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get statistics for the authenticated user.
     */
    public function statsUser(Request $request)
    {
        $user = $request->user();

        $totalReservations = $user->reservations()->count();
        
        $activeReservations = $user->reservations()
            ->where('status', 'confirmed')
            ->count();

        $totalSpent = $user->reservations()
            ->where('status', 'confirmed')
            ->sum('total_price');

        return response()->json([
            'status' => 'success',
            'stats' => [
                'total_reservations' => $totalReservations,
                'active_reservations' => $activeReservations,
                'total_spent' => round($totalSpent, 2)
            ]
        ]);
    }

    /**
     * Get statistics for the admin dashboard.
     */
    public function statsAdmin(Request $request)
    {
        // 1. Total flights
        $totalFlights = Flight::count();

        // 2. Total reservations
        $totalReservations = Reservation::count();

        // 3. Total seats reserved (Replacing total revenue)
        $totalSeatsReserved = Reservation::where('status', 'confirmed')->sum('seats_count');

        // 4. Monthly reservations (last 6 months, database-agnostic grouping in PHP)
        $monthlyStats = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthKey = Carbon::now()->subMonths($i)->format('Y-m');
            // Format french month name, e.g. "Mai"
            $monthLabel = Carbon::now()->subMonths($i)->translatedFormat('F');
            $monthlyStats[$monthKey] = [
                'label' => ucfirst($monthLabel),
                'reservations_count' => 0,
                'seats_reserved' => 0,
            ];
        }

        $recentReservations = Reservation::where('status', 'confirmed')
            ->where('created_at', '>=', Carbon::now()->subMonths(5)->startOfMonth())
            ->get();

        foreach ($recentReservations as $res) {
            $key = $res->created_at->format('Y-m');
            if (isset($monthlyStats[$key])) {
                $monthlyStats[$key]['reservations_count']++;
                $monthlyStats[$key]['seats_reserved'] += (int)$res->seats_count;
            }
        }

        $chartLabels = [];
        $chartReservations = [];
        $chartSeatsReserved = [];
        foreach ($monthlyStats as $stat) {
            $chartLabels[] = $stat['label'];
            $chartReservations[] = $stat['reservations_count'];
            $chartSeatsReserved[] = $stat['seats_reserved'];
        }

        // 5. Top 5 flights (by sum of seats_count in confirmed reservations)
        $topFlights = Flight::withSum(['reservations' => function($query) {
            $query->where('status', 'confirmed');
        }], 'seats_count')
        ->get()
        ->sortByDesc('reservations_sum_seats_count')
        ->take(5)
        ->values()
        ->map(function($flight) {
            return [
                'flight_number' => $flight->flight_number,
                'departure_city' => $flight->departure_city,
                'arrival_city' => $flight->arrival_city,
                'seats_reserved' => (int)($flight->reservations_sum_seats_count ?? 0)
            ];
        });

        return response()->json([
            'status' => 'success',
            'stats' => [
                'total_flights' => $totalFlights,
                'total_reservations' => $totalReservations,
                'total_seats_reserved' => (int)$totalSeatsReserved,
                'monthly' => [
                    'labels' => $chartLabels,
                    'reservations' => $chartReservations,
                    'seats_reserved' => $chartSeatsReserved,
                ],
                'top_flights' => $topFlights
            ]
        ]);
    }
}
