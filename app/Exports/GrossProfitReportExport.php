<?php

namespace App\Exports;

use App\Models\TransactionDetail;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class GrossProfitReportExport implements FromCollection, WithHeadings
{
    public function __construct(private readonly array $filters) {}

    public function collection(): Collection
    {
        return TransactionDetail::query()
            ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->leftJoin('products', 'products.id', '=', 'transaction_details.product_id')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$this->filters['start_date'], $this->filters['end_date'].' 23:59:59'])
            ->when($this->filters['outlet_id'], fn ($query, $value) => $query->where('transactions.outlet_id', $value))
            ->when($this->filters['category_id'], fn ($query, $value) => $query->where('products.category_id', $value))
            ->when($this->filters['search'], function ($query, string $value): void {
                $query->where(function ($nestedQuery) use ($value): void {
                    $nestedQuery->where('transaction_details.product_name', 'like', "%{$value}%")
                        ->orWhere('products.sku', 'like', "%{$value}%");
                });
            })
            ->select([
                'transaction_details.product_name',
                'products.sku',
                'categories.name as category_name',
            ])
            ->selectRaw('SUM(transaction_details.quantity) as quantity')
            ->selectRaw('SUM(transaction_details.subtotal) as revenue')
            ->selectRaw('SUM(transaction_details.buy_price * transaction_details.quantity) as cogs')
            ->selectRaw('SUM(transaction_details.subtotal - (transaction_details.buy_price * transaction_details.quantity)) as gross_profit')
            ->groupBy('transaction_details.product_name', 'products.sku', 'categories.name')
            ->orderByDesc('gross_profit')
            ->get()
            ->map(fn ($row): array => [
                $row->category_name ?? 'Tanpa Kategori',
                $row->product_name,
                $row->sku ?? '-',
                (int) $row->quantity,
                (float) $row->revenue,
                (float) $row->cogs,
                (float) $row->gross_profit,
                $row->revenue > 0 ? ((float) $row->gross_profit / (float) $row->revenue) * 100 : 0,
            ]);
    }

    public function headings(): array
    {
        return ['Kategori', 'Produk', 'SKU', 'Qty Terjual', 'Revenue', 'HPP/COGS', 'Laba Kotor', 'Margin %'];
    }
}
