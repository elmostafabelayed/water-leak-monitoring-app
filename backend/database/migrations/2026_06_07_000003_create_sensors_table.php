<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sensors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('location')->nullable();
            $table->float('last_reading')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->unsignedBigInteger('uptime_seconds')->nullable();
            $table->integer('signal')->nullable();
            $table->integer('battery')->nullable();
            $table->string('firmware')->nullable();
            $table->string('ssid')->nullable();
            $table->string('node_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensors');
    }
};

