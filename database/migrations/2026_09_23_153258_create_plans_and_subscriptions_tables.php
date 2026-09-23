<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel Daftar Paket
        if (! Schema::hasTable('plans')) {
            Schema::create('plans', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // Basic, Pro, Enterprise$table->string('slug')->unique();
                $table->decimal('price', 12, 2);
                $table->integer('max_outlets')->default(1);
                $table->integer('max_users')->default(2);
                $table->integer('max_monthly_transactions')->default(1000); // 0 = unlimited
                $table->integer('max_products')->default(300); // 0 = unlimited$table->integer('audit_log_retention_days')->default(30);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // Tabel Status Langganan Tenant
        if (! Schema::hasTable('tenant_subscriptions')) {
            Schema::create('tenant_subscriptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
                $table->foreignId('plan_id')->constrained();
                $table->enum('status', ['active', 'expired', 'cancelled', 'pending_payment'])->default('active');
                $table->dateTime('starts_at');
                $table->dateTime('ends_at');
                $table->string('payment_gateway_reference')->nullable(); // Invoice ID / Midtrans TRX ID$table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_subscriptions');
        Schema::dropIfExists('plans');
    }
};
