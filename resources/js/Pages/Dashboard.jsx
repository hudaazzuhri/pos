import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    ExternalLink,
    Receipt,
    ShoppingBag,
    Store,
    TrendingUp,
    Users,
    WalletCards,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
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
const paymentColors = ["#0f766e", "#f59e0b", "#2563eb", "#e11d48"];
const currency = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value || 0);
const number = (value) => new Intl.NumberFormat("id-ID").format(value || 0);
const shortDate = (value) =>
    new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(
        new Date(value),
    );
const time = (value) =>
    value
        ? new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(value))
        : "-";

export default function Dashboard({
    filters,
    outlets = [],
    summary,
    salesTrend = [],
    hourlySales = [],
    paymentBreakdown = [],
    outletPerformance = [],
    topProducts = [],
    lowStockProducts = [],
    activeShifts = [],
    subscription,
}) {
    const { auth } = usePage().props;
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        const interval = window.setInterval(() => setClock(new Date()), 1000);
        const refresh = window.setInterval(
            () => router.reload({ preserveScroll: true, preserveState: true }),
            60000,
        );

        return () => {
            window.clearInterval(refresh);
            window.clearInterval(interval);
        };
    }, []);

    const applyOutlet = (event) => {
        router.get(
            route("dashboard"),
            { outlet_id: event.target.value },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };
    const isPositive = summary.revenue_growth >= 0;
    const paymentData = paymentBreakdown.map((item) => ({
        ...item,
        label: paymentLabels[item.name] || item.name,
    }));
    const maxProductRevenue = Math.max(
        ...topProducts.map((item) => item.revenue),
        1,
    );

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="space-y-3">
                <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                            Halo, {auth.user.name}!
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Pantau kesehatan toko dan ambil keputusan lebih
                            cepat hari ini.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />{" "}
                            Live ·{" "}
                            {clock.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                        {outlets.length > 0 && (
                            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                                <Store className="h-4 w-4 text-slate-400" />
                                <select
                                    value={filters.outlet_id || ""}
                                    onChange={applyOutlet}
                                    className="border-0 bg-transparent py-0 pl-0 pr-7 text-sm font-semibold text-slate-800 focus:ring-0"
                                >
                                    {auth.user.role === "owner" && (
                                        <option value="">Semua Outlet</option>
                                    )}
                                    {outlets.map((outlet) => (
                                        <option
                                            key={outlet.id}
                                            value={outlet.id}
                                        >
                                            {outlet.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                </header>

                {subscription.days_remaining > 0 &&
                    subscription.days_remaining < 7 && (
                        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                <div>
                                    <p className="font-semibold">
                                        Langganan {subscription.package_name}{" "}
                                        segera berakhir
                                    </p>
                                    <p className="mt-0.5 text-sm text-amber-800">
                                        Masa aktif tersisa{" "}
                                        {subscription.days_remaining} hari.
                                        Perpanjang agar operasional tetap
                                        berjalan.
                                    </p>
                                </div>
                            </div>
                            <a
                                href={route("subscriptions.index")}
                                className="inline-flex items-center gap-2 text-sm font-bold text-amber-800 hover:text-amber-950"
                            >
                                Kelola langganan{" "}
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    )}

                <section className="!mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Omzet Hari Ini"
                        value={currency(summary.revenue)}
                        icon={TrendingUp}
                        tone="teal"
                        growth={summary.revenue_growth}
                        positive={isPositive}
                    />
                    <StatCard
                        label="Laba Kotor"
                        value={currency(summary.gross_profit)}
                        icon={WalletCards}
                        tone="emerald"
                    />
                    <StatCard
                        label="Total Transaksi"
                        value={number(summary.transactions)}
                        icon={Receipt}
                        tone="amber"
                    />
                    <StatCard
                        label="Rata-rata Transaksi"
                        value={currency(summary.aov)}
                        icon={ShoppingBag}
                        tone="rose"
                    />
                </section>

                <section className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
                    <Panel
                        title="Tren Penjualan"
                        subtitle="Performa 7 hari terakhir"
                    >
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={salesTrend}
                                    margin={{
                                        top: 8,
                                        right: 8,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
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
                                                stopColor="#0f766e"
                                                stopOpacity={0.25}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#0f766e"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={shortDate}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                        tickFormatter={(value) =>
                                            `${Math.round(value / 1000)}k`
                                        }
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        name="Omzet"
                                        stroke="#0f766e"
                                        fill="url(#salesFill)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>
                    <Panel
                        title="Metode Pembayaran"
                        subtitle="Komposisi transaksi hari ini"
                    >
                        <div className="grid items-center gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                            <div className="h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentData}
                                            dataKey="total"
                                            nameKey="label"
                                            innerRadius={55}
                                            outerRadius={78}
                                            paddingAngle={4}
                                        >
                                            {paymentData.map((entry, index) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={
                                                        paymentColors[
                                                            index %
                                                                paymentColors.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) =>
                                                currency(value)
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                {paymentData.length ? (
                                    paymentData.map((item, index) => (
                                        <div
                                            key={item.name}
                                            className="flex items-center justify-between gap-3 text-sm"
                                        >
                                            <span className="flex items-center gap-2 text-slate-600">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            paymentColors[
                                                                index %
                                                                    paymentColors.length
                                                            ],
                                                    }}
                                                />
                                                {item.label}
                                            </span>
                                            <span className="font-bold text-slate-900">
                                                {currency(item.total)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                    <p className="text-sm text-slate-500">
                                        Belum ada transaksi.
                                    </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Panel>
                </section>

                <section className="grid gap-3 xl:grid-cols-[1.15fr_1fr]">
                    <Panel
                        title="Produk Terlaris"
                        subtitle="Top 5 berdasarkan unit terjual"
                    >
                        <div className="space-y-4">
                            {topProducts.length ? (
                                topProducts.map((product, index) => (
                                    <div key={`${product.name}-${index}`}>
                                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                                            <span className="flex min-w-0 items-center gap-3">
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-bold text-teal-700">
                                                    {index + 1}
                                                </span>
                                                <span className="truncate font-semibold text-slate-800">
                                                    {product.name}
                                                </span>
                                            </span>
                                            <span className="shrink-0 text-slate-500">
                                                {number(product.quantity)} item
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-teal-600"
                                                style={{
                                                    width: `${Math.max(8, (product.revenue / maxProductRevenue) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState text="Belum ada penjualan hari ini." />
                            )}
                        </div>
                    </Panel>
                    <Panel
                        title="Penjualan Per Outlet"
                        subtitle="Perbandingan omzet hari ini"
                    >
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={outletPerformance}
                                    layout="vertical"
                                    margin={{ left: 8, right: 12 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={90}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar
                                        dataKey="total"
                                        name="Omzet"
                                        fill="#2563eb"
                                        radius={[0, 6, 6, 0]}
                                        barSize={18}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>
                </section>

                <section className="grid gap-3 xl:grid-cols-[1.1fr_1fr]">
                    <Panel
                        title="Stok Menipis"
                        subtitle="Perlu perhatian sebelum penjualan terganggu"
                        action={
                            <a
                                href={route("stock.index")}
                                className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                            >
                                Lihat semua
                            </a>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-wide text-slate-400">
                                    <tr>
                                        <th className="pb-3 font-semibold">
                                            Produk
                                        </th>
                                        <th className="pb-3 font-semibold">
                                            Sisa
                                        </th>
                                        <th className="pb-3 text-right font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lowStockProducts.length ? (
                                        lowStockProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td className="py-3 font-semibold text-slate-800">
                                                    {product.name}
                                                    <span className="block text-xs font-normal text-slate-400">
                                                        Minimum{" "}
                                                        {
                                                            product.min_stock_alert
                                                        }
                                                    </span>
                                                </td>
                                                <td className="py-3">
                                                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                                                        {product.stock} tersisa
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <a
                                                        href={route(
                                                            "stock.adjustments.create",
                                                        )}
                                                        className="text-xs font-bold text-teal-700 hover:text-teal-900"
                                                    >
                                                        Restok / Opname
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3">
                                                <EmptyState text="Stok semua produk masih aman." />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                    <Panel
                        title="Shift Kasir Aktif"
                        subtitle="Kasir yang sedang bertugas"
                    >
                        <div className="space-y-3">
                            {activeShifts.length ? (
                                activeShifts.map((shift) => (
                                    <div
                                        key={shift.id}
                                        className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3"
                                    >
                                        {/* <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-600">
                                            {shift.user.name
                                                .slice(0, 1)
                                                .toUpperCase()}
                                        </div> */}
                                        <div className="min-w-0 flex-1">
                                            {/* <p className="truncate text-sm font-bold text-slate-800">
                                                {shift.user.name}
                                            </p> */}
                                            <p className="truncate text-xs text-slate-500">
                                                {shift.outlet?.name ||
                                                    "Tanpa outlet"}{" "}
                                                · buka {time(shift.opened_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-teal-700">
                                                {number(
                                                    shift.transaction_count,
                                                )}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                transaksi
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState text="Tidak ada shift yang aktif." />
                            )}
                        </div>
                    </Panel>
                </section>

                <section className="grid gap-3 lg:grid-cols-2">
                    <Panel
                        title="Aktivitas Per Jam"
                        subtitle="Distribusi omzet hari ini"
                    >
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlySales}>
                                    <XAxis
                                        dataKey="hour"
                                        interval={2}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 11 }}
                                    />
                                    <YAxis hide />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar
                                        dataKey="total"
                                        name="Omzet"
                                        fill="#f59e0b"
                                        radius={[5, 5, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>
                    <SubscriptionCard subscription={subscription} />
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, icon: Icon, tone, growth, positive }) {
    const tones = {
        teal: "bg-teal-50 text-teal-700",
        emerald: "bg-emerald-50 text-emerald-700",
        amber: "bg-amber-50 text-amber-700",
        rose: "bg-rose-50 text-rose-700",
    };
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-bold text-black">
                    {label}
                </span>
                <span className={`rounded-lg p-2.5 ${tones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
            <p className=" text-2xl font-bold tracking-tight text-slate-950">
                {value}
            </p>
            {growth !== undefined && (
                <span
                    className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${positive ? "text-emerald-600" : "text-rose-600"}`}
                >
                    {positive ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(growth)}% vs kemarin
                </span>
            )}
        </div>
    );
}

function Panel({ title, subtitle, action, children }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <h2 className="font-bold text-slate-950">{title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}
function EmptyState({ text }) {
    return <p className="py-8 text-center text-sm text-slate-500">{text}</p>;
}
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-semibold text-slate-500">{label}</p>
            <p className="mt-1 font-bold text-slate-900">
                {currency(payload[0].value)}
            </p>
        </div>
    );
}

function SubscriptionCard({ subscription }) {
    const usage = subscription.users_limit
        ? Math.min(
              100,
              (subscription.users_used / subscription.users_limit) * 100,
          )
        : 0;
    return (
        <Panel
            title="Langganan & Kuota"
            subtitle={`${subscription.package_name} · ${subscription.days_remaining} hari tersisa`}
        >
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-700">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">
                            Kuota pengguna
                        </p>
                        <p className="text-xs text-slate-500">
                            {number(subscription.users_used)} dari{" "}
                            {subscription.users_limit
                                ? number(subscription.users_limit)
                                : "-"}{" "}
                            pengguna
                        </p>
                    </div>
                </div>
                <div>
                    <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-500">
                        <span>Penggunaan</span>
                        <span>
                            {subscription.users_limit
                                ? `${Math.round(usage)}%`
                                : "Tidak terbatas"}
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${usage}%` }}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="h-4 w-4" />{" "}
                    {number(subscription.outlets_used)} outlet aktif
                </div>
            </div>
        </Panel>
    );
}
