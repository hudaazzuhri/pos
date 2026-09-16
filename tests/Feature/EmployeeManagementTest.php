<?php

use App\Models\Outlet;
use App\Models\Tenant;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

function createEmployeeTestContext(int $maxUsers = 10): array
{
    $tenant = Tenant::forceCreate([
        'name' => 'Employee Test Tenant',
        'status' => 'active',
    ]);
    $outlet = Outlet::forceCreate([
        'tenant_id' => $tenant->id,
        'name' => 'Outlet Employee Test',
        'is_main' => true,
    ]);
    TenantSubscription::forceCreate([
        'tenant_id' => $tenant->id,
        'package_name' => 'Test Plan',
        'max_users' => $maxUsers,
        'amount' => 100000,
        'payment_status' => 'paid',
        'starts_at' => now()->subDay(),
        'expires_at' => now()->addMonth(),
    ]);
    $owner = User::factory()->create([
        'tenant_id' => $tenant->id,
        'outlet_id' => $outlet->id,
        'role' => 'owner',
    ]);

    return [$tenant, $outlet, $owner];
}

it('creates a tenant-scoped employee with hashed credentials', function () {
    [, $outlet, $owner] = createEmployeeTestContext();

    $response = $this->actingAs($owner)->post(route('employees.store'), [
        'name' => 'Kasir Baru',
        'email' => 'kasir.baru@example.test',
        'phone' => '08123456789',
        'role' => 'cashier',
        'outlet_id' => $outlet->id,
        'password' => 'password123',
        'pin' => '123456',
    ]);

    $response->assertRedirect();
    $employee = User::withoutGlobalScopes()->where('email', 'kasir.baru@example.test')->firstOrFail();

    expect($employee->tenant_id)->toBe($owner->tenant_id);
    expect($employee->role)->toBe('cashier');
    expect(Hash::check('password123', $employee->password))->toBeTrue();
    expect(Hash::check('123456', $employee->pin))->toBeTrue();
});

it('rejects a cashier from employee management and enforces the staff quota', function () {
    [$tenant, $outlet, $owner] = createEmployeeTestContext(1);
    $cashier = User::factory()->create([
        'tenant_id' => $tenant->id,
        'outlet_id' => $outlet->id,
        'role' => 'cashier',
    ]);

    $this->actingAs($cashier)->get(route('employees.index'))->assertForbidden();

    $response = $this->actingAs($owner)->post(route('employees.store'), [
        'name' => 'Karyawan Kedua',
        'email' => 'kedua@example.test',
        'role' => 'cashier',
        'outlet_id' => $outlet->id,
        'password' => 'password123',
        'pin' => '654321',
    ]);

    $response->assertSessionHasErrors('employee');
    expect(User::withoutGlobalScopes()->where('email', 'kedua@example.test')->exists())->toBeFalse();
});
