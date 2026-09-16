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
        Schema::create('store_setting', function (Blueprint $table) {
            $table->id();
            $table->integer('tenant_id');
            $table->integer('outlet_id');
            $table->string('store_name');
            $table->string('logo_path')->nullable();
            $table->string('address_header');
            $table->string('phone');
            $table->string('footer_receipt_notes')->nullable();
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->boolean('enable_tax')->default(false);
            $table->enum('paper_size', ['58mm', '80mm'])->default('58mm');
            $table->boolean('auto_print_receipt')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_setting');
    }
};
