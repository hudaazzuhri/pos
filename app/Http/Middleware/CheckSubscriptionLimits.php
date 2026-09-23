<?php

namespace App\Http\Middleware;

use App\Models\TenantSubscription;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscriptionLimits
{
    public function handle(Request $request, Closure $next, string $limit): Response
    {
        $user = $request->user();
        $subscription = TenantSubscription::query()
            ->with('plan')
            ->where('tenant_id', $user?->tenant_id)
            ->where('status', 'active')
            ->where('ends_at', '>=', now())
            ->latest('ends_at')
            ->first();
        $plan = $subscription?->plan;

        if (! $user || ! $plan) {
            return $this->reject($request, 'Langganan aktif tidak ditemukan. Silakan pilih paket terlebih dahulu.');
        }

        $usage = match ($limit) {
            'outlet' => $user->tenant->outlets()->count(),
            'user' => $user->tenant->users()->count(),
            'product' => $user->tenant->products()->count(),
            'transaction' => $user->tenant->transactions()->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->count(),
            default => null,
        };
        $maximum = match ($limit) {
            'outlet' => $plan->max_outlets,
            'user' => $plan->max_users,
            'product' => $plan->max_products,
            'transaction' => $plan->max_monthly_transactions,
            default => null,
        };

        if ($usage === null || ($maximum > 0 && $usage >= $maximum)) {
            return $this->reject($request, match ($limit) {
                'outlet' => 'Batas outlet tercapai. Silakan upgrade paket Anda.',
                'user' => 'Batas user tercapai. Silakan upgrade paket Anda.',
                'product' => 'Batas produk tercapai. Silakan upgrade paket Anda.',
                'transaction' => 'Batas transaksi bulan ini tercapai. Silakan upgrade paket Anda.',
                default => 'Akses dibatasi oleh paket langganan Anda.',
            });
        }

        return $next($request);
    }

    private function reject(Request $request, string $message): Response
    {
        if ($request->expectsJson()) {
            return response()->json(['message' => $message], 403);
        }

        return redirect()->back()->with('error', $message);
    }
}
