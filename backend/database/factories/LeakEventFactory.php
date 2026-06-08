<?php

namespace Database\Factories;

use App\Models\LeakEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeakEvent>
 */
class LeakEventFactory extends Factory
{
    protected $model = LeakEvent::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'severity' => fake()->randomElement(['low', 'medium', 'critical']),
            'flow_rate_detected' => fake()->randomFloat(1, 25, 55),
            'location' => fake()->randomElement([
                'Kitchen',
                'Garden',
                'Bathroom',
                'Main Supply',
                'Basement',
            ]),
            'auto_closed' => true,
            'response_time_ms' => fake()->numberBetween(800, 3000),
            'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'updated_at' => now(),
        ];
    }
}
