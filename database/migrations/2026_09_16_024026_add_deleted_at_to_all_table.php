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
        Schema::table('cash_movements', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable();
        });
        Schema::table('cashier_shifts', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });

        Schema::table('discounts', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });
        Schema::table('discount_products', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });

        Schema::table('outlets', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });
        Schema::table('product_variants', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });
        Schema::table('tenant_subscriptions', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_movements', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
        Schema::table('cashier_shifts', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });

        Schema::table('discounts', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
        Schema::table('discount_products', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });

        Schema::table('outlets', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
        Schema::table('product_variants', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
        Schema::table('tenant_subscriptions', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->dropColumn('deleted_at');
        });
    }
};
