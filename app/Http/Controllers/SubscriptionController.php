<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Product;
use App\Models\TenantSubscription;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $tenant = $request->user()->tenant;
        $currentSubscription = TenantSubscription::query()
            ->with('plan')
            ->where('status', 'active')
            ->latest('ends_at')
            ->first();
        $plan = $currentSubscription?->plan;
        $transactionCount = Transaction::query()->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->count();

        return Inertia::render('Subscription/Index', [
            'plans' => Plan::query()->orderBy('price')->get(),
            'subscription' => [
                'package_name' => $currentSubscription?->plan?->name ?? 'Belum berlangganan',
                'status' => $currentSubscription?->status ?? 'inactive',
                'expires_at' => $currentSubscription?->ends_at?->toIso8601String(),
                'days_remaining' => $currentSubscription ? max(0, now()->diffInDays($currentSubscription->ends_at, false)) : 0,
            ],
            'usage' => [
                'transactions' => $transactionCount,
                'transactions_limit' => $plan?->max_monthly_transactions ?? 0,
                'outlets' => $tenant->outlets()->count(),
                'outlets_limit' => $plan?->max_outlets ?? 0,
                'users' => $tenant->users()->count(),
                'users_limit' => $plan?->max_users ?? 0,
                'products' => Product::query()->count(),
                'products_limit' => $plan?->max_products ?? 0,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(['plan_id' => ['required', 'integer', 'exists:plans,id']]);
        $plan = Plan::query()->findOrFail($validated['plan_id']);

        TenantSubscription::query()->create([
            'plan_id' => $plan->id,
            'package_name' => $plan->name,
            'status' => 'pending_payment',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        return to_route('subscriptions.index')->with('message', 'Instruksi pembayaran paket '.$plan->name.' telah dibuat. Selesaikan pembayaran untuk mengaktifkan paket.');
    }
}
