<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RetailProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil Tenant dan Outlet Pertama (Atau sesuaikan ID-nya)
        $tenant = Tenant::first() ?? Tenant::factory()->create(['name' => 'Toko Retail Utama']);
        $outlet = Outlet::first() ?? Outlet::factory()->create(['tenant_id' => $tenant->id, 'name' => 'Cabang Pusat']);

        // Data Kategori Retail & Produk
        $categoriesWithProducts = [
            'Makanan Ringan & Snack' => [
                ['name' => 'Indomie Goreng Spesial 85g', 'buy_price' => 2800, 'sell_price' => 3500],
                ['name' => 'Indomie Kuah Ayam Bawang 75g', 'buy_price' => 2700, 'sell_price' => 3300],
                ['name' => 'Indomie Kuah Soto Mie 75g', 'buy_price' => 2700, 'sell_price' => 3300],
                ['name' => 'Pop Mie Rasa Ayam 75g', 'buy_price' => 4500, 'sell_price' => 5500],
                ['name' => 'Chitato Sapi Panggang 68g', 'buy_price' => 9500, 'sell_price' => 11500],
                ['name' => 'Lays Rumput Laut 68g', 'buy_price' => 9500, 'sell_price' => 11500],
                ['name' => 'Taro Net Seaweed 36g', 'buy_price' => 4000, 'sell_price' => 5000],
                ['name' => 'Chiki Ball Keju 55g', 'buy_price' => 4500, 'sell_price' => 5500],
                ['name' => 'Kusuka Keripik Singkong Balado 60g', 'buy_price' => 5000, 'sell_price' => 6500],
                ['name' => 'Oreo Vanilla Roll 123.5g', 'buy_price' => 8000, 'sell_price' => 10000],
                ['name' => 'Roma Kelapa Biscuit 300g', 'buy_price' => 10500, 'sell_price' => 13000],
                ['name' => 'Beng Beng Chocolate Wafer 20g', 'buy_price' => 2000, 'sell_price' => 2500],
                ['name' => 'Silverqueen Milk Chocolate 58g', 'buy_price' => 13500, 'sell_price' => 16500],
                ['name' => 'Dilan Chocolate Crunchy Caramel 24g', 'buy_price' => 1800, 'sell_price' => 2500],
                ['name' => 'Roti Aoka Rasa Cokelat 65g', 'buy_price' => 2000, 'sell_price' => 3000],
            ],
            'Minuman Kemasan' => [
                ['name' => 'Aqua Air Mineral Botol 600ml', 'buy_price' => 2500, 'sell_price' => 3500],
                ['name' => 'Aqua Air Mineral Botol 1500ml', 'buy_price' => 5000, 'sell_price' => 6500],
                ['name' => 'Le Minerale Botol 600ml', 'buy_price' => 2300, 'sell_price' => 3500],
                ['name' => 'Teh Botol Sosro Original 450ml', 'buy_price' => 3800, 'sell_price' => 5000],
                ['name' => 'Teh Pucuk Harum 350ml', 'buy_price' => 2800, 'sell_price' => 4000],
                ['name' => 'Ichitan Thai Milk Tea 310ml', 'buy_price' => 6500, 'sell_price' => 8500],
                ['name' => 'Coca Cola Kaleng 330ml', 'buy_price' => 5000, 'sell_price' => 6500],
                ['name' => 'Sprite Kaleng 330ml', 'buy_price' => 5000, 'sell_price' => 6500],
                ['name' => 'Fanta Strawberry Kaleng 330ml', 'buy_price' => 5000, 'sell_price' => 6500],
                ['name' => 'Pocari Sweat Botol 500ml', 'buy_price' => 6500, 'sell_price' => 8000],
                ['name' => 'Ultra Milk Milk Chocolate 250ml', 'buy_price' => 5500, 'sell_price' => 7000],
                ['name' => 'Bear Brand Susu Steril 189ml', 'buy_price' => 9200, 'sell_price' => 10500],
                ['name' => 'Good Day Mocacinno Botol 250ml', 'buy_price' => 5500, 'sell_price' => 7000],
                ['name' => 'Nescafé Latte Kaleng 220ml', 'buy_price' => 6000, 'sell_price' => 7500],
                ['name' => 'You C1000 Lemon 140ml', 'buy_price' => 6500, 'sell_price' => 8000],
            ],
            'Sembako & Bumbu Dapur' => [
                ['name' => 'Minyak Goreng Bimoli Refill 1L', 'buy_price' => 16000, 'sell_price' => 19000],
                ['name' => 'Minyak Goreng SunCo Refill 2L', 'buy_price' => 32000, 'sell_price' => 37000],
                ['name' => 'Gula Pasir Gulaku Hijau 1kg', 'buy_price' => 14500, 'sell_price' => 17000],
                ['name' => 'Beras Pandan Wangi Super 5kg', 'buy_price' => 68000, 'sell_price' => 78000],
                ['name' => 'Tepung Terigu Segitiga Biru 1kg', 'buy_price' => 10500, 'sell_price' => 12500],
                ['name' => 'Garam Cap Kapal 250g', 'buy_price' => 2000, 'sell_price' => 3000],
                ['name' => 'Kecap Manis Bango Pouch 520ml', 'buy_price' => 21000, 'sell_price' => 25000],
                ['name' => 'Saus Sambal ABC Botol 275ml', 'buy_price' => 11000, 'sell_price' => 13500],
                ['name' => 'Masako Rasa Ayam Sachet 10g (Paket 10)', 'buy_price' => 4500, 'sell_price' => 5500],
                ['name' => 'Royco Rasa Sapi Sachet 10g (Paket 10)', 'buy_price' => 4500, 'sell_price' => 5500],
                ['name' => 'Sasa Micin MSG 250g', 'buy_price' => 10000, 'sell_price' => 12000],
                ['name' => 'Mentega Blue Band Pouch 200g', 'buy_price' => 8500, 'sell_price' => 10500],
                ['name' => 'Susu Kental Manis Frisian Flag Pouch 560g', 'buy_price' => 15000, 'sell_price' => 18000],
                ['name' => 'Santan Kelapa Sun Kara 65ml', 'buy_price' => 2800, 'sell_price' => 3500],
                ['name' => 'Sarden ABC Cabai Botol/Kaleng 155g', 'buy_price' => 8500, 'sell_price' => 10500],
            ],
            'Perawatan Diri & Mandi' => [
                ['name' => 'Sabun Mandi Lifebuoy Red 110g', 'buy_price' => 3500, 'sell_price' => 4500],
                ['name' => 'Sabun Cair Biore Guard Refill 450ml', 'buy_price' => 20000, 'sell_price' => 24500],
                ['name' => 'Shampoo Clear Ice Cool Menthol 160ml', 'buy_price' => 21000, 'sell_price' => 25000],
                ['name' => 'Shampoo Sunsilk Black Shine 160ml', 'buy_price' => 18000, 'sell_price' => 22000],
                ['name' => 'Pasta Gigi Pepsodent White 190g', 'buy_price' => 10000, 'sell_price' => 12500],
                ['name' => 'Sikat Gigi Formula Double Action', 'buy_price' => 4000, 'sell_price' => 5500],
                ['name' => 'Pencuci Muka Biore Men Cool Oil 100g', 'buy_price' => 26000, 'sell_price' => 31000],
                ['name' => 'Garnier Micellar Water Pink 125ml', 'buy_price' => 27000, 'sell_price' => 33000],
                ['name' => 'Handbody Vaseline Healthy Bright 200ml', 'buy_price' => 25000, 'sell_price' => 29500],
                ['name' => 'Deodorant Rexona Men Roll On 50ml', 'buy_price' => 15000, 'sell_price' => 18500],
                ['name' => 'Minyak Kayu Putih Cap Lang 60ml', 'buy_price' => 21000, 'sell_price' => 25000],
                ['name' => 'Parfum Bellagio Spray 100ml', 'buy_price' => 30000, 'sell_price' => 36000],
                ['name' => 'Tisu Paseo Soft Pack 250 sheets', 'buy_price' => 12000, 'sell_price' => 15000],
                ['name' => 'Kapas Kecantikan Selection 50g', 'buy_price' => 6000, 'sell_price' => 7500],
                ['name' => 'Charm Body Fit Extra Night 29cm 10s', 'buy_price' => 14000, 'sell_price' => 17000],
            ],
            'Kebutuhan Rumah Tangga' => [
                ['name' => 'Detergen Rinso Anti Noda Powder 770g', 'buy_price' => 18500, 'sell_price' => 22000],
                ['name' => 'Detergen Cair So Klin Liquid Refill 720ml', 'buy_price' => 14000, 'sell_price' => 16500],
                ['name' => 'Pewangi Molto All in 1 Refill 650ml', 'buy_price' => 15000, 'sell_price' => 18000],
                ['name' => 'Pencuci Piring Sunlight Lime Refill 650ml', 'buy_price' => 11000, 'sell_price' => 13500],
                ['name' => 'Pembersih Lantai Super Pell Apple 770ml', 'buy_price' => 12000, 'sell_price' => 14500],
                ['name' => 'Pembersih Kaca Cling Spray 440ml', 'buy_price' => 8000, 'sell_price' => 10000],
                ['name' => 'Kamper Bagus Naphthalene 150g', 'buy_price' => 13000, 'sell_price' => 16000],
                ['name' => 'Hit Obat Nyamuk Spray Lemon 600ml', 'buy_price' => 34000, 'sell_price' => 39000],
                ['name' => 'Spons Cuci Piring Scotch Brite 1s', 'buy_price' => 4500, 'sell_price' => 6000],
                ['name' => 'Kantong Plastik Sampah Hitam 60x80cm', 'buy_price' => 10000, 'sell_price' => 13000],
                ['name' => 'Wipol Karbol Cemara Refill 750ml', 'buy_price' => 14000, 'sell_price' => 17000],
                ['name' => 'Stella Pengharum Ruangan Spray 225ml', 'buy_price' => 18000, 'sell_price' => 22000],
                ['name' => 'Kawat Cuci Piring Stainless 1s', 'buy_price' => 3000, 'sell_price' => 4500],
                ['name' => 'Tissue Basah Mitu Baby 50s', 'buy_price' => 11000, 'sell_price' => 14000],
                ['name' => 'Mama Lemon Pencuci Piring Refill 680ml', 'buy_price' => 10500, 'sell_price' => 12500],
            ],
            'Alat Tulis & Kantor' => [
                ['name' => 'Pulpen Standard AE7 Hitam 0.5mm', 'buy_price' => 1800, 'sell_price' => 2500],
                ['name' => 'Pulpen Faster C600 Hitam', 'buy_price' => 2500, 'sell_price' => 3500],
                ['name' => 'Pensil 2B Faber-Castell', 'buy_price' => 3500, 'sell_price' => 4500],
                ['name' => 'Penghapus Joyko Hitam Besar', 'buy_price' => 1500, 'sell_price' => 2500],
                ['name' => 'Buku Tulis Sidu 38 Lembar (Pcs)', 'buy_price' => 3000, 'sell_price' => 4000],
                ['name' => 'Buku Gambar A4 Kiki', 'buy_price' => 4000, 'sell_price' => 5500],
                ['name' => 'Tip-Ex Kenko Fluid 12ml', 'buy_price' => 5000, 'sell_price' => 6500],
                ['name' => 'Penggaris Plastik Butterfly 30cm', 'buy_price' => 2500, 'sell_price' => 3500],
                ['name' => 'Lem Paper Glue Kenko 50ml', 'buy_price' => 3000, 'sell_price' => 4500],
                ['name' => 'Gunting Sedang Joyko', 'buy_price' => 6000, 'sell_price' => 8000],
                ['name' => 'Lakban Bening Daimaru 2 inch', 'buy_price' => 11000, 'sell_price' => 14000],
                ['name' => 'Double Tape Nachi 1/2 inch', 'buy_price' => 4000, 'sell_price' => 5500],
                ['name' => 'Map Snelhecter Plastik A4 Red', 'buy_price' => 2500, 'sell_price' => 3500],
                ['name' => 'Kertas A4 PaperOne 80gsm (Ream)', 'buy_price' => 45000, 'sell_price' => 52000],
            ],
            'Rokok & Produk Dewasa' => [
                ['name' => 'Sampoerna A Mild 16 Batang', 'buy_price' => 29500, 'sell_price' => 32000],
                ['name' => 'Gudang Garam Filter 12 Batang', 'buy_price' => 22000, 'sell_price' => 24000],
                ['name' => 'Djarum Super 12 Batang', 'buy_price' => 21500, 'sell_price' => 23500],
                ['name' => 'Marlboro Red 20 Batang', 'buy_price' => 38000, 'sell_price' => 41000],
                ['name' => 'Korek Api Gas Tokai Original', 'buy_price' => 2500, 'sell_price' => 3500],
            ],
        ];

        $productCount = 0;
        $barcodeBase = 899100100000; // Awalan Barcode EAN-13 Indonesia

        foreach ($categoriesWithProducts as $categoryName => $products) {
            // Buat atau cari Kategori
            $category = Category::firstOrCreate([
                'tenant_id' => $tenant->id,
                'name' => $categoryName,
            ]);

            foreach ($products as $item) {
                $productCount++;
                $generatedBarcode = (string) ($barcodeBase + $productCount);

                Product::create([
                    'tenant_id'        => $tenant->id,
                    'category_id'      => $category->id,
                    'name'             => $item['name'],
                    'sku'              => 'SKU-' . strtoupper(Str::random(6)),
                    'barcode'          => $generatedBarcode,
                    'buy_price'        => $item['buy_price'],
                    'sell_price'    => $item['sell_price'],
                    'stock'            => rand(15, 120), // Random stok siap jual
                    'min_stock_alert'  => 10,
                    'unit'             => 'pcs',
                    'is_active'        => true,
                ]);
            }
        }

        $this->command->info("Berhasil meng-generate {$productCount} produk retail!");
    }
}