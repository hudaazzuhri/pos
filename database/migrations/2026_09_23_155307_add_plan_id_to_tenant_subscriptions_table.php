<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('tenant_subscriptions', 'plan_id')) {
            Schema::table('tenant_subscriptions', function (Blueprint $table): void {
                $table->foreignId('plan_id')->nullable()->after('tenant_id')->constrained()->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('tenant_subscriptions', 'plan_id')) {
            Schema::table('tenant_subscriptions', function (Blueprint $table): void {
                $table->dropForeign(['plan_id']);
                $table->dropColumn('plan_id');
            });
        }
    }
};
