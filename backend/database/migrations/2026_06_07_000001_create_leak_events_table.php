<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leak_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('severity', ['low', 'medium', 'critical'])->default('medium');
            $table->float('flow_rate_detected');
            $table->string('location');
            $table->boolean('auto_closed')->default(true);
            $table->unsignedInteger('response_time_ms')->default(1500);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leak_events');
    }
};
