<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('water_data', function (Blueprint $table) {
            $table->id();
            $table->float('flow_rate');
            $table->float('total_liters');
            $table->boolean('leak_detected')->default(false);
            $table->enum('valve_status', ['open', 'closed'])->default('open');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('water_data');
    }
};
