<?php

namespace App\Services;

use App\Models\Flight;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class ChatbotService
{
    /**
     * Ask the Gemini API a question, appending context from the database and history.
     *
     * @param string $userMessage
     * @param array $conversationHistory
     * @param User|null $user
     * @return string
     */
    public function ask(string $userMessage, array $conversationHistory = [], ?User $user = null): string
    {
        $apiKey = env('GEMINI_API_KEY');
        
        if (empty($apiKey)) {
            Log::warning("Gemini API key is not configured in .env");
            return "Désolé, le service de Chatbot n'est pas configuré actuellement. Veuillez ajouter la clé API GEMINI_API_KEY dans votre fichier .env.";
        }

        // 1. Analyze user message and fetch database context
        $dbData = $this->extractDataFromIntent($userMessage, $user);

        // 2. Build system instructions with database context
        $systemPrompt = $this->buildSystemPrompt($dbData, $user);

        // 3. Map conversation history and current message to Gemini contents format
        $contents = $this->formatContents($conversationHistory, $userMessage);

        try {
            // 4. Send request to Gemini API (using gemini-1.5-flash)
            $response = Http::withoutVerifying()->withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => $contents,
                'systemInstruction' => [
                    'parts' => [
                        ['text' => $systemPrompt]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 800,
                ]
            ]);

            if ($response->failed()) {
                Log::error("Gemini API request failed: " . $response->body());
                return "Désolé, je rencontre une difficulté technique pour me connecter à mon intelligence artificielle. Veuillez réessayer dans quelques instants.";
            }

            $result = $response->json();
            $replyText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

            if (empty($replyText)) {
                Log::warning("Gemini API returned an empty response: " . json_encode($result));
                return "Je n'ai pas pu générer de réponse. Pouvez-vous reformuler votre question ?";
            }

            return trim($replyText);

        } catch (Exception $e) {
            Log::error("Exception in ChatbotService: " . $e->getMessage());
            return "Une erreur est survenue lors de la communication avec le chatbot. Merci de réessayer plus tard.";
        }
    }

    /**
     * Parse the user message to extract intents and query DB data.
     *
     * @param string $message
     * @param User|null $user
     * @return array
     */
    private function extractDataFromIntent(string $message, ?User $user): array
    {
        $data = [];
        $messageLower = strtolower($message);

        // --- Intent 1: My reservations ---
        $isMyReservations = preg_match('/\b(mes|ma|mon)\s+(vols?|billets?|réservations?)\b/i', $messageLower) 
            || str_contains($messageLower, 'mes rsv') 
            || str_contains($messageLower, 'mes reservations');

        if ($isMyReservations) {
            if ($user) {
                $reservations = $user->reservations()->with('flight')->orderBy('created_at', 'desc')->get();
                $data['user_reservations'] = $reservations->map(function($res) {
                    return [
                        'reservation_number' => $res->reservation_number,
                        'flight_number' => $res->flight ? $res->flight->flight_number : 'Inconnu',
                        'departure_city' => $res->flight ? $res->flight->departure_city : 'Inconnue',
                        'arrival_city' => $res->flight ? $res->flight->arrival_city : 'Inconnue',
                        'departure_time' => $res->flight ? $res->flight->departure_time->format('d/m/Y H:i') : 'Inconnue',
                        'arrival_time' => $res->flight ? $res->flight->arrival_time->format('d/m/Y H:i') : 'Inconnue',
                        'seats_reserved' => $res->seats_count,
                        'total_price' => $res->total_price,
                        'status' => $res->status === 'confirmed' ? 'Confirmée' : 'Annulée'
                    ];
                })->toArray();
            } else {
                $data['user_reservations_error'] = "L'utilisateur n'est pas connecté.";
            }
        }

        // --- Intent 2: Most booked flight (Top selling) ---
        $isMostBooked = str_contains($messageLower, 'plus vendu') 
            || str_contains($messageLower, 'populaire') 
            || str_contains($messageLower, 'plus achete') 
            || str_contains($messageLower, 'plus acheté') 
            || str_contains($messageLower, 'meilleures ventes');

        if ($isMostBooked) {
            $popular = Reservation::select('flight_id', DB::raw('count(*) as booking_count'))
                ->where('status', 'confirmed')
                ->groupBy('flight_id')
                ->orderByDesc('booking_count')
                ->first();

            if ($popular) {
                $flight = Flight::find($popular->flight_id);
                if ($flight) {
                    $data['most_popular_flight'] = [
                        'flight_number' => $flight->flight_number,
                        'departure_city' => $flight->departure_city,
                        'arrival_city' => $flight->arrival_city,
                        'price' => $flight->price,
                        'available_seats' => $flight->available_seats,
                        'booking_count' => $popular->booking_count
                    ];
                }
            } else {
                $data['most_popular_flight_notice'] = "Aucune réservation confirmée pour le moment.";
            }
        }

        // --- Intent 3: Search flights by destination/origin/date ---
        // Retrieve list of unique cities in DB to match
        $allFlights = Flight::all();
        $cities = $allFlights->flatMap(fn($f) => [strtolower($f->departure_city), strtolower($f->arrival_city)])->unique()->toArray();
        
        $foundCity = null;
        foreach ($cities as $city) {
            if (preg_match('/\b' . preg_quote($city, '/') . '\b/i', $messageLower)) {
                $foundCity = $city;
                break;
            }
        }

        $isSearchFlights = str_contains($messageLower, 'vol') 
            || str_contains($messageLower, 'partir') 
            || str_contains($messageLower, 'voyage') 
            || str_contains($messageLower, 'aller') 
            || str_contains($messageLower, 'destinations')
            || $foundCity;

        if ($isSearchFlights) {
            $query = Flight::query();

            if ($foundCity) {
                $query->where(function($q) use ($foundCity) {
                    $q->where('arrival_city', 'like', "%{$foundCity}%")
                      ->orWhere('departure_city', 'like', "%{$foundCity}%");
                });
            }

            // Check if user specifies "demain" (tomorrow)
            if (str_contains($messageLower, 'demain')) {
                $query->whereDate('departure_time', now()->addDay()->toDateString());
                $data['search_date_context'] = "Demain (" . now()->addDay()->format('d/m/Y') . ")";
            } elseif (str_contains($messageLower, "aujourd'hui") || str_contains($messageLower, 'ce jour')) {
                $query->whereDate('departure_time', now()->toDateString());
                $data['search_date_context'] = "Aujourd'hui (" . now()->format('d/m/Y') . ")";
            }

            $flights = $query->orderBy('departure_time', 'asc')->limit(6)->get();
            
            if ($flights->isNotEmpty()) {
                $data['available_flights'] = $flights->map(function($f) {
                    return [
                        'flight_number' => $f->flight_number,
                        'departure_city' => $f->departure_city,
                        'arrival_city' => $f->arrival_city,
                        'departure_time' => $f->departure_time->format('d/m/Y H:i'),
                        'arrival_time' => $f->arrival_time->format('d/m/Y H:i'),
                        'price' => $f->price,
                        'available_seats' => $f->available_seats
                    ];
                })->toArray();
            } else {
                $data['flights_search_notice'] = "Aucun vol disponible ne correspond à cette destination ou date.";
            }
        }

        // --- Intent 4: Specific flight availability ---
        // Look for exact flight number (e.g. AF-1042 or AF1042) in message
        $foundFlightNumber = null;
        $messageClean = preg_replace('/[^a-z0-9]/i', '', $messageLower);
        foreach ($allFlights->pluck('flight_number')->unique() as $fn) {
            $fnClean = strtolower(preg_replace('/[^a-z0-9]/i', '', $fn));
            if (!empty($fnClean) && str_contains($messageClean, $fnClean)) {
                $foundFlightNumber = $fn;
                break;
            }
        }

        // If explicitly mentioning seats, dispo, or a flight number
        $isAvailabilityCheck = $foundFlightNumber 
            || str_contains($messageLower, 'dispo') 
            || str_contains($messageLower, 'place') 
            || str_contains($messageLower, 'siege') 
            || str_contains($messageLower, 'siège') 
            || str_contains($messageLower, 'libre');

        if ($isAvailabilityCheck) {
            if ($foundFlightNumber) {
                $flight = Flight::where('flight_number', $foundFlightNumber)->first();
            } else {
                // Default to the first flight matching the found city
                $flight = $foundCity ? Flight::where('arrival_city', 'like', "%{$foundCity}%")->first() : null;
            }

            if ($flight) {
                $data['flight_availability_detail'] = [
                    'flight_number' => $flight->flight_number,
                    'departure_city' => $flight->departure_city,
                    'arrival_city' => $flight->arrival_city,
                    'departure_time' => $flight->departure_time->format('d/m/Y H:i'),
                    'available_seats' => $flight->available_seats,
                    'total_seats' => $flight->total_seats,
                    'status' => $flight->available_seats === 0 ? 'Complet' : 'Places disponibles'
                ];
            }
        }

        return $data;
    }

    /**
     * Construct the virtual assistant prompt with DB context.
     *
     * @param array $dbData
     * @param User|null $user
     * @return string
     */
    private function buildSystemPrompt(array $dbData, ?User $user): string
    {
        $userName = $user ? $user->name : 'un client';
        
        $systemInstruction = "Tu es FlyHigh Bot, l'assistant virtuel IA officiel de la compagnie aérienne FlyHigh. 
Ton rôle est de répondre de façon polie, claire et engageante aux clients de FlyHigh.
Tu parles au nom de FlyHigh et tu t'adresses actuellement à {$userName}.

Voici les données en temps réel extraites de notre base de données pour t'aider à répondre à la requête de l'utilisateur :
" . json_encode($dbData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "

Directives importantes :
1. Utilise ces données pour fournir des réponses précises sur les réservations, les vols et les statistiques de FlyHigh.
2. Si l'utilisateur demande ses réservations, liste-les proprement avec leur statut et date. S'il n'en a pas, propose-lui d'en faire une.
3. Si l'utilisateur recherche des vols, présente-lui les vols disponibles pertinents de la liste (N° de vol, trajet, prix, date et heure de départ, places restantes).
4. S'il n'y a pas de données pertinentes dans l'extraction ou si les listes sont vides, explique poliment que nous n'avons aucun vol disponible ou aucune réservation correspondant à sa demande pour le moment.
5. Sois concis : évite les pavés de texte inutiles, écris des phrases fluides et bien structurées.
6. Ne mentionne JAMAIS que tu as reçu des données 'JSON' ou un 'contexte de base de données'. Présente les informations comme si tu y avais accès naturellement.
7. Reste professionnel, dynamique et réponds exclusivement en français.";

        return $systemInstruction;
    }

    /**
     * Map internal message format to Google Gemini API request body.
     *
     * @param array $history
     * @param string $currentMessage
     * @return array
     */
    private function formatContents(array $history, string $currentMessage): array
    {
        $contents = [];

        foreach ($history as $msg) {
            $role = (isset($msg['role']) && $msg['role'] === 'user') ? 'user' : 'model';
            $text = $msg['message'] ?? $msg['text'] ?? '';

            if (!empty($text)) {
                $contents[] = [
                    'role' => $role,
                    'parts' => [
                        ['text' => $text]
                    ]
                ];
            }
        }

        // Add the new message at the end
        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $currentMessage]
            ]
        ];

        return $contents;
    }
}
