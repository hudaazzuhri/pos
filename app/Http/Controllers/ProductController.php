<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')->latest();

        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->paginate(10)->withQueryString();
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'search' => $request->search ?? '',
            'category_id' => $request->category_id ?? '',
        ]);
    }

    public function create()
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Products/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'sku' => 'nullable|string|max:50',
            'barcode' => 'nullable|string|max:100',
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'variants' => 'nullable|array',
            'variants.*.name' => 'required|string|max:100',
            'variants.*.sku' => 'nullable|string|max:50',
            'variants.*.barcode' => 'nullable|string|max:100',
            'variants.*.buy_price' => 'required|numeric|min:0',
            'variants.*.sell_price' => 'required|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            $variants = $validated['variants'] ?? [];
            unset($validated['variants']);

            $product = Product::create($validated);
            $product->variants()->createMany($variants);
        });

        return redirect()->route('products.index')->with('message', 'Produk berhasil ditambahkan!');
    }

    public function edit(Product $product)
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);
        $product->load('variants');

        return Inertia::render('Products/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'sku' => 'nullable|string|max:50',
            'barcode' => 'nullable|string|max:100',
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'variants' => 'nullable|array',
            'variants.*.id' => 'nullable|integer',
            'variants.*.name' => 'required|string|max:100',
            'variants.*.sku' => 'nullable|string|max:50',
            'variants.*.barcode' => 'nullable|string|max:100',
            'variants.*.buy_price' => 'required|numeric|min:0',
            'variants.*.sell_price' => 'required|numeric|min:0',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated, $product) {
            $variants = $validated['variants'] ?? [];
            unset($validated['variants']);

            $product->update($validated);

            $variantIds = collect($variants)
                ->pluck('id')
                ->filter()
                ->values();

            if ($variantIds->isEmpty()) {
                $product->variants()->delete();
            } else {
                $product->variants()->whereNotIn('id', $variantIds)->delete();
            }

            foreach ($variants as $variantData) {
                $variantId = $variantData['id'] ?? null;
                unset($variantData['id']);

                if ($variantId) {
                    if (! $product->variants()->whereKey($variantId)->exists()) {
                        throw ValidationException::withMessages([
                            'variants' => 'Variant tidak valid untuk produk ini.',
                        ]);
                    }

                    $product->variants()->whereKey($variantId)->update($variantData);
                } else {
                    $product->variants()->create($variantData);
                }
            }
        });

        return redirect()->route('products.index')->with('message', 'Produk berhasil diperbarui!');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return redirect()->route('products.index');
        }

        Product::whereIn('id', $ids)->delete();

        return redirect()->route('products.index')->with('message', 'Produk berhasil dihapus!');
    }
}
