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
        if (! Schema::hasColumn('plans', 'audit_retention_days')) {
            Schema::table('plans', function (Blueprint $table): void {
                $table->unsignedInteger('audit_retention_days')->default(30)->after('max_products');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('plans', 'audit_retention_days')) {
            Schema::table('plans', function (Blueprint $table): void {
                $table->dropColumn('audit_retention_days');
            });
        }
    }
};
