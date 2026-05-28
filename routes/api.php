<?php

use App\Http\Controllers\API\AuthController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées par authentification (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    // Route réservée aux utilisateurs connectés simples
    Route::get('/user/dashboard', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Bienvenue dans votre tableau de bord Utilisateur.'
        ]);
    });
});

// Routes protégées par authentification ET par rôle admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Bienvenue dans le tableau de bord Admin.'
        ]);
    });
});
