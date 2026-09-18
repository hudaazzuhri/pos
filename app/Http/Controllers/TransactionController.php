<?php

namespace App\Http\Controllers;

use App\Models\CashDrawerLog;
use App\Models\CashierShift;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Models\StoreSetting;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Layar Utama Terminal Kasir (Inertia Render)
     */
    public function posTerminal(Request $request): Response
    {
        $tenantId = auth()->user()->tenant_id;

        // Cek apakah kasir sedang punya shift aktif
        $activeShift = CashierShift::where('tenant_id', $tenantId)
            ->where('user_id', auth()->id())
            ->where('status', 'open')
            ->whereNull('closed_at')
            ->with('outlet')
            ->first();

        // Tarik Katalog Produk + Varian (Trait BelongsToTenant otomatis menyaring tenant_id)
        $products = Product::with(['category', 'variants', 'activeDiscounts'])
            ->where('is_active', true)
            ->get();

        $categories = Category::all();
        $customers = Customer::query()->orderBy('name')->get(['id', 'name', 'phone']);
        $storeSettings = StoreSetting::query()->where('outlet_id', $activeShift?->outlet_id ?? auth()->user()->outlet_id)->first();

        return Inertia::render('POS/TerminalRetail', [
            'products' => $products,
            'categories' => $categories,
            'customers' => $customers,
            'activeShift' => $activeShift,
            'storeSettings' => $storeSettings ? [
                ...$storeSettings->toArray(),
                'logo_url' => $storeSettings->logo_path ? asset('storage/'.$storeSettings->logo_path) : null,
            ] : null,
        ]);
    }

    public function index()
    {
        $query = Transaction::query()
            ->with(['user:id,name', 'customer:id,name', 'outlet:id,name'])
            ->latest();

        $outlets = Outlet::query()
            ->get(['id', 'name']);

        return Inertia::render('Transactions/Index', [
            'transactions' => $query->paginate(10)->withQueryString(),
            'outlets' => $outlets,
        ]);
    }

    /**
     * Proses Checkout Transaksi dari React
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'in:cash,qris,bank_transfer,debit'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'extra_charge' => ['nullable', 'numeric', 'min:0'],
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $user = $request->user();
            $activeShift = $this->activeShift($user->id);

            if (! $activeShift) {
                return back()->withErrors([
                    'items' => 'Buka shift kasir terlebih dahulu sebelum checkout.',
                ]);
            }

            // Generate Invoice (misal: INV-20260914-0001)
            $invoiceNumber = 'INV-'.date('Ymd').'-'.str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

            $subtotal = 0;
            $itemsToInsert = [];

            foreach ($validated['items'] as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item['id']);
                $variant = null;

                if (! empty($item['variant_id'])) {
                    $variant = ProductVariant::query()
                        ->where('product_id', $product->id)
                        ->lockForUpdate()
                        ->findOrFail($item['variant_id']);
                }

                $stock = $variant?->stock ?? $product->stock;
                $sellPrice = $variant?->sell_price ?? $product->sell_price;
                $buyPrice = $variant?->buy_price ?? $product->buy_price;
                $quantity = $item['qty'];

                if ($stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$product->name}".($variant ? " - {$variant->name}" : '').' tidak mencukupi.',
                    ]);
                }

                $itemSubtotal = (float) $sellPrice * $quantity;
                $subtotal += $itemSubtotal;

                // Potong Stok
                ($variant ?? $product)->decrement('stock', $quantity);

                StockMovement::create([
                    'tenant_id' => $user->tenant_id,
                    'outlet_id' => $activeShift->outlet_id,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'user_id' => $user->id,
                    'type' => 'sale',
                    'quantity' => -$quantity,
                    'stock_before' => $stock,
                    'stock_after' => $stock - $quantity,
                    'reference_number' => $invoiceNumber,
                    'notes' => 'Pengurangan stok dari checkout.',
                ]);

                $itemsToInsert[] = [
                    'tenant_id' => $user->tenant_id,
                    'product_id' => $product->id,
                    'product_variant_id' => $variant?->id,
                    'product_name' => $product->name,
                    'variant_name' => $variant?->name,
                    'buy_price' => $buyPrice,
                    'sell_price' => $sellPrice,
                    'quantity' => $quantity,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $discountAmount = min((float) ($validated['discount_amount'] ?? 0), $subtotal);
            $extraCharge = (float) ($validated['extra_charge'] ?? 0);
            $totalAmount = $subtotal - $discountAmount + $extraCharge;
            $paidAmount = (float) $validated['paid_amount'];
            $changeAmount = $paidAmount - $totalAmount;

            if ($paidAmount < $totalAmount) {
                throw ValidationException::withMessages([
                    'paid_amount' => 'Jumlah pembayaran kurang dari total transaksi.',
                ]);
            }

            // Save Transaksi
            $transaction = Transaction::create([
                'tenant_id' => $user->tenant_id,
                'outlet_id' => $activeShift->outlet_id,
                'user_id' => $user->id,
                'customer_id' => $validated['customer_id'] ?? null,
                'invoice_number' => $invoiceNumber,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $extraCharge,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount > 0 ? $changeAmount : 0,
                'payment_method' => $validated['payment_method'],
                'status' => 'completed',
            ]);

            // Save Details
            foreach ($itemsToInsert as $detail) {
                $detail['transaction_id'] = $transaction->id;
                TransactionDetail::create($detail);
            }

            if ($transaction->payment_method === 'cash' && $activeShift) {
                CashDrawerLog::create([
                    'tenant_id' => $user->tenant_id,
                    'outlet_id' => $activeShift->outlet_id,
                    'cashier_shift_id' => $activeShift->id,
                    'user_id' => $user->id,
                    'action_type' => 'sale_checkout',
                ]);
            }

            return redirect()->back()->with('success', [
                'invoice_number' => $transaction->invoice_number,
                'total' => $transaction->total_amount,
                'change' => $transaction->change_amount,
            ]);
        });
    }

    private function activeShift(int $userId): ?CashierShift
    {
        return CashierShift::query()
            ->where('user_id', $userId)
            ->where('status', 'open')
            ->whereNull('closed_at')
            ->latest('opened_at')
            ->first();
    }
}
