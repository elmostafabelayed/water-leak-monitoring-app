<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('water_readings', function (Blueprint $table) {
            $table->float('temperature')->nullable()->after('pressure');
            $table->string('valve_status')->default('open')->after('temperature');
        });
    }

    public function down(): void
    {
        Schema::table('water_readings', function (Blueprint $table) {
            $table->dropColumn(['temperature', 'valve_status']);
        });
    }
};
