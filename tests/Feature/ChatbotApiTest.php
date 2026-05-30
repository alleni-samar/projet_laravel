<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChatbotApiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function test_chatbot_returns_response_from_gemini_mock()
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [[
                    'content' => ['parts' => [['text' => 'Vol pour Paris à 10h.']]]
                ]]
            ], 200),
        ]);

        $user = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/api/chatbot', [
            'message' => 'Vols pour Paris demain',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['reply'])
                 ->assertJsonPath('reply', 'Vol pour Paris à 10h.');
    }

    /** @test */
    public function test_chatbot_handles_gemini_api_failure()
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([], 500),
        ]);

        $user = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/api/chatbot', [
            'message' => 'Bonjour',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('reply', 'Désolé, je rencontre une difficulté technique pour me connecter à mon intelligence artificielle. Veuillez réessayer dans quelques instants.');
    }

    /** @test */
    public function test_unauthenticated_user_cannot_use_chatbot()
    {
        $response = $this->postJson('/api/chatbot', ['message' => 'Bonjour']);
        $response->assertStatus(401);
    }
}