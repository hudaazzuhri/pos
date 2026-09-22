import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import { formatCurrency, formatDateTime } from "@/Helper/helper";
import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    Download,
    FileText,
    Filter,
    TrendingUp,
    Wallet,
    ShoppingBag,
    Receipt,
    X,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const paymentLabels = {
    cash: "Cash",
    qris: "QRIS",
    bank_transfer: "Transfer",
    debit: "Debit",
};
const chartColors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

const queryString = (filters) =>
    new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value),
    ).toString();

export default function SalesReport({
    filters: initialFilters,
    summary,
    dailySales = [],
    paymentBreakdown = [],
    topProducts = [],
    cashierPerformance = [],
    transactions,
    outlets = [],
    cashiers = [],
}) {
    const [filters, setFilters] = useState(initialFilters);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route("reports.sales"), filters, {
            preserveState: true,
            replace: true,
        });
    };

    const setRange = (start, end) => {
        setFilters((current) => ({
            ...current,
            start_date: start,
            end_date: end,
        }));
    };

    const today = new Date();
    const todayValue = today.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
    );
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const exportUrl = (name) => `${route(name)}?${queryString(filters)}`;
    const paymentData = useMemo(
        () =>
            paymentBreakdown.map((item) => ({
                ...item,
                label: paymentLabels[item.name] || item.name,
            })),
        [paymentBreakdown],
    );
    const transactionColumns = useMemo(
        () => [
            {
                accessorKey: "invoice_number",
                header: "Invoice",
                cell: ({ row }) => (
                    <span className="font-semibold text-indigo-700">
                        {row.original.invoice_number}
                    </span>
                ),
            },
            {
                accessorKey: "created_at",
                header: "Tanggal",
                cell: ({ row }) => (
                    <span className="whitespace-nowrap text-slate-600">
                        {formatDateTime(row.original.created_at)}
                    </span>
                ),
            },
            {
                accessorKey: "user",
                header: "Kasir",
                cell: ({ row }) => row.original.user?.name || "-",
            },
            {
                accessorKey: "outlet",
                header: "Outlet",
                cell: ({ row }) => row.original.outlet?.name || "-",
            },
            {
                accessorKey: "payment_method",
                header: "Pembayaran",
                cell: ({ row }) =>
                    paymentLabels[row.original.payment_method] ||
                    row.original.payment_method,
            },
            {
                accessorKey: "total_amount",
                header: "Total",
                cell: ({ row }) => (
                    <span className="font-medium">
                        {formatCurrency(row.original.total_amount)}
                    </span>
                ),
            },
            {
                accessorKey: "gross_profit",
                header: "Laba",
                cell: ({ row }) => (
                    <span className="text-emerald-700">
                        {formatCurrency(row.original.gross_profit)}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <span
                        className={
                            row.original.status === "completed"
                                ? "rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                                : "rounded-full bg-red-50 px-2 py-1 text-xs text-red-700"
                        }
                    >
                        {row.original.status}
                    </span>
                ),
            },
        ],
        [],
    );

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Penjualan" />
            <PageHeader
                title="Laporan Penjualan"
                subtitle="Analisis performa penjualan dan profit bisnis"
            />

            <div className="space-y-4">
                <form
                    onSubmit={applyFilters}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        {[
                            ["Hari Ini", todayValue, todayValue],
                            [
                                "7 Hari",
                                sevenDaysAgo.toISOString().slice(0, 10),
                                todayValue,
                            ],
                            [
                                "Bulan Ini",
                                monthStart.toISOString().slice(0, 10),
                                todayValue,
                            ],
                            [
                                "Bulan Lalu",
                                previousMonthStart.toISOString().slice(0, 10),
                                previousMonthEnd.toISOString().slice(0, 10),
                            ],
                        ].map(([label, start, end]) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setRange(start, end)}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                            >
                                {label}
                            </button>
                        ))}
                        <div className="ml-auto flex flex-wrap gap-2">
                            <a
                                href={exportUrl("reports.sales.excel")}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                <Download className="h-4 w-4" /> Excel
                            </a>
                            <a
                                href={exportUrl("reports.sales.pdf")}
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900"
                            >
                                <FileText className="h-4 w-4" /> PDF
                            </a>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                        <label className="text-sm text-slate-600">
                            Mulai
                            <input
                                type="date"
                                value={filters.start_date}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        start_date: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-lg border-slate-200 text-sm"
                            />
                        </label>
                        <label className="text-sm text-slate-600">
                            Sampai
                            <input
                                type="date"
                                value={filters.end_date}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        end_date: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-lg border-slate-200 text-sm"
                            />
                        </label>
                        <label className="text-sm text-slate-600">
                            Outlet
                            <select
                                value={filters.outlet_id}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        outlet_id: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-lg border-slate-200 text-sm"
                            >
                                <option value="">Semua outlet</option>
                                {outlets.map((outlet) => (
                                    <option key={outlet.id} value={outlet.id}>
                                        {outlet.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm text-slate-600">
                            Pembayaran
                            <select
                                value={filters.payment_method}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        payment_method: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-lg border-slate-200 text-sm"
                            >
                                <option value="">Semua metode</option>
                                {Object.entries(paymentLabels).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>
                        <label className="text-sm text-slate-600">
                            Kasir
                            <select
                                value={filters.cashier_id}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        cashier_id: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-lg border-slate-200 text-sm"
                            >
                                <option value="">Semua kasir</option>
                                {cashiers.map((cashier) => (
                                    <option key={cashier.id} value={cashier.id}>
                                        {cashier.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Terapkan Filter
                    </button>
                </form>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Omzet Gross"
                        value={summary.gross_sales}
                        icon={TrendingUp}
                        color="indigo"
                    />
                    <MetricCard
                        label="Laba Kotor"
                        value={summary.gross_profit}
                        icon={Wallet}
                        color="emerald"
                    />
                    <MetricCard
                        label="Total Transaksi"
                        value={summary.transaction_count}
                        icon={Receipt}
                        color="amber"
                        isNumber
                    />
                    <MetricCard
                        label="Rata-rata Transaksi"
                        value={summary.aov}
                        icon={ShoppingBag}
                        color="rose"
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5">
                            <h2 className="font-semibold text-slate-900">
                                Tren Penjualan Harian
                            </h2>
                            <p className="text-sm text-slate-500">
                                Omzet dan jumlah transaksi pada periode aktif
                            </p>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailySales}>
                                    <defs>
                                        <linearGradient
                                            id="salesFill"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#4f46e5"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#4f46e5"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) =>
                                            value.slice(5)
                                        }
                                    />
                                    <YAxis
                                        tickFormatter={(value) =>
                                            `${Math.round(value / 1000)}k`
                                        }
                                    />
                                    <Tooltip
                                        formatter={(value) =>
                                            formatCurrency(value)
                                        }
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#4f46e5"
                                        fill="url(#salesFill)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="font-semibold text-slate-900">
                            Metode Pembayaran
                        </h2>
                        <div className="mt-3 grid items-center gap-3 sm:grid-cols-2">
                            <div className="h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentData}
                                            dataKey="total"
                                            nameKey="label"
                                            innerRadius={52}
                                            outerRadius={78}
                                            paddingAngle={3}
                                        >
                                            {paymentData.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={
                                                        chartColors[
                                                            index %
                                                                chartColors.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) =>
                                                formatCurrency(value)
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {paymentData.map((item, index) => (
                                    <div
                                        key={item.name}
                                        className="flex items-center justify-between gap-3 text-sm"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        chartColors[
                                                            index %
                                                                chartColors.length
                                                        ],
                                                }}
                                            />
                                            {item.label}
                                        </span>
                                        <strong>
                                            {formatCurrency(item.total)}
                                        </strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Ranking
                        title="5 Produk Terlaris"
                        rows={topProducts}
                        valueKey="revenue"
                    />
                    <Ranking
                        title="Performa Kasir"
                        rows={cashierPerformance}
                        valueKey="total"
                    />
                </div>

                <DataTable
                    data={transactions.data}
                    columns={transactionColumns}
                    topContent={
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Histori Transaksi
                            </h2>
                            <p className="text-sm text-slate-500">
                                Klik transaksi untuk melihat rincian struk dan margin.
                            </p>
                        </div>
                    }
                    emptyMessage="Belum ada transaksi pada periode ini."
                    total={transactions.total}
                    from={transactions.from}
                    to={transactions.to}
                    paginationLinks={transactions.links}
                    onRowClick={setSelectedTransaction}
                />
            </div>

            {selectedTransaction && (
                <TransactionModal
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

function MetricCard({ label, value, icon: Icon, color, isNumber = false }) {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-700",
        emerald: "bg-emerald-50 text-emerald-700",
        amber: "bg-amber-50 text-amber-700",
        rose: "bg-rose-50 text-rose-700",
    };
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{label}</span>
                <span className={`rounded-lg p-2 ${colors[color]}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">
                {isNumber
                    ? value.toLocaleString("id-ID")
                    : formatCurrency(value)}
            </p>
        </div>
    );
}

function Ranking({ title, rows, valueKey }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <div className="mt-4 space-y-3">
                {rows.length ? (
                    rows.map((row, index) => (
                        <div
                            key={`${row.name}-${index}`}
                            className="flex items-center gap-3"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                                {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">
                                    {row.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {row.quantity
                                        ? `${row.quantity} item`
                                        : `${row.transactions} transaksi`}
                                </p>
                            </div>
                            <strong className="text-sm text-slate-900">
                                {formatCurrency(row[valueKey])}
                            </strong>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-500">Belum ada data.</p>
                )}
            </div>
        </section>
    );
}

function TransactionModal({ transaction, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                            Detail Struk
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            {transaction.invoice_number}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-slate-100 p-2 text-slate-500"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="mt-5 divide-y divide-slate-100">
                    {(transaction.details || []).map((detail) => (
                        <div
                            key={detail.id}
                            className="flex items-start justify-between gap-4 py-3"
                        >
                            <div>
                                <p className="font-medium text-slate-800">
                                    {detail.product_name}
                                    {detail.variant_name
                                        ? ` - ${detail.variant_name}`
                                        : ""}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {detail.quantity} x{" "}
                                    {formatCurrency(detail.sell_price)} · HPP{" "}
                                    {formatCurrency(detail.buy_price)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">
                                    {formatCurrency(detail.subtotal)}
                                </p>
                                <p className="text-xs text-emerald-700">
                                    Margin{" "}
                                    {formatCurrency(
                                        detail.subtotal -
                                            detail.buy_price * detail.quantity,
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(transaction.total_amount)}</span>
                </div>
            </div>
        </div>
    );
}
