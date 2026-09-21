<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\StockOpname;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockOpnameController extends Controller
{
    public function index(Request $request): Response
    {
        $query = StockOpname::query()
            ->with(['outlet:id,name', 'user:id,name'])
            ->latest();

        if ($request->filled('status') && in_array($request->input('status'), ['draft', 'completed', 'canceled'], true)) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        return Inertia::render('StockOpname/Index', [
            'opnames' => $query->paginate(15)->withQueryString(),
            'search' => $request->search ?? '',
            'filters' => [
                'status' => $request->input('status', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('StockOpname/Create', [
            'outlet' => $this->activeOutlet($request),
            'products' => Product::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'barcode', 'stock', 'buy_price']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('products', 'id')->where('tenant_id', $request->user()->tenant_id),
            ],
            'items.*.physical_stock' => ['required', 'integer', 'min:0'],
            'items.*.notes' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $outlet = $this->activeOutlet($request);

        $opname = DB::transaction(function () use ($validated, $user, $outlet): StockOpname {
            $details = [];
            $totalDiscrepancyQty = 0;
            $totalDiscrepancyValue = 0;

            foreach ($validated['items'] as $item) {
                $product = Product::query()->findOrFail($item['product_id']);
                $systemStock = (int) $product->stock;
                $physicalStock = (int) $item['physical_stock'];
                $difference = $physicalStock - $systemStock;
                $value = $difference * (float) $product->buy_price;

                $details[] = [
                    'tenant_id' => $user->tenant_id,
                    'product_id' => $product->id,
                    'system_stock' => $systemStock,
                    'physical_stock' => $physicalStock,
                    'difference' => $difference,
                    'unit_buy_price' => $product->buy_price,
                    'total_discrepancy_value' => $value,
                    'notes' => $item['notes'] ?? null,
                ];
                $totalDiscrepancyQty += $difference;
                $totalDiscrepancyValue += $value;
            }

            $opname = StockOpname::create([
                'tenant_id' => $user->tenant_id,
                'outlet_id' => $outlet->id,
                'user_id' => $user->id,
                'opname_number' => $this->nextOpnameNumber(),
                'status' => 'draft',
                'total_items_checked' => count($details),
                'total_discrepancy_qty' => $totalDiscrepancyQty,
                'total_discrepancy_value' => $totalDiscrepancyValue,
                'notes' => $validated['notes'] ?? null,
            ]);

            $opname->details()->createMany($details);

            return $opname;
        });

        return redirect()->route('stock-opname.show', $opname)->with('message', 'Draft stock opname berhasil dibuat.');
    }

    public function show(StockOpname $opname): Response
    {
        $opname->load(['details.product:id,name,sku', 'outlet:id,name', 'user:id,name']);

        return Inertia::render('StockOpname/Show', [
            'opname' => $opname,
        ]);
    }

    public function adjust(StockOpname $opname, Request $request): RedirectResponse
    {
        if ($opname->status !== 'draft') {
            throw ValidationException::withMessages([
                'opname' => 'Stock opname ini sudah diproses dan tidak dapat disesuaikan kembali.',
            ]);
        }

        DB::transaction(function () use ($opname, $request): void {
            $opname->load('details');
            $totalDiscrepancyQty = 0;
            $totalDiscrepancyValue = 0;

            foreach ($opname->details as $detail) {
                $product = Product::query()->lockForUpdate()->findOrFail($detail->product_id);
                $stockBefore = (int) $product->stock;
                $stockAfter = (int) $detail->physical_stock;
                $difference = $stockAfter - $stockBefore;

                $product->update(['stock' => $stockAfter]);
                StockMovement::create([
                    'tenant_id' => $opname->tenant_id,
                    'outlet_id' => $opname->outlet_id,
                    'product_id' => $product->id,
                    'user_id' => $request->user()->id,
                    'type' => 'opname',
                    'quantity' => $difference,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_number' => $opname->opname_number,
                    'notes' => $detail->notes ?? 'Penyesuaian hasil stock opname.',
                ]);

                $totalDiscrepancyQty += (int) $detail->difference;
                $totalDiscrepancyValue += (float) $detail->total_discrepancy_value;
            }

            $opname->update([
                'status' => 'completed',
                'total_discrepancy_qty' => $totalDiscrepancyQty,
                'total_discrepancy_value' => $totalDiscrepancyValue,
                'completed_at' => now(),
            ]);
        });

        return redirect()->route('stock-opname.show', $opname)->with('message', 'Stock opname berhasil disetujui dan stok sistem telah disesuaikan.');
    }

    private function activeOutlet(Request $request): Outlet
    {
        $user = $request->user();

        return Outlet::query()
            ->when($user->outlet_id, fn (Builder $query) => $query->whereKey($user->outlet_id))
            ->orderByDesc('is_main')
            ->firstOrFail();
    }

    private function nextOpnameNumber(): string
    {
        $prefix = 'SOP-'.now()->format('Ym').'-';
        $lastNumber = StockOpname::query()
            ->where('opname_number', 'like', $prefix.'%')
            ->orderByDesc('opname_number')
            ->value('opname_number');
        $sequence = $lastNumber ? ((int) substr($lastNumber, -3)) + 1 : 1;

        return $prefix.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }
}
