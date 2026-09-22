<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->string('search')->toString());

        $customers = Customer::query()
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'search' => $search,
        ]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('customers.index');
    }

    public function store(Request $request): RedirectResponse
    {
        Customer::create($this->validated($request));

        return redirect()->route('customers.index')->with('message', 'Pelanggan berhasil ditambahkan.');
    }

    public function show(Customer $customer): RedirectResponse
    {
        return redirect()->route('customers.index');
    }

    public function edit(Customer $customer): RedirectResponse
    {
        return redirect()->route('customers.index');
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $customer->update($this->validated($request));

        return redirect()->route('customers.index')->with('message', 'Data pelanggan berhasil diperbarui.');
    }

    public function destroy(Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect()->route('customers.index')->with('message', 'Pelanggan berhasil dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);
    }
}
