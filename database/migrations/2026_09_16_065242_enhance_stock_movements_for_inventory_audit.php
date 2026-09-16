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
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('stock_adjustment_id')->nullable()->after('id')->constrained('stock_adjustments')->nullOnDelete();
            $table->integer('stock_before')->default(0)->after('quantity');
            $table->integer('stock_after')->default(0)->after('stock_before');
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            Schema::table('stock_movements', function (Blueprint $table) {
                $table->enum('type', ['in', 'out', 'adjustment', 'sale', 'sale_void','opname'])->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['stock_adjustment_id']);
            $table->dropColumn(['stock_adjustment_id', 'stock_before', 'stock_after']);
        });
    }
};
