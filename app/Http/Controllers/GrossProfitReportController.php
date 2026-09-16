<?php

namespace App\Http\Controllers;

use App\Exports\GrossProfitReportExport;
use App\Models\Category;
use App\Models\Outlet;
use App\Models\TransactionDetail;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class GrossProfitReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->filters($request);
        $detailQuery = $this->detailQuery($filters);
        $summary = $this->summary($filters);
        $previousFilters = $this->previousFilters($filters);
        $summary['comparison'] = $this->comparison($summary, $this->summary($previousFilters));
        $products = $this->productBreakdown($filters)->paginate(15)->withQueryString();

        return Inertia::render('Reports/GrossProfit', [
            'filters' => $filters,
            'summary' => $summary,
            'dailyProfit' => $this->dailyProfit($filters),
            'categoryProfit' => $this->categoryProfit($filters),
            'products' => $products,
            'outlets' => Outlet::query()->orderBy('name')->get(['id', 'name']),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function exportExcel(Request $request)
    {
        return Excel::download(
            new GrossProfitReportExport($this->filters($request)),
            'laporan-laba-kotor.xlsx',
        );
    }

    public function exportPdf(Request $request)
    {
        $filters = $this->filters($request);
        $products = $this->productBreakdown($filters)->get();

        return Pdf::loadView('reports.gross-profit-pdf', [
            'filters' => $filters,
            'summary' => $this->summary($filters),
            'products' => $products,
        ])->download('laporan-laba-kotor.pdf');
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
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where(fn ($query) => $query->where('tenant_id', $request->user()->tenant_id)),
            ],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        $endDate = Carbon::parse($validated['end_date'] ?? now()->toDateString());
        $startDate = Carbon::parse($validated['start_date'] ?? $endDate->copy()->startOfMonth()->toDateString());

        return [
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'outlet_id' => $validated['outlet_id'] ?? '',
            'category_id' => $validated['category_id'] ?? '',
            'search' => trim($validated['search'] ?? ''),
        ];
    }

    private function detailQuery(array $filters): Builder
    {
        return TransactionDetail::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->leftJoin('products', 'products.id', '=', 'transaction_details.product_id')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$filters['start_date'], $filters['end_date'].' 23:59:59'])
            ->when($filters['outlet_id'], fn (Builder $query, $value) => $query->where('transactions.outlet_id', $value))
            ->when($filters['category_id'], fn (Builder $query, $value) => $query->where('products.category_id', $value))
            ->when($filters['search'], function (Builder $query, string $value): void {
                $query->where(function (Builder $nestedQuery) use ($value): void {
                    $nestedQuery->where('transaction_details.product_name', 'like', "%{$value}%")
                        ->orWhere('products.sku', 'like', "%{$value}%");
                });
            });
    }

    private function summary(array $filters): array
    {
        $summary = $this->detailQuery($filters)
            ->selectRaw('SUM(transaction_details.subtotal) as revenue')
            ->selectRaw('SUM(transaction_details.buy_price * transaction_details.quantity) as cogs')
            ->first();

        $revenue = (float) ($summary->revenue ?? 0);
        $cogs = (float) ($summary->cogs ?? 0);
        $profit = $revenue - $cogs;

        return [
            'revenue' => $revenue,
            'cogs' => $cogs,
            'gross_profit' => $profit,
            'margin' => $revenue > 0 ? ($profit / $revenue) * 100 : 0,
        ];
    }

    private function productBreakdown(array $filters): Builder
    {
        return $this->detailQuery($filters)
            ->select([
                'transaction_details.product_id',
                'transaction_details.product_name',
                'products.sku',
                'categories.name as category_name',
            ])
            ->selectRaw('SUM(transaction_details.quantity) as quantity')
            ->selectRaw('SUM(transaction_details.subtotal) as revenue')
            ->selectRaw('SUM(transaction_details.buy_price * transaction_details.quantity) as cogs')
            ->selectRaw('SUM(transaction_details.subtotal - (transaction_details.buy_price * transaction_details.quantity)) as gross_profit')
            ->groupBy('transaction_details.product_id', 'transaction_details.product_name', 'products.sku', 'categories.name')
            ->orderByDesc('gross_profit');
    }

    private function dailyProfit(array $filters): array
    {
        return $this->detailQuery($filters)
            ->selectRaw('DATE(transactions.created_at) as date')
            ->selectRaw('SUM(transaction_details.subtotal) as revenue')
            ->selectRaw('SUM(transaction_details.buy_price * transaction_details.quantity) as cogs')
            ->selectRaw('SUM(transaction_details.subtotal - (transaction_details.buy_price * transaction_details.quantity)) as gross_profit')
            ->groupBy('date')->orderBy('date')->get()->map(fn ($row) => [
                'date' => $row->date,
                'revenue' => (float) $row->revenue,
                'cogs' => (float) $row->cogs,
                'gross_profit' => (float) $row->gross_profit,
            ])->all();
    }

    private function categoryProfit(array $filters): array
    {
        return $this->detailQuery($filters)
            ->selectRaw('COALESCE(categories.name, \'Tanpa Kategori\') as category_name')
            ->selectRaw('SUM(transaction_details.subtotal - (transaction_details.buy_price * transaction_details.quantity)) as gross_profit')
            ->groupBy('category_name')->orderByDesc('gross_profit')->get()->map(fn ($row) => [
                'name' => $row->category_name,
                'gross_profit' => (float) $row->gross_profit,
            ])->all();
    }

    private function previousFilters(array $filters): array
    {
        $start = Carbon::parse($filters['start_date']);
        $end = Carbon::parse($filters['end_date']);
        $days = $start->diffInDays($end) + 1;
        $previousEnd = $start->copy()->subDay();

        return [
            ...$filters,
            'start_date' => $previousEnd->copy()->subDays($days - 1)->toDateString(),
            'end_date' => $previousEnd->toDateString(),
        ];
    }

    private function comparison(array $current, array $previous): array
    {
        return collect(['revenue', 'cogs', 'gross_profit', 'margin'])->mapWithKeys(function (string $key) use ($current, $previous): array {
            $oldValue = (float) $previous[$key];
            $newValue = (float) $current[$key];

            return [$key => $oldValue == 0 ? null : (($newValue - $oldValue) / abs($oldValue)) * 100];
        })->all();
    }
}
