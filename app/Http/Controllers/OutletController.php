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
}
