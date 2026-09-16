<?php

use App\Models\Outlet;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

function createStockTestContext(): array
{
    $tenant = Tenant::forceCreate([
        'name' => 'Stock Test Tenant',
        'status' => 'active',
    ]);
    $outlet = Outlet::forceCreate([
        'tenant_id' => $tenant->id,
        'name' => 'Outlet Utama',
        'is_main' => true,
    ]);
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'outlet_id' => $outlet->id,
        'role' => 'owner',
    ]);

    return [$tenant, $outlet, $user];
}

it('stores a multi-item adjustment and its movement snapshots', function () {
    [, $outlet, $user] = createStockTestContext();
    $firstProduct = Product::create([
        'tenant_id' => $user->tenant_id,
        'name' => 'Kopi',
        'stock' => 10,
    ]);
    $secondProduct = Product::create([
        'tenant_id' => $user->tenant_id,
        'name' => 'Teh',
        'stock' => 4,
    ]);

    $response = $this->actingAs($user)->post(route('stock.adjustments.store'), [
        'type' => 'addition',
        'notes' => 'Kulakan supplier',
        'items' => [
            ['product_id' => $firstProduct->id, 'quantity' => 5],
            ['product_id' => $secondProduct->id, 'quantity' => 3],
        ],
    ]);

    $response->assertRedirect(route('stock.index'));
    expect($firstProduct->refresh()->stock)->toBe(15);
    expect($secondProduct->refresh()->stock)->toBe(7);

    $this->assertDatabaseHas('stock_adjustments', [
        'tenant_id' => $user->tenant_id,
        'outlet_id' => $outlet->id,
        'type' => 'addition',
        'total_items' => 2,
    ]);
    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $firstProduct->id,
        'quantity' => 5,
        'stock_before' => 10,
        'stock_after' => 15,
        'type' => 'adjustment',
    ]);
});

it('rejects products from another tenant', function () {
    [, , $user] = createStockTestContext();
    $otherTenant = Tenant::forceCreate(['name' => 'Other Tenant', 'status' => 'active']);
    $otherProduct = Product::create([
        'tenant_id' => $otherTenant->id,
        'name' => 'Produk Tenant Lain',
        'stock' => 10,
    ]);

    $response = $this->actingAs($user)->post(route('stock.adjustments.store'), [
        'type' => 'addition',
        'items' => [['product_id' => $otherProduct->id, 'quantity' => 5]],
    ]);

    $response->assertSessionHasErrors('items.0.product_id');
    expect($otherProduct->refresh()->stock)->toBe(10);
    expect(DB::table('stock_adjustments')->count())->toBe(0);
});
