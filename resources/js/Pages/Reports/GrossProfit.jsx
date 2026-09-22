import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import { formatCurrency } from "@/Helper/helper";
import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    Download,
    FileText,
    Filter,
    TrendingDown,
    TrendingUp,
    Wallet,
    Percent,
    Receipt,
} from "lucide-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const colors = [
    "#4f46e5",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#0ea5e9",
    "#8b5cf6",
];

const toDate = (date) => date.toISOString().slice(0, 10);
const filterQuery = (filters) =>
    new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value),
    ).toString();

export default function GrossProfitReport({
    filters: initialFilters,
    summary,
    dailyProfit = [],
    categoryProfit = [],
    products,
    outlets = [],
    categories = [],
}) {
    const [filters, setFilters] = useState(initialFilters);
    const [sort, setSort] = useState("gross_profit");
    const rows = useMemo(
        () =>
            [...(products?.data ?? [])].sort(
                (a, b) => Number(b[sort] ?? 0) - Number(a[sort] ?? 0),
            ),
        [products, sort],
    );

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route("reports.gross-profit"), filters, {
            preserveState: true,
            replace: true,
        });
    };

    const setRange = (start, end) =>
        setFilters((current) => ({
            ...current,
            start_date: start,
            end_date: end,
        }));
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const quarterStart = new Date(
        today.getFullYear(),
        Math.floor(today.getMonth() / 3) * 3,
        1,
    );
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const exportUrl = (name) => `${route(name)}?${filterQuery(filters)}`;
    const productColumns = useMemo(
        () => [
            {
                accessorKey: "category_name",
                header: "Kategori",
                cell: ({ row }) =>
                    row.original.category_name || "Tanpa Kategori",
            },
            {
                accessorKey: "product_name",
                header: "Produk / SKU",
                cell: ({ row }) => (
                    <div>
                        <p className="font-medium text-slate-900">
                            {row.original.product_name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {row.original.sku || "-"}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "quantity",
                header: "Qty",
                cell: ({ row }) =>
                    Number(row.original.quantity).toLocaleString("id-ID"),
            },
            {
                accessorKey: "revenue",
                header: "Omzet",
                cell: ({ row }) => formatCurrency(row.original.revenue),
            },
            {
                accessorKey: "cogs",
                header: "HPP",
                cell: ({ row }) => (
                    <span className="text-rose-700">
                        {formatCurrency(row.original.cogs)}
                    </span>
                ),
            },
            {
                accessorKey: "gross_profit",
                header: "Laba Kotor",
                cell: ({ row }) => (
                    <span className="font-semibold text-emerald-700">
                        {formatCurrency(row.original.gross_profit)}
                    </span>
                ),
            },
            {
                id: "margin",
                header: "Marjin",
                cell: ({ row }) => {
                    const product = row.original;
                    const margin =
                        product.revenue > 0
                            ? (product.gross_profit / product.revenue) * 100
                            : 0;
                    const barColor =
                        margin > 30
                            ? "bg-emerald-500"
                            : margin >= 10
                              ? "bg-amber-500"
                              : "bg-red-500";
                    const textColor =
                        margin > 30
                            ? "text-emerald-700"
                            : margin >= 10
                              ? "text-amber-700"
                              : "text-red-700";

                    return (
                        <div className="flex min-w-40 items-center gap-2">
                            <div className="h-2 flex-1 rounded-full bg-slate-100">
                                <div
                                    className={`h-2 rounded-full ${barColor}`}
                                    style={{
                                        width: `${Math.min(Math.max(margin, 0), 100)}%`,
                                    }}
                                />
                            </div>
                            <span className={`text-xs font-semibold ${textColor}`}>
                                {margin.toFixed(1)}%
                            </span>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Laba Kotor" />
            <PageHeader
                title="Laporan Laba Kotor"
                subtitle="Analisis HPP dan marjin keuntungan berdasarkan histori transaksi"
            />

            <div className="space-y-4">
                <form
                    onSubmit={applyFilters}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <QuickButton
                            label="Hari Ini"
                            onClick={() =>
                                setRange(toDate(today), toDate(today))
                            }
                        />
                        <QuickButton
                            label="Bulan Ini"
                            onClick={() =>
                                setRange(toDate(monthStart), toDate(today))
                            }
                        />
                        <QuickButton
                            label="Kuartal Ini"
                            onClick={() =>
                                setRange(toDate(quarterStart), toDate(today))
                            }
                        />
                        <QuickButton
                            label="Tahun Ini"
                            onClick={() =>
                                setRange(toDate(yearStart), toDate(today))
                            }
                        />
                        <div className="ml-auto flex gap-2">
                            <a
                                href={exportUrl("reports.gross-profit.excel")}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                <Download className="h-4 w-4" /> Excel
                            </a>
                            <a
                                href={exportUrl("reports.gross-profit.pdf")}
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
                            Kategori
                            <select
                                value={filters.category_id}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        category_id: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full rounded-lg border-slate-200 text-sm"
                            >
                                <option value="">Semua kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm text-slate-600">
                            Cari produk / SKU
                            <input
                                type="search"
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        search: e.target.value,
                                    })
                                }
                                placeholder="Nama atau SKU"
                                className="mt-1 block w-full rounded-lg border-slate-200 text-sm"
                            />
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
                    <Metric
                        label="Total Omzet"
                        value={summary.revenue}
                        change={summary.comparison?.revenue}
                        icon={TrendingUp}
                        color="indigo"
                    />
                    <Metric
                        label="Total HPP / COGS"
                        value={summary.cogs}
                        change={summary.comparison?.cogs}
                        icon={Receipt}
                        color="rose"
                    />
                    <Metric
                        label="Laba Kotor"
                        value={summary.gross_profit}
                        change={summary.comparison?.gross_profit}
                        icon={Wallet}
                        color="emerald"
                    />
                    <Metric
                        label="Marjin Laba"
                        value={summary.margin}
                        change={summary.comparison?.margin}
                        icon={Percent}
                        color="amber"
                        percent
                    />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="font-semibold text-slate-900">
                            Tren HPP vs Laba Kotor
                        </h2>
                        <p className="text-sm text-slate-500">
                            Revenue, biaya modal, dan laba per hari
                        </p>
                        <div className="mt-4 h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyProfit}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
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
                                    <Legend />
                                    <Bar
                                        dataKey="revenue"
                                        name="Revenue"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="cogs"
                                        name="HPP"
                                        fill="#ef4444"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="gross_profit"
                                        name="Laba Kotor"
                                        fill="#4f46e5"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="font-semibold text-slate-900">
                            Kontribusi Laba per Kategori
                        </h2>
                        <div className="mt-3 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryProfit}
                                        dataKey="gross_profit"
                                        nameKey="name"
                                        innerRadius={56}
                                        outerRadius={88}
                                        paddingAngle={3}
                                    >
                                        {categoryProfit.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={
                                                    colors[
                                                        index % colors.length
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
                        <div className="space-y-2">
                            {categoryProfit.slice(0, 6).map((item, index) => (
                                <div
                                    key={item.name}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    colors[
                                                        index % colors.length
                                                    ],
                                            }}
                                        />
                                        {item.name}
                                    </span>
                                    <strong>
                                        {formatCurrency(item.gross_profit)}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <DataTable
                    data={rows}
                    columns={productColumns}
                    topContent={
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Breakdown Laba per Produk
                                </h2>
                                <p className="text-sm text-slate-500">
                                    HPP menggunakan snapshot saat transaksi terjadi.
                                </p>
                            </div>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="rounded-lg border-slate-200 text-sm"
                            >
                                <option value="gross_profit">Laba terbesar</option>
                                <option value="revenue">Omzet terbesar</option>
                                <option value="quantity">Qty terbanyak</option>
                                <option value="cogs">HPP terbesar</option>
                            </select>
                        </div>
                    }
                    emptyMessage="Belum ada data laba produk."
                    total={products?.total ?? 0}
                    from={products?.from ?? 0}
                    to={products?.to ?? 0}
                    paginationLinks={products?.links ?? []}
                />
            </div>
        </AuthenticatedLayout>
    );
}

function QuickButton({ label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
        >
            {label}
        </button>
    );
}
function Metric({ label, value, change, icon: Icon, color, percent = false }) {
    const palette = {
        indigo: "bg-indigo-50 text-indigo-700",
        rose: "bg-rose-50 text-rose-700",
        emerald: "bg-emerald-50 text-emerald-700",
        amber: "bg-amber-50 text-amber-700",
    };
    const positive = Number(change) >= 0;
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{label}</span>
                <span className={`rounded-lg p-2 ${palette[color]}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900">
                {percent
                    ? `${Number(value).toFixed(1)}%`
                    : formatCurrency(value)}
            </p>
            {change !== null && change !== undefined && (
                <p
                    className={`mt-2 flex items-center gap-1 text-xs font-semibold ${positive ? "text-emerald-600" : "text-red-600"}`}
                >
                    {positive ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(Number(change)).toFixed(1)}% vs periode sebelumnya
                </p>
            )}
        </div>
    );
}
