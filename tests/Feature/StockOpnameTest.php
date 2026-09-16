<?php

use App\Models\Outlet;
use App\Models\Product;
use App\Models\StockOpname;
use App\Models\Tenant;
use App\Models\User;

function createOpnameTestContext(): array
{
    $tenant = Tenant::forceCreate([
        'name' => 'Opname Test Tenant',
        'status' => 'active',
    ]);
    $outlet = Outlet::forceCreate([
        'tenant_id' => $tenant->id,
        'name' => 'Outlet Opname',
        'is_main' => true,
    ]);
    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'outlet_id' => $outlet->id,
        'role' => 'owner',
    ]);

    return [$tenant, $outlet, $user];
}

it('creates a draft and approves physical stock into the system', function () {
    [, $outlet, $user] = createOpnameTestContext();
    $product = Product::create([
        'tenant_id' => $user->tenant_id,
        'name' => 'Produk Opname',
        'stock' => 10,
        'buy_price' => 2500,
    ]);

    $createResponse = $this->actingAs($user)->post(route('stock.opname.store'), [
        'notes' => 'Opname akhir bulan',
        'items' => [[
            'product_id' => $product->id,
            'physical_stock' => 8,
            'notes' => 'Dua barang rusak',
        ]],
    ]);

    $opname = StockOpname::query()->firstOrFail();
    $createResponse->assertRedirect(route('stock.opname.show', $opname));
    expect($opname->status)->toBe('draft');
    expect($opname->details()->first()->difference)->toBe(-2);

    $approveResponse = $this->actingAs($user)->post(route('stock.opname.adjust', $opname));

    $approveResponse->assertRedirect(route('stock.opname.show', $opname));
    expect($product->refresh()->stock)->toBe(8);
    expect($opname->refresh()->status)->toBe('completed');
    expect($opname->completed_at)->not->toBeNull();
    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => 'opname',
        'quantity' => -2,
        'stock_before' => 10,
        'stock_after' => 8,
        'outlet_id' => $outlet->id,
    ]);
});

it('does not expose an opname from another tenant', function () {
    [, , $user] = createOpnameTestContext();
    [$otherTenant, $otherOutlet, $otherUser] = createOpnameTestContext();
    $opname = StockOpname::forceCreate([
        'tenant_id' => $otherTenant->id,
        'outlet_id' => $otherOutlet->id,
        'user_id' => $otherUser->id,
        'opname_number' => 'SOP-OTHER-001',
        'status' => 'draft',
    ]);

    $this->actingAs($user)->get(route('stock.opname.show', $opname))->assertNotFound();
});
