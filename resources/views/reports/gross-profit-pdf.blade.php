<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Laporan Laba Kotor</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }
        h1 { margin-bottom: 4px; }
        .muted { color: #64748b; }
        .summary td, th, td { border: 1px solid #cbd5e1; padding: 6px; }
        .summary { width: 100%; margin: 18px 0; border-collapse: collapse; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f1f5f9; text-align: left; }
        .right { text-align: right; }
    </style>
</head>
<body>
    <h1>Laporan Laba Kotor</h1>
    <div class="muted">Periode: {{ $filters['start_date'] }} sampai {{ $filters['end_date'] }}</div>
    <table class="summary">
        <tr>
            <td><strong>Revenue</strong><br>{{ number_format($summary['revenue'], 0, ',', '.') }}</td>
            <td><strong>HPP / COGS</strong><br>{{ number_format($summary['cogs'], 0, ',', '.') }}</td>
            <td><strong>Laba Kotor</strong><br>{{ number_format($summary['gross_profit'], 0, ',', '.') }}</td>
            <td><strong>Margin</strong><br>{{ number_format($summary['margin'], 1, ',', '.') }}%</td>
        </tr>
    </table>
    <table>
        <thead><tr><th>Kategori</th><th>Produk</th><th>SKU</th><th class="right">Qty</th><th class="right">Revenue</th><th class="right">HPP</th><th class="right">Laba</th><th class="right">Margin</th></tr></thead>
        <tbody>
            @foreach ($products as $product)
                <tr>
                    <td>{{ $product->category_name ?? 'Tanpa Kategori' }}</td>
                    <td>{{ $product->product_name }}</td>
                    <td>{{ $product->sku ?? '-' }}</td>
                    <td class="right">{{ $product->quantity }}</td>
                    <td class="right">{{ number_format($product->revenue, 0, ',', '.') }}</td>
                    <td class="right">{{ number_format($product->cogs, 0, ',', '.') }}</td>
                    <td class="right">{{ number_format($product->gross_profit, 0, ',', '.') }}</td>
                    <td class="right">{{ number_format($product->revenue > 0 ? ($product->gross_profit / $product->revenue) * 100 : 0, 1, ',', '.') }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
