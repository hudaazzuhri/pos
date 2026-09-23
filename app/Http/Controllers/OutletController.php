<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OutletController extends Controller
{
    public function index(Request $request)
    {
        $query = Outlet::latest();

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where('name', 'like', "%{$search}%");
        }

        $outlets = $query->paginate(10)->withQueryString();

        return Inertia::render('Outlets/Index', [
            'outlets' => $outlets,
            'search' => $request->search ?? '',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'is_main' => ['boolean'],
        ]);

        Outlet::create($validated);

        return redirect()->route('outlets.index')->with('message', 'Outlet berhasil ditambahkan!');
    }

    public function update(Request $request, Outlet $outlet)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'is_main' => ['boolean'],
        ]);

        $outlet->update($validated);

        return redirect()->route('outlets.index')->with('message', 'Outlet berhasil diperbarui!');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return redirect()->route('outlets.index');
        }

        Outlet::whereIn('id', $ids)->delete();

        return redirect()->route('outlets.index')->with('message', 'Outlet berhasil dihapus!');
    }
}
