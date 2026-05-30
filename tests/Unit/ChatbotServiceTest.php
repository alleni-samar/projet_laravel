<?php

namespace Tests\Unit;

use App\Services\ChatbotService;
use App\Models\User;
use Tests\TestCase;

class ChatbotServiceTest extends TestCase
{
    /** @test */
    public function test_it_builds_system_prompt_with_context_data()
    {
        $service = new ChatbotService();
        $reflection = new \ReflectionMethod($service, 'buildSystemPrompt');
        $reflection->setAccessible(true);

        $data = ['available_flights' => [['flight_number' => 'AF-1042', 'departure_city' => 'Paris']]];
        $user = User::factory()->make(['name' => 'Jean Dupont']);

        $prompt = $reflection->invoke($service, $data, $user);

        $this->assertStringContainsString('AF-1042', $prompt);
        $this->assertStringContainsString('Paris', $prompt);
        $this->assertStringContainsString('Jean Dupont', $prompt);
    }
}