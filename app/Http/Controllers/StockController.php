<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $productsQuery = Product::query()->with('category')->latest();
        $this->applyProductFilters($productsQuery, $request);
        $products = $productsQuery->paginate(10)->withQueryString();
        $tenantProducts = Product::query();

        return Inertia::render('Stock/Index', [
            'products' => $products,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'search' => $request->string('search')->toString(),
            'category_id' => $request->input('category_id', ''),
            'summary' => [
                'product_types' => (clone $tenantProducts)->count(),
                'total_stock' => (clone $tenantProducts)->sum('stock'),
                'low_stock' => (clone $tenantProducts)->where('stock', '>', 0)->whereColumn('stock', '<=', 'min_stock_alert')->count(),
                'out_of_stock' => (clone $tenantProducts)->where('stock', 0)->count(),
            ],
        ]);
    }

    public function createAdjustment(Request $request): Response
    {
        return Inertia::render('Stock/Adjustment', [
            'outlet' => $this->activeOutlet($request),
            'products' => Product::query()
                ->where('is_active', true)
                ->with('category:id,name')
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'stock', 'min_stock_alert', 'category_id']),
        ]);
    }

    public function storeAdjustment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:addition,subtraction,opname'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('products', 'id')->where('tenant_id', $request->user()->tenant_id),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:0'],
        ]);

        $user = $request->user();
        $outlet = $this->activeOutlet($request);

        DB::transaction(function () use ($validated, $user, $outlet): void {
            $adjustment = StockAdjustment::create([
                'tenant_id' => $user->tenant_id,
                'outlet_id' => $outlet->id,
                'user_id' => $user->id,
                'adjustment_number' => $this->nextAdjustmentNumber(),
                'type' => $validated['type'],
                'total_items' => count($validated['items']),
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);
                $stockBefore = (int) $product->stock;
                $quantity = (int) $item['quantity'];
                $stockAfter = match ($validated['type']) {
                    'addition' => $stockBefore + $quantity,
                    'subtraction' => $stockBefore - $quantity,
                    'opname' => $quantity,
                };

                if ($stockAfter < 0) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$product->name} tidak boleh kurang dari nol.",
                    ]);
                }

                $delta = $stockAfter - $stockBefore;
                $product->update(['stock' => $stockAfter]);

                StockMovement::create([
                    'stock_adjustment_id' => $adjustment->id,
                    'tenant_id' => $user->tenant_id,
                    'outlet_id' => $outlet->id,
                    'product_id' => $product->id,
                    'user_id' => $user->id,
                    'type' => 'adjustment',
                    'quantity' => $delta,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_number' => $adjustment->adjustment_number,
                    'notes' => $validated['notes'] ?? null,
                ]);
            }
        });

        return redirect()->route('stock.index')->with('message', 'Penyesuaian stok berhasil disimpan.');
    }

    public function movements(Request $request): Response
    {
        $movementsQuery = StockMovement::query()
            ->with(['product:id,name,sku', 'user:id,name', 'outlet:id,name'])
            ->latest();

        if ($request->filled('search')) {
            $search = trim($request->string('search')->toString());
            $movementsQuery->whereHas('product', fn (Builder $query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"));
        }

        if ($request->filled('type') && in_array($request->input('type'), ['in', 'out', 'adjustment', 'sale', 'sale_void','opname'], true)) {
            $movementsQuery->where('type', $request->input('type'));
        }

        if ($request->filled('date_from')) {
            $movementsQuery->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $movementsQuery->whereDate('created_at', '<=', $request->input('date_to'));
        }

        return Inertia::render('Stock/Movements', [
            'movements' => $movementsQuery->paginate(15)->withQueryString(),
            'filters' => [
                'search' => $request->string('search')->toString(),
                'type' => $request->input('type', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
        ]);
    }

    private function applyProductFilters(Builder $query, Request $request): void
    {
        if ($request->filled('search')) {
            $search = trim($request->string('search')->toString());
            $query->where(fn (Builder $builder) => $builder
                ->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('barcode', 'like', "%{$search}%"));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }
    }

    private function activeOutlet(Request $request): Outlet
    {
        $user = $request->user();

        return Outlet::query()
            ->when($user->outlet_id, fn (Builder $query) => $query->whereKey($user->outlet_id))
            ->orderByDesc('is_main')
            ->firstOrFail();
    }

    private function nextAdjustmentNumber(): string
    {
        $prefix = 'ADJ-'.now()->format('Ym').'-';
        $lastNumber = StockAdjustment::query()
            ->where('adjustment_number', 'like', $prefix.'%')
            ->orderByDesc('adjustment_number')
            ->value('adjustment_number');
        $sequence = $lastNumber ? ((int) substr($lastNumber, -3)) + 1 : 1;

        return $prefix.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }
}
