<?php

use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;

it('records tenant-scoped model changes and renders the audit log', function () {
    $tenant = Tenant::forceCreate(['name' => 'Audit Tenant', 'status' => 'active']);
    $owner = User::factory()->create([
        'tenant_id' => $tenant->id,
        'role' => 'owner',
    ]);

    $this->actingAs($owner);
    $product = Product::forceCreate([
        'tenant_id' => $tenant->id,
        'name' => 'Produk Audit',
        'sku' => 'AUDIT-001',
        'buy_price' => 1000,
        'sell_price' => 1500,
        'stock' => 10,
        'is_active' => true,
    ]);

    $product->update(['sell_price' => 1750]);

    $activity = Activity::query()->where('tenant_id', $tenant->id)->latest('id')->firstOrFail();

    expect($activity->log_name)->toBe('products')
        ->and($activity->event)->toBe('updated')
        ->and($activity->properties->get('old')['sell_price'])->toBe(1500)
        ->and($activity->properties->get('attributes')['sell_price'])->toBe(1750);

    $response = $this->get(route('audit-logs.index'));

    $response->assertInertia(fn ($page) => $page
        ->component('AuditLogs/Index')
        ->has('logs.data', 3));
});

it('prevents managers from viewing another tenant audit log', function () {
    $tenant = Tenant::forceCreate(['name' => 'Private Audit Tenant', 'status' => 'active']);
    $manager = User::factory()->create(['tenant_id' => $tenant->id, 'role' => 'manager']);

    $otherTenant = Tenant::forceCreate(['name' => 'Other Audit Tenant', 'status' => 'active']);
    User::factory()->create(['tenant_id' => $otherTenant->id, 'role' => 'owner']);

    $this->actingAs($manager)
        ->get(route('audit-logs.index'))
        ->assertInertia(fn ($page) => $page->where('logs.data.0.causer', null)->has('logs.data', 1));
});
