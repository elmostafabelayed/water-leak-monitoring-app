<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WaterReading;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WaterReading>
 */
class SensorReadingFactory extends Factory
{
    protected $model = WaterReading::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'flow_rate' => fake()->randomFloat(2, 0.5, 8.5),
            'pressure' => fake()->randomFloat(1, 55, 70),
            'temperature' => fake()->randomFloat(1, 18, 28),
            'valve_status' => fake()->randomElement(['open', 'closed']),
            'is_leak' => fake()->boolean(5),
            'battery_level' => fake()->numberBetween(60, 100),
            'signal_strength' => fake()->numberBetween(-72, -45),
            'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'updated_at' => now(),
        ];
    }
}
