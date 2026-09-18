<?php

namespace App\Http\Controllers;

use App\Models\CashierShift;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\TenantSubscription;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $outlets = Outlet::query()->when(! $user->isOwner(), fn (Builder $query) => $query->where('id', $user->outlet_id))->orderBy('name')->get(['id', 'name']);
        $validated = $request->validate([
            'outlet_id' => [
                'nullable',
                'integer',
                Rule::exists('outlets', 'id')->where(fn ($query) => $query->where('tenant_id', $user->tenant_id)),
            ],
        ]);

        $outletId = $user->isOwner()
            ? ($validated['outlet_id'] ?? null)
            : ($user->outlet_id ?: ($validated['outlet_id'] ?? null));
        $today = now();
        $yesterday = $today->copy()->subDay();
        $todayStart = $today->copy()->startOfDay();
        $todayEnd = $today->copy()->endOfDay();
        $yesterdayStart = $yesterday->copy()->startOfDay();
        $yesterdayEnd = $yesterday->copy()->endOfDay();

        $todayTransactions = $this->completedTransactions($outletId)->whereBetween('created_at', [$todayStart, $todayEnd]);
        $yesterdayTransactions = $this->completedTransactions($outletId)->whereBetween('created_at', [$yesterdayStart, $yesterdayEnd]);
        $todayRevenue = (float) (clone $todayTransactions)->sum('total_amount');
        $yesterdayRevenue = (float) (clone $yesterdayTransactions)->sum('total_amount');
        $todayCount = (clone $todayTransactions)->count();
        $growth = $yesterdayRevenue > 0 ? (($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100 : ($todayRevenue > 0 ? 100 : 0);

        return Inertia::render('Dashboard', [
            'filters' => ['outlet_id' => $outletId ?? ''],
            'outlets' => $outlets->values(),
            'summary' => [
                'revenue' => $todayRevenue,
                'revenue_growth' => round($growth, 1),
                'gross_profit' => $this->profitQuery($outletId)->whereBetween('transactions.created_at', [$todayStart, $todayEnd])->sum(DB::raw('transaction_details.subtotal - (transaction_details.buy_price * transaction_details.quantity)')),
                'transactions' => $todayCount,
                'aov' => $todayCount > 0 ? $todayRevenue / $todayCount : 0,
            ],
            'salesTrend' => $this->salesTrend($outletId, $today),
            'hourlySales' => $this->hourlySales($outletId, $today),
            'paymentBreakdown' => $this->paymentBreakdown($outletId, $todayStart, $todayEnd),
            'outletPerformance' => $this->outletPerformance($outletId, $todayStart, $todayEnd),
            'topProducts' => $this->topProducts($outletId, $todayStart, $todayEnd),
            'lowStockProducts' => $this->lowStockProducts($outletId),
            'activeShifts' => $this->activeShifts($outletId),
            'subscription' => $this->subscriptionSummary($user->tenant_id),
        ]);
    }

    private function completedTransactions(?int $outletId): Builder
    {
        return Transaction::query()->where('status', 'completed')->when($outletId, fn (Builder $query) => $query->where('outlet_id', $outletId));
    }

    private function profitQuery(?int $outletId): Builder
    {
        return TransactionDetail::query()->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->where('transactions.status', 'completed')
            ->when($outletId, fn (Builder $query) => $query->where('transactions.outlet_id', $outletId));
    }

    private function salesTrend(?int $outletId, Carbon $date): array
    {
        $rows = $this->completedTransactions($outletId)->whereBetween('created_at', [$date->copy()->subDays(6)->startOfDay(), $date->copy()->endOfDay()])
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total, COUNT(*) as transactions')->groupBy('date')->get()->keyBy('date');

        return collect(range(6, 0))->map(function (int $days) use ($date, $rows): array {
            $key = $date->copy()->subDays($days)->toDateString();
            $row = $rows->get($key);

            return ['date' => $key, 'total' => (float) ($row->total ?? 0), 'transactions' => (int) ($row->transactions ?? 0)];
        })->all();
    }

    private function hourlySales(?int $outletId, Carbon $date): array
    {
        $rows = $this->completedTransactions($outletId)->whereBetween('created_at', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])
            ->selectRaw('HOUR(created_at) as hour, SUM(total_amount) as total')->groupBy('hour')->get()->keyBy('hour');

        return collect(range(0, 23))->map(fn (int $hour): array => ['hour' => sprintf('%02d:00', $hour), 'total' => (float) ($rows->get($hour)->total ?? 0)])->all();
    }

    private function paymentBreakdown(?int $outletId, Carbon $start, Carbon $end): array
    {
        return $this->completedTransactions($outletId)->whereBetween('created_at', [$start, $end])->select('payment_method')
            ->selectRaw('SUM(total_amount) as total, COUNT(*) as transactions')->groupBy('payment_method')->get()->map(fn ($row): array => [
                'name' => $row->payment_method, 'total' => (float) $row->total, 'transactions' => (int) $row->transactions,
            ])->all();
    }

    private function outletPerformance(?int $outletId, Carbon $start, Carbon $end): array
    {
        return $this->completedTransactions($outletId)->whereBetween('transactions.created_at', [$start, $end])->join('outlets', 'outlets.id', '=', 'transactions.outlet_id')
            ->select('transactions.outlet_id', 'outlets.name')->selectRaw('SUM(transactions.total_amount) as total, COUNT(transactions.id) as transactions')
            ->groupBy('transactions.outlet_id', 'outlets.name')->orderByDesc('total')->get()->map(fn ($row): array => [
                'id' => $row->outlet_id, 'name' => $row->name, 'total' => (float) $row->total, 'transactions' => (int) $row->transactions,
            ])->all();
    }

    private function topProducts(?int $outletId, Carbon $start, Carbon $end): array
    {
        return $this->profitQuery($outletId)->whereBetween('transactions.created_at', [$start, $end])->select('product_name')
            ->selectRaw('SUM(quantity) as quantity, SUM(transaction_details.subtotal) as revenue')->groupBy('product_name')->orderByDesc('quantity')->limit(5)->get()->map(fn ($row): array => [
                'name' => $row->product_name, 'quantity' => (int) $row->quantity, 'revenue' => (float) $row->revenue,
            ])->all();
    }

    private function lowStockProducts(?int $outletId): array
    {
        return Product::query()->where('is_active', true)->whereColumn('stock', '<=', 'min_stock_alert')
            ->orderBy('stock')->limit(5)->get(['id', 'name', 'stock', 'min_stock_alert'])->map(fn (Product $product): array => [
                'id' => $product->id, 'name' => $product->name, 'stock' => $product->stock, 'min_stock_alert' => $product->min_stock_alert,
            ])->all();
    }

    private function activeShifts(?int $outletId): array
    {
        return CashierShift::query()->where('status', 'open')->whereNull('closed_at')->when($outletId, fn (Builder $query) => $query->where('outlet_id', $outletId))
            ->with(['user:id,name,avatar', 'outlet:id,name'])->selectSub(Transaction::query()->selectRaw('COUNT(*)')->whereColumn('transactions.user_id', 'cashier_shifts.user_id')->whereColumn('transactions.outlet_id', 'cashier_shifts.outlet_id')->where('transactions.status', 'completed')->whereColumn('transactions.created_at', '>=', 'cashier_shifts.opened_at'), 'transaction_count')->latest('opened_at')->get()
            ->map(fn (CashierShift $shift): array => ['id' => $shift->id, 'user' => $shift->user, 'outlet' => $shift->outlet, 'opened_at' => $shift->opened_at?->toIso8601String(), 'transaction_count' => $shift->transaction_count])->all();
    }

    private function subscriptionSummary(int $tenantId): array
    {
        $subscription = TenantSubscription::query()->where('tenant_id', $tenantId)->where('payment_status', 'paid')->latest('expires_at')->first();
        $userCount = User::query()->where('tenant_id', $tenantId)->count();
        $outletCount = Outlet::query()->where('tenant_id', $tenantId)->count();

        return ['package_name' => $subscription?->package_name ?? 'Belum berlangganan', 'expires_at' => $subscription?->expires_at?->toIso8601String(), 'days_remaining' => $subscription ? max(0, now()->diffInDays($subscription->expires_at, false)) : 0, 'outlets_used' => $outletCount, 'users_used' => $userCount, 'users_limit' => $subscription?->max_users];
    }
}
