<?php

namespace App\Http\Controllers;

use App\Models\Discount;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->string('status')->toString() ?: 'all';
        $now = now();

        $discounts = Discount::query()
            ->with('products:id,name,sku')
            ->when($search !== '', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"))
            ->when($status === 'active', fn (Builder $query) => $query->active())
            ->when($status === 'inactive', fn (Builder $query) => $query->where('is_active', false))
            ->when($status === 'expired', fn (Builder $query) => $query->whereNotNull('end_date')->where('end_date', '<', $now))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Discounts/Index', [
            'discounts' => $discounts,
            'products' => Product::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'sell_price']),
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        DB::transaction(function () use ($validated, $request): void {
            $discount = Discount::create($this->discountAttributes($validated, $request));
            $this->syncProducts($discount, $validated);
        });

        return back()->with('message', 'Diskon berhasil dibuat.');
    }

    public function update(Request $request, Discount $discount): RedirectResponse
    {
        $validated = $this->validated($request);

        DB::transaction(function () use ($discount, $validated, $request): void {
            $discount->update($this->discountAttributes($validated, $request));
            $this->syncProducts($discount, $validated);
        });

        return back()->with('message', 'Diskon berhasil diperbarui.');
    }

    public function toggleStatus(Discount $discount): RedirectResponse
    {
        $discount->update(['is_active' => ! $discount->is_active]);

        return back()->with('message', 'Status diskon berhasil diperbarui.');
    }

    public function destroy(Discount $discount): RedirectResponse
    {
        DB::transaction(function () use ($discount): void {
            $discount->products()->detach();
            $discount->delete();
        });

        return back()->with('message', 'Diskon berhasil dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'scope' => ['required', 'in:global,product'],
            'product_ids' => [
                'required_if:scope,product',
                'array',
                Rule::when($request->input('scope') === 'product', ['min:1']),
            ],
            'product_ids.*' => [
                'integer',
                Rule::exists('products', 'id')->where(fn ($query) => $query->where('tenant_id', $request->user()->tenant_id)),
            ],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'min_purchase_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function discountAttributes(array $validated, Request $request): array
    {
        return [
            'tenant_id' => $request->user()->tenant_id,
            'name' => $validated['name'],
            'type' => $validated['type'] === 'fixed' ? 'fixed_amount' : $validated['type'],
            'value' => $validated['value'],
            'max_discount_amount' => $validated['max_discount_amount'] ?? null,
            'min_purchase_amount' => $validated['min_purchase_amount'] ?? 0,
            'scope' => $validated['scope'] === 'global' ? 'transaction' : $validated['scope'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'is_active' => $validated['is_active'] ?? false,
        ];
    }

    private function syncProducts(Discount $discount, array $validated): void
    {
        if (($validated['scope'] ?? null) === 'product') {
            $discount->products()->sync($validated['product_ids'] ?? []);
            return;
        }

        $discount->products()->detach();
    }
}
