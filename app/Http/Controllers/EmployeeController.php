<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\TenantSubscription;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()
            ->with('outlet:id,name')
            ->whereIn('role', ['manager', 'cashier'])
            ->latest();

        if ($request->filled('search')) {
            $search = trim($request->string('search')->toString());
            $query->where(fn (Builder $builder) => $builder
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%"));
        }

        if ($request->filled('role') && in_array($request->input('role'), ['manager', 'cashier'], true)) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('outlet_id')) {
            $query->where('outlet_id', $request->input('outlet_id'));
        }

        if ($request->input('status') === 'active') {
            $query->where('is_active', true);
        } elseif ($request->input('status') === 'inactive') {
            $query->where('is_active', false);
        }

        $subscription = $this->activeSubscription($request);
        $maxUsers = $this->maxUsers($subscription);
        $usedUsers = User::query()->whereIn('role', ['manager', 'cashier'])->count();

        return Inertia::render('Employees/Index', [
            'employees' => $query->paginate(10)->withQueryString(),
            'outlets' => Outlet::query()->orderByDesc('is_main')->orderBy('name')->get(['id', 'name', 'is_main']),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'role' => $request->input('role', ''),
                'outlet_id' => $request->input('outlet_id', ''),
                'status' => $request->input('status', ''),
            ],
            'quota' => [
                'used' => $usedUsers,
                'max' => $maxUsers,
                'package_name' => $subscription?->package_name ?? 'Default',
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedEmployee($request);
        $this->ensureQuotaAvailable($request);

        User::create([
            'tenant_id' => $request->user()->tenant_id,
            'outlet_id' => $validated['outlet_id'],
            'name' => $validated['name'],
            'username' => $this->uniqueUsername($validated['name'], $validated['email']),
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'pin' => Hash::make($validated['pin']),
            'role' => $validated['role'],
            'is_active' => true,
        ]);

        return redirect()->route('employees.index')->with('message', 'Karyawan berhasil ditambahkan.');
    }

    public function update(Request $request, User $employee): RedirectResponse
    {
        abort_unless(in_array($employee->role, ['manager', 'cashier'], true), 404);

        $validated = $this->validatedEmployee($request, $employee);
        $isActivating = ! $employee->is_active && ($validated['is_active'] ?? true);

        if ($isActivating) {
            $this->ensureQuotaAvailable($request);
        }

        $employee->fill([
            'outlet_id' => $validated['outlet_id'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['password'])) {
            $employee->password = Hash::make($validated['password']);
        }

        if (! empty($validated['pin'])) {
            $employee->pin = Hash::make($validated['pin']);
        }

        $employee->save();

        return back()->with('message', 'Data karyawan berhasil diperbarui.');
    }

    public function toggleStatus(User $employee): RedirectResponse
    {
        abort_unless(in_array($employee->role, ['manager', 'cashier'], true), 404);

        if (! $employee->is_active) {
            $this->ensureQuotaAvailable(request());
        }

        $employee->update(['is_active' => ! $employee->is_active]);

        return back()->with('message', $employee->is_active ? 'Karyawan diaktifkan.' : 'Karyawan dinonaktifkan.');
    }

    public function destroy(User $employee): RedirectResponse
    {
        abort_unless(in_array($employee->role, ['manager', 'cashier'], true), 404);
        if ($employee->transactions()->exists()) {
            throw ValidationException::withMessages([
                'employee' => 'Karyawan yang memiliki histori transaksi tidak dapat dihapus. Nonaktifkan karyawan sebagai gantinya.',
            ]);
        }

        $employee->delete();

        return back()->with('message', 'Karyawan berhasil dihapus.');
    }

    private function validatedEmployee(Request $request, ?User $employee = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->where('tenant_id', $request->user()->tenant_id)
                    ->ignore($employee?->id),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'in:manager,cashier'],
            'outlet_id' => [
                'required',
                'integer',
                Rule::exists('outlets', 'id')->where('tenant_id', $request->user()->tenant_id),
            ],
            'password' => [$employee ? 'nullable' : 'required', 'string', 'min:8'],
            'pin' => [$employee ? 'nullable' : 'required', 'digits:6'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function activeSubscription(Request $request): ?TenantSubscription
    {
        return TenantSubscription::query()
            ->where('tenant_id', $request->user()->tenant_id)
            ->where('payment_status', 'paid')
            ->where('starts_at', '<=', now())
            ->where('expires_at', '>=', now())
            ->latest('expires_at')
            ->first();
    }

    private function maxUsers(?TenantSubscription $subscription): int
    {
        if ($subscription?->max_users) {
            return (int) $subscription->max_users;
        }

        return match (Str::lower($subscription?->package_name ?? '')) {
            'basic', 'basic plan' => 2,
            'pro', 'pro plan', 'pro multi-outlet' => 10,
            'enterprise', 'enterprise plan' => 999999,
            default => 10,
        };
    }

    private function ensureQuotaAvailable(Request $request): void
    {
        $subscription = $this->activeSubscription($request);
        $maxUsers = $this->maxUsers($subscription);
        $usedUsers = User::query()->whereIn('role', ['manager', 'cashier'])->count();

        if ($usedUsers >= $maxUsers) {
            throw ValidationException::withMessages([
                'employee' => "Kuota karyawan telah penuh ({$usedUsers} dari {$maxUsers}). Upgrade paket untuk menambah karyawan.",
            ]);
        }
    }

    private function uniqueUsername(string $name, string $email): string
    {
        $base = Str::slug(Str::before($email, '@')) ?: Str::slug($name) ?: 'employee';
        $username = $base;
        $sequence = 1;

        while (User::withoutGlobalScopes()->where('username', $username)->exists()) {
            $username = $base.'-'.$sequence++;
        }

        return $username;
    }
}
