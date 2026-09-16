<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }
        h1 { margin-bottom: 4px; }
        .muted { color: #64748b; }
        .summary { margin: 18px 0; }
        .summary td { padding: 8px; border: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; }
        th { background: #f1f5f9; }
        .right { text-align: right; }
    </style>
</head>
<body>
    <h1>Laporan Penjualan</h1>
    <div class="muted">Periode: {{ $filters['start_date'] }} sampai {{ $filters['end_date'] }}</div>

    <table class="summary">
        <tr>
            <td><strong>Omzet Gross</strong><br>{{ number_format($summary['gross_sales'], 0, ',', '.') }}</td>
            <td><strong>Laba Kotor</strong><br>{{ number_format($summary['gross_profit'], 0, ',', '.') }}</td>
            <td><strong>Total Transaksi</strong><br>{{ $summary['transaction_count'] }}</td>
            <td><strong>AOV</strong><br>{{ number_format($summary['aov'], 0, ',', '.') }}</td>
        </tr>
    </table>

    <table>
        <thead>
            <tr><th>Invoice</th><th>Tanggal</th><th>Kasir</th><th>Outlet</th><th>Metode</th><th>Status</th><th class="right">Total</th><th class="right">Laba</th></tr>
        </thead>
        <tbody>
            @foreach ($transactions as $transaction)
                <tr>
                    <td>{{ $transaction->invoice_number }}</td>
                    <td>{{ $transaction->created_at?->format('Y-m-d H:i') }}</td>
                    <td>{{ $transaction->user?->name }}</td>
                    <td>{{ $transaction->outlet?->name }}</td>
                    <td>{{ strtoupper($transaction->payment_method) }}</td>
                    <td>{{ ucfirst($transaction->status) }}</td>
                    <td class="right">{{ number_format($transaction->total_amount, 0, ',', '.') }}</td>
                    <td class="right">{{ number_format($transaction->gross_profit, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>