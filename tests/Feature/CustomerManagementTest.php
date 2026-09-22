<?php

use App\Models\Customer;
use App\Models\Tenant;
use App\Models\User;

function createCustomerTestUser(string $name = 'Customer Test Tenant'): User
{
    $tenant = Tenant::forceCreate([
        'name' => $name,
        'status' => 'active',
    ]);

    return User::factory()->create([
        'tenant_id' => $tenant->id,
        'role' => 'owner',
    ]);
}

it('creates, updates, and deletes a tenant-scoped customer', function () {
    $owner = createCustomerTestUser();

    $response = $this->actingAs($owner)->post(route('customers.store'), [
        'name' => 'Pelanggan Baru',
        'phone' => '08123456789',
    ]);

    $response->assertRedirect(route('customers.index'));
    $customer = Customer::withoutGlobalScopes()->where('name', 'Pelanggan Baru')->firstOrFail();
    expect($customer->tenant_id)->toBe($owner->tenant_id);

    $this->actingAs($owner)->put(route('customers.update', $customer), [
        'name' => 'Pelanggan Diperbarui',
        'phone' => '08987654321',
    ])->assertRedirect(route('customers.index'));

    expect($customer->fresh()->name)->toBe('Pelanggan Diperbarui');
    expect($customer->fresh()->phone)->toBe('08987654321');

    $this->actingAs($owner)->delete(route('customers.destroy', $customer))
        ->assertRedirect(route('customers.index'));

    expect(Customer::withoutGlobalScopes()->whereKey($customer->id)->exists())->toBeFalse();
});

it('keeps customer search tenant scoped', function () {
    $owner = createCustomerTestUser();
    $otherOwner = createCustomerTestUser('Other Customer Tenant');

    Customer::forceCreate([
        'tenant_id' => $owner->tenant_id,
        'name' => 'Pelanggan Tenant Utama',
        'phone' => '08000000001',
    ]);
    Customer::forceCreate([
        'tenant_id' => $otherOwner->tenant_id,
        'name' => 'Pelanggan Tenant Lain',
        'phone' => '08000000002',
    ]);

    $response = $this->actingAs($owner)->get(route('customers.index', ['search' => 'Pelanggan']));

    $response->assertInertia(fn ($page) => $page
        ->component('Customers/Index')
        ->has('customers.data', 1)
        ->where('customers.data.0.name', 'Pelanggan Tenant Utama'));
});
