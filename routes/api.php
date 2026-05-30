<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\FlightController;
use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\ChatbotController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par authentification (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    // Vols
    Route::get('/flights', [FlightController::class, 'index']);
    Route::get('/flights/{flight}', [FlightController::class, 'show']);
    
    // Réservations
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/user/reservations', [ReservationController::class, 'index']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'cancel']);
    
    // Statistiques utilisateur
    Route::get('/user/stats', [DashboardController::class, 'statsUser']);
    
    // Chatbot IA
    Route::post('/chatbot', [ChatbotController::class, 'ask']);
    Route::get('/chatbot/history', [ChatbotController::class, 'getHistory']);
    Route::delete('/chatbot/history', [ChatbotController::class, 'clearHistory']);
    
    Route::get('/user/dashboard', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Bienvenue dans votre tableau de bord Utilisateur.'
        ]);
    });
});

// Routes protégées par authentification ET par rôle admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Statistiques admin
    Route::get('/admin/stats', [DashboardController::class, 'statsAdmin']);
    
    // CRUD complet pour les vols
    Route::apiResource('admin/flights', FlightController::class)->except(['index', 'show']);
    
    Route::get('/admin/dashboard', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Bienvenue dans le tableau de bord Admin.'
        ]);
    });
});
