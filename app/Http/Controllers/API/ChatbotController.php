<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\ChatbotService;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class ChatbotController extends Controller
{
    protected ChatbotService $chatbotService;

    /**
     * Inject ChatbotService.
     */
    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Handle incoming chatbot messages.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function ask(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        try {
            $user = $request->user();
            $message = $request->input('message');

            // 1. Enregistrer le message de l'utilisateur en base de données
            $userMessage = $user->chatMessages()->create([
                'role' => 'user',
                'message' => $message,
            ]);

            // 2. Récupérer l'historique récent (10 derniers messages avant celui-ci)
            $dbHistory = $user->chatMessages()
                ->where('id', '<', $userMessage->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->reverse()
                ->map(function ($msg) {
                    return [
                        'role' => $msg->role,
                        'message' => $msg->message
                    ];
                })
                ->toArray();

            // 3. Envoyer à Gemini avec l'historique de la DB
            $reply = $this->chatbotService->ask($message, $dbHistory, $user);

            // 4. Enregistrer la réponse du bot en base de données
            $user->chatMessages()->create([
                'role' => 'bot',
                'message' => $reply,
            ]);

            return response()->json([
                'status' => 'success',
                'reply' => $reply
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors du traitement de votre message.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get chatbot history for the authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getHistory(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $history = $user->chatMessages()
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($msg) {
                    return [
                        'role' => $msg->role,
                        'message' => $msg->message,
                        'timestamp' => $msg->created_at->toIso8601String()
                    ];
                });

            return response()->json([
                'status' => 'success',
                'history' => $history
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => "Impossible de charger l'historique.",
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear chatbot history for the authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function clearHistory(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $user->chatMessages()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Historique de discussion effacé avec succès.'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => "Impossible de supprimer l'historique.",
                'details' => $e->getMessage()
            ], 500);
        }
    }
}

