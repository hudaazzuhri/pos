<?php

namespace App\Http\Controllers;

use App\Exports\SalesReportExport;
use App\Models\Outlet;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->filters($request);
        $transactionQuery = $this->transactionQuery($filters);
        $completedQuery = (clone $transactionQuery)->where('status', 'completed');
        $grossSales = (clone $completedQuery)->sum('total_amount');
        $transactionCount = (clone $completedQuery)->count();
        $grossProfit = $this->detailQuery($filters)->sum(DB::raw('subtotal - (buy_price * quantity)'));

        $transactions = (clone $transactionQuery)
            ->with(['user:id,name', 'outlet:id,name', 'details'])
            ->latest('transactions.created_at')
            ->paginate(15)
            ->withQueryString();

        $transactions->getCollection()->transform(
            fn (Transaction $transaction): Transaction => $this->withProfit($transaction),
        );

        return Inertia::render('Reports/Sales', [
            'filters' => $filters,
            'summary' => [
                'gross_sales' => (float) $grossSales,
                'gross_profit' => (float) $grossProfit,
                'transaction_count' => $transactionCount,
                'aov' => $transactionCount > 0 ? (float) $grossSales / $transactionCount : 0,
            ],
            'dailySales' => $this->dailySales($filters),
            'paymentBreakdown' => $this->paymentBreakdown($filters),
            'topProducts' => $this->topProducts($filters),
            'cashierPerformance' => $this->cashierPerformance($filters),
            'transactions' => $transactions,
            'outlets' => Outlet::query()->orderBy('name')->get(['id', 'name']),
            'cashiers' => User::query()
                ->where('tenant_id', $request->user()->tenant_id)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function exportExcel(Request $request)
    {
        return Excel::download(new SalesReportExport($this->filters($request)), 'laporan-penjualan.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $filters = $this->filters($request);
        $transactionQuery = $this->transactionQuery($filters);
        $completedQuery = (clone $transactionQuery)->where('status', 'completed');
        $grossSales = (clone $completedQuery)->sum('total_amount');
        $transactionCount = (clone $completedQuery)->count();
        $transactions = $transactionQuery->with(['user:id,name', 'outlet:id,name', 'details'])->latest('transactions.created_at')->get();
        $transactions->transform(fn (Transaction $transaction): Transaction => $this->withProfit($transaction));

        return Pdf::loadView('reports.sales-pdf', [
            'filters' => $filters,
            'transactions' => $transactions,
            'summary' => [
                'gross_sales' => $grossSales,
                'gross_profit' => $this->detailQuery($filters)->sum(DB::raw('subtotal - (buy_price * quantity)')),
                'transaction_count' => $transactionCount,
                'aov' => $transactionCount > 0 ? $grossSales / $transactionCount : 0,
            ],
        ])->download('laporan-penjualan.pdf');
    }

    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'outlet_id' => [
                'nullable',
                'integer',
                Rule::exists('outlets', 'id')->where(fn ($query) => $query->where('tenant_id', $request->user()->tenant_id)),
            ],
            'payment_method' => ['nullable', 'in:cash,qris,bank_transfer,debit'],
            'cashier_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('tenant_id', $request->user()->tenant_id)),
            ],
        ]);

        $endDate = Carbon::parse($validated['end_date'] ?? now()->toDateString());
        $startDate = Carbon::parse($validated['start_date'] ?? $endDate->copy()->subDays(29)->toDateString());

        return [
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'outlet_id' => $validated['outlet_id'] ?? '',
            'payment_method' => $validated['payment_method'] ?? '',
            'cashier_id' => $validated['cashier_id'] ?? '',
        ];
    }

    private function transactionQuery(array $filters): Builder
    {
        return Transaction::query()
            ->whereBetween('transactions.created_at', [$filters['start_date'], $filters['end_date'].' 23:59:59'])
            ->when($filters['outlet_id'], fn (Builder $query, $value) => $query->where('transactions.outlet_id', $value))
            ->when($filters['payment_method'], fn (Builder $query, $value) => $query->where('transactions.payment_method', $value))
            ->when($filters['cashier_id'], fn (Builder $query, $value) => $query->where('transactions.user_id', $value));
    }

    private function detailQuery(array $filters): Builder
    {
        return TransactionDetail::query()->whereHas('transaction', function (Builder $query) use ($filters): void {
            $query->where('status', 'completed')
                ->whereBetween('transactions.created_at', [$filters['start_date'], $filters['end_date'].' 23:59:59'])
                ->when($filters['outlet_id'], fn (Builder $query, $value) => $query->where('outlet_id', $value))
                ->when($filters['payment_method'], fn (Builder $query, $value) => $query->where('payment_method', $value))
                ->when($filters['cashier_id'], fn (Builder $query, $value) => $query->where('user_id', $value));
        });
    }

    private function dailySales(array $filters): array
    {
        return $this->transactionQuery($filters)->where('status', 'completed')
            ->selectRaw('DATE(transactions.created_at) as date, SUM(total_amount) as total, COUNT(*) as transactions')
            ->groupBy('date')->orderBy('date')->get()->map(fn ($row) => [
                'date' => $row->date,
                'total' => (float) $row->total,
                'transactions' => (int) $row->transactions,
            ])->all();
    }

    private function paymentBreakdown(array $filters): array
    {
        return $this->transactionQuery($filters)->where('status', 'completed')
            ->select('payment_method')->selectRaw('SUM(total_amount) as total, COUNT(*) as transactions')
            ->groupBy('payment_method')->get()->map(fn ($row) => [
                'name' => $row->payment_method,
                'total' => (float) $row->total,
                'transactions' => (int) $row->transactions,
            ])->all();
    }

    private function topProducts(array $filters): array
    {
        return $this->detailQuery($filters)->select('product_name')
            ->selectRaw('SUM(quantity) as quantity, SUM(subtotal) as revenue')
            ->groupBy('product_name')->orderByDesc('quantity')->limit(5)->get()->map(fn ($row) => [
                'name' => $row->product_name,
                'quantity' => (int) $row->quantity,
                'revenue' => (float) $row->revenue,
            ])->all();
    }

    private function cashierPerformance(array $filters): array
    {
        return $this->transactionQuery($filters)->where('status', 'completed')
            ->join('users', 'users.id', '=', 'transactions.user_id')
            ->select('transactions.user_id', 'users.name')
            ->selectRaw('SUM(transactions.total_amount) as total, COUNT(transactions.id) as transactions')
            ->groupBy('transactions.user_id', 'users.name')->orderByDesc('total')->get()->map(fn ($row) => [
                'name' => $row->name,
                'total' => (float) $row->total,
                'transactions' => (int) $row->transactions,
            ])->all();
    }

    private function withProfit(Transaction $transaction): Transaction
    {
        $transaction->setAttribute(
            'gross_profit',
            $transaction->details->sum(fn ($detail) => $detail->subtotal - ($detail->buy_price * $detail->quantity)),
        );

        return $transaction;
    }
}
