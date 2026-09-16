<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('store_setting', function (Blueprint $table) {
            $table->unique(['tenant_id', 'outlet_id'], 'store_setting_tenant_outlet_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_setting', function (Blueprint $table) {
            $table->dropUnique('store_setting_tenant_outlet_unique');
        });
    }
};
