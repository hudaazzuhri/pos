<?php

namespace App\Exports;

use App\Models\Transaction;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SalesReportExport implements FromCollection, WithHeadings
{
    public function __construct(private readonly array $filters) {}

    public function collection(): Collection
    {
        return Transaction::query()
            ->with(['user:id,name', 'outlet:id,name', 'details'])
            ->whereBetween('created_at', [$this->filters['start_date'], $this->filters['end_date'].' 23:59:59'])
            ->when($this->filters['outlet_id'], fn ($query, $outletId) => $query->where('outlet_id', $outletId))
            ->when($this->filters['payment_method'], fn ($query, $method) => $query->where('payment_method', $method))
            ->when($this->filters['cashier_id'], fn ($query, $cashierId) => $query->where('user_id', $cashierId))
            ->latest('created_at')
            ->get()
            ->map(function (Transaction $transaction): array {
                return [
                    $transaction->invoice_number,
                    $transaction->created_at?->format('Y-m-d H:i:s'),
                    $transaction->user?->name,
                    $transaction->outlet?->name,
                    $transaction->payment_method,
                    $transaction->status,
                    $transaction->total_amount,
                    $transaction->details->sum(fn ($detail) => $detail->subtotal - ($detail->buy_price * $detail->quantity)),
                ];
            });
    }

    public function headings(): array
    {
        return ['Invoice', 'Tanggal', 'Kasir', 'Outlet', 'Metode Pembayaran', 'Status', 'Total', 'Laba Kotor'];
    }
}
