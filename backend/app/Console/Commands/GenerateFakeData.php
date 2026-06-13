<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Sensor;
use App\Models\WaterReading;
use App\Models\WaterData;
use App\Models\LeakEvent;
use App\Models\Alert;
use Carbon\Carbon;

class GenerateFakeData extends Command
{
    protected $signature = 'app:generate-fake-data';
    protected $description = 'Generate realistic fake data for testing the application dashboard and stats';

    public function handle()
    {
        $this->info('Generating fake data...');

        // 1. Get or create a default user
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User', 'password' => bcrypt('password')]
        );

        // 2. Get or create a sensor
        $sensor = Sensor::firstOrCreate(
            ['user_id' => $user->id],
            [
                'name' => 'Main ESP32 Sensor',
                'location' => 'Main Water Pipe',
                'status' => 'online',
                'node_id' => 'ESP32_TEST',
                'signal' => -45,
                'battery' => 88,
                'firmware' => 'v1.2.4',
                'uptime_seconds' => 86400 * 3,
                'last_seen_at' => now(),
                'last_reading' => 12.5,
            ]
        );

        // 3. Generate history data (last 30 days)
        $this->info('Generating 30 days of WaterReading history...');
        $now = now();
        $records = [];
        
        for ($i = 30; $i >= 0; $i--) {
            for ($hour = 0; $hour < 24; $hour += 4) { // Every 4 hours
                $date = (clone $now)->subDays($i)->setHour($hour)->setMinute(rand(0, 59));
                
                // simulate typical usage (higher in morning 6-9 and evening 18-21)
                $flowRate = rand(5, 15);
                if ($hour >= 6 && $hour <= 9) $flowRate = rand(15, 30);
                if ($hour >= 18 && $hour <= 21) $flowRate = rand(10, 25);
                
                $records[] = [
                    'user_id' => $user->id,
                    'sensor_id' => $sensor->id,
                    'flow_rate' => $flowRate,
                    'pressure' => 45.0 + (rand(-5, 5) / 10),
                    'is_leak' => false,
                    'valve_status' => 'open',
                    'created_at' => $date,
                    'updated_at' => $date,
                ];
            }
        }
        
        // Insert in chunks
        foreach (array_chunk($records, 100) as $chunk) {
            WaterReading::insert($chunk);
        }

        // 4. Generate some recent WaterData points to mimic ESP32
        $this->info('Generating recent WaterData points...');
        WaterData::create([
            'device_id' => 'ESP32_TEST',
            'flow_rate' => 12.5,
            'total_liters' => 5430.5,
            'status' => 'normal',
            'valve_open' => true,
            'mode' => 'auto',
            'leak_detected' => false,
            'created_at' => now()->subMinutes(10),
        ]);
        WaterData::create([
            'device_id' => 'ESP32_TEST',
            'flow_rate' => 13.0,
            'total_liters' => 5431.5,
            'status' => 'normal',
            'valve_open' => true,
            'mode' => 'auto',
            'leak_detected' => false,
            'created_at' => now(),
        ]);

        // 5. Generate a couple of alerts and leaks
        $this->info('Generating a recent leak event and alert...');
        $leakDate = now()->subDays(2);
        Alert::create([
            'user_id' => $user->id,
            'type' => 'LEAK_DETECTED',
            'severity' => 'CRITICAL',
            'description' => 'Une fuite mineure a été détectée dans le système et a été isolée.',
            'is_acknowledged' => false,
            'created_at' => $leakDate,
        ]);
        LeakEvent::create([
            'user_id' => $user->id,
            'location' => 'Main Water Pipe',
            'severity' => 'critical',
            'flow_rate_detected' => 45.5,
            'auto_closed' => true,
            'response_time_ms' => 1200,
            'created_at' => $leakDate,
        ]);

        $this->info('Fake data generated successfully!');
    }
}
