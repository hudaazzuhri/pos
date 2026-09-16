<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PosStarterSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // ----------------------------------------------------
            // 1. DUMMY TENANT & SUBSCRIPTION
            // ----------------------------------------------------
            $tenant = Tenant::create([
                'name' => 'Kopi Kenangan UMKM',
                'phone' => '081234567890',
                'address' => 'Jl. Raya Sudirman No. 45, Jakarta Selatan',
                'status' => 'active',
                'expired_at' => now()->addYear(),
            ]);

            TenantSubscription::create([
                'tenant_id' => $tenant->id,
                'package_name' => 'Pro Multi-Outlet',
                'amount' => 150000.00,
                'payment_status' => 'paid',
                'starts_at' => now(),
                'expires_at' => now()->addYear(),
            ]);

            // ----------------------------------------------------
            // 2. DUMMY OUTLETS / CABANG
            // ----------------------------------------------------
            $outletPusat = Outlet::create([
                'tenant_id' => $tenant->id,
                'name' => 'Cabang Utama (Sudirman)',
                'phone' => '081234567890',
                'address' => 'Jl. Raya Sudirman No. 45, Jakarta Selatan',
                'is_main' => true,
            ]);

            $outletCabang = Outlet::create([
                'tenant_id' => $tenant->id,
                'name' => 'Cabang Tebet',
                'phone' => '081298765432',
                'address' => 'Jl. Tebet Raya No. 12, Jakarta Selatan',
                'is_main' => false,
            ]);

            // ----------------------------------------------------
            // 3. DUMMY USERS (Owner, Manager, & Cashier)
            // ----------------------------------------------------
            // Password default: password123 | PIN Void: 123456
            $owner = User::create([
                'tenant_id' => $tenant->id,
                'outlet_id' => $outletPusat->id,
                'name' => 'Budi Owner',
                'username' => 'owner',
                'email' => 'owner@pos.test',
                'password' => Hash::make('password123'),
                'pin' => Hash::make('123456'),
                'role' => 'owner',
            ]);

            $cashier = User::create([
                'tenant_id' => $tenant->id,
                'outlet_id' => $outletPusat->id,
                'name' => 'Siti Kasir',
                'username' => 'kasir',
                'email' => 'kasir@pos.test',
                'password' => Hash::make('password123'),
                'role' => 'cashier',
            ]);

            // ----------------------------------------------------
            // 4. DUMMY CATEGORIES
            // ----------------------------------------------------
            $catCoffee = Category::create([
                'tenant_id' => $tenant->id,
                'name' => 'Coffee',
            ]);

            $catNonCoffee = Category::create([
                'tenant_id' => $tenant->id,
                'name' => 'Non-Coffee',
            ]);

            $catSnack = Category::create([
                'tenant_id' => $tenant->id,
                'name' => 'Snack & Pastry',
            ]);

            // ----------------------------------------------------
            // 5. DUMMY PRODUCTS & VARIANTS
            // ----------------------------------------------------
            // Produk 1: Menggunakan Varian
            $prodKopiSusul = Product::create([
                'tenant_id' => $tenant->id,
                'category_id' => $catCoffee->id,
                'sku' => 'COF-001',
                'barcode' => '8991001001',
                'name' => 'Kopi Susu Gula Aren',
                'buy_price' => 8000.00,
                'sell_price' => 18000.00,
                'stock' => 100, // Aggregate stock
                'is_active' => true,
            ]);

            $varReg = ProductVariant::create([
                'tenant_id' => $tenant->id,
                'product_id' => $prodKopiSusul->id,
                'name' => 'Regular (250ml)',
                'sku' => 'COF-001-REG',
                'buy_price' => 7000.00,
                'sell_price' => 15000.00,
                'stock' => 60,
            ]);

            $varLarge = ProductVariant::create([
                'tenant_id' => $tenant->id,
                'product_id' => $prodKopiSusul->id,
                'name' => 'Large (500ml)',
                'sku' => 'COF-001-LRG',
                'buy_price' => 10000.00,
                'sell_price' => 22000.00,
                'stock' => 40,
            ]);

            // Produk 2: Tanpa Varian (Single Product)
            $prodCroissant = Product::create([
                'tenant_id' => $tenant->id,
                'category_id' => $catSnack->id,
                'sku' => 'SNK-001',
                'barcode' => '8991001002',
                'name' => 'Butter Croissant',
                'buy_price' => 12000.00,
                'sell_price' => 25000.00,
                'stock' => 30,
                'is_active' => true,
            ]);

            // Catat Stok Awal di Mutasi
            StockMovement::create([
                'tenant_id' => $tenant->id,
                'outlet_id' => $outletPusat->id,
                'product_id' => $prodCroissant->id,
                'user_id' => $owner->id,
                'type' => 'in',
                'quantity' => 30,
                'reference_number' => 'INITIAL-STOCK',
                'notes' => 'Stok awal pembukaan toko',
            ]);

            // ----------------------------------------------------
            // 6. DUMMY CUSTOMER
            // ----------------------------------------------------
            $customer = Customer::create([
                'tenant_id' => $tenant->id,
                'name' => 'Andi Wijaya',
                'phone' => '085711223344',
            ]);

            // ----------------------------------------------------
            // 7. DUMMY TRANSAKSI PENJUALAN
            // ----------------------------------------------------
            $trx = Transaction::create([
                'tenant_id' => $tenant->id,
                'outlet_id' => $outletPusat->id,
                'user_id' => $cashier->id,
                'customer_id' => $customer->id,
                'invoice_number' => 'INV-'.date('Ymd').'-0001',
                'subtotal' => 40000.00,
                'discount_amount' => 5000.00,
                'tax_amount' => 0.00,
                'total_amount' => 35000.00,
                'paid_amount' => 50000.00,
                'change_amount' => 15000.00,
                'payment_method' => 'cash',
                'status' => 'completed',
            ]);

            // Item 1 Transaksi (Kopi Varian Large)
            TransactionDetail::create([
                'tenant_id' => $tenant->id,
                'transaction_id' => $trx->id,
                'product_id' => $prodKopiSusul->id,
                'product_variant_id' => $varLarge->id,
                'product_name' => $prodKopiSusul->name,
                'variant_name' => $varLarge->name,
                'buy_price' => $varLarge->buy_price,
                'sell_price' => $varLarge->sell_price,
                'quantity' => 1,
                'subtotal' => 22000.00,
            ]);

            // Item 2 Transaksi (Croissant)
            TransactionDetail::create([
                'tenant_id' => $tenant->id,
                'transaction_id' => $trx->id,
                'product_id' => $prodCroissant->id,
                'product_name' => $prodCroissant->name,
                'buy_price' => $prodCroissant->buy_price,
                'sell_price' => $prodCroissant->sell_price,
                'quantity' => 1,
                'subtotal' => 25000.00,
            ]);

            // Potong Stok Karena Transaksi
            $prodCroissant->decrement('stock', 1);
            $varLarge->decrement('stock', 1);

            StockMovement::create([
                'tenant_id' => $tenant->id,
                'outlet_id' => $outletPusat->id,
                'product_id' => $prodCroissant->id,
                'user_id' => $cashier->id,
                'type' => 'sale',
                'quantity' => -1,
                'reference_number' => $trx->invoice_number,
                'notes' => 'Penjualan Kasir',
            ]);
        });
    }
}
