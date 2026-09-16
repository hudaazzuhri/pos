<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::withCount('products')->latest();

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $query->paginate(10)->withQueryString();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'search' => $request->search ?? '',
        ]);
    }

    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        Category::create($validated);

        return redirect()->route('categories.index')->with('message', 'Kategori berhasil ditambahkan!');
    }

    public function edit(Category $category)
    {

        return Inertia::render('Categories/Edit', [
            'category' => $category
        ]);
    }
    
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        DB::transaction(function () use ($validated, $category) {
            $category->update($validated);
        });

        return redirect()->route('categories.index')->with('message', 'Kategori berhasil diperbarui!');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return redirect()->route('categories.index');
        }

        Category::whereIn('id', $ids)->delete();

        return redirect()->route('categories.index')->with('message', 'Kategori berhasil dihapus!');
    }
}
