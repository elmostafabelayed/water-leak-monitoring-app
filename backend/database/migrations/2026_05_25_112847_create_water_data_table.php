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
            $table->string('device_id')->nullable();
            $table->float('flow_rate');
            $table->float('total_liters');
            $table->string('status')->default('normal');
            $table->boolean('valve_open')->default(true);
            $table->string('mode')->default('auto');
            $table->boolean('leak_detected')->default(false);
            $table->boolean('force_notify')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('water_data');
    }
};
