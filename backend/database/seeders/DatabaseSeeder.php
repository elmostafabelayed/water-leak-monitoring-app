<?php

namespace Database\Seeders;

use App\Models\LeakEvent;
use App\Models\User;
use App\Models\WaterReading;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        WaterReading::factory()
            ->count(500)
            ->create(['user_id' => $user->id]);

        LeakEvent::factory()
            ->count(20)
            ->create(['user_id' => $user->id]);
    }
}
