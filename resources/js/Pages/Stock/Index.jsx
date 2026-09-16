import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import { Head, Link, router } from "@inertiajs/react";
import {
    AlertTriangle,
    ArrowDownToLine,
    ClipboardList,
    Package,
    Plus,
    RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";

const numberFormatter = new Intl.NumberFormat("id-ID");

function SummaryCard({ label, value, icon: Icon, tone }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                    {numberFormatter.format(value ?? 0)}
                </p>
            </div>
        </div>
    );
}

function StockStatus({ product }) {
    if (product.stock === 0)
        return (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                Habis
            </span>
        );
    if (product.stock <= product.min_stock_alert)
        return (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Menipis
            </span>
        );
    return (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Aman
        </span>
    );
}

export default function StockIndex({
    products,
    categories = [],
    search = "",
    category_id = "",
    summary = {},
}) {
    const rows = products?.data ?? [];
    const [searchTerm, setSearchTerm] = useState(search);
    const [selectedCategory, setSelectedCategory] = useState(category_id);

    const applyFilters = (event) => {
        event?.preventDefault();
        router.get(
            route("stock.index"),
            { search: searchTerm, category_id: selectedCategory },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        router.get(
            route("stock.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Produk",
                cell: ({ row }) => (
                    <div>
                        <p className="font-semibold text-slate-900">
                            {row.original.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {row.original.sku || "Tanpa SKU"}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "category",
                header: "Kategori",
                cell: ({ row }) => row.original.category?.name ?? "-",
            },
            {
                accessorKey: "stock",
                header: "Stok Saat Ini",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-900">
                        {numberFormatter.format(row.original.stock)}
                    </span>
                ),
            },
            {
                accessorKey: "min_stock_alert",
                header: "Batas Minimum",
                cell: ({ row }) =>
                    numberFormatter.format(row.original.min_stock_alert),
            },
            {
                id: "status",
                header: "Status",
                cell: ({ row }) => <StockStatus product={row.original} />,
            },
        ],
        [],
    );

    const filterContent = (
        <div className="flex gap-2">
            <select
                value={selectedCategory}
                onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    router.get(
                        route("stock.index"),
                        { search: searchTerm, category_id: event.target.value },
                        { preserveState: true, replace: true },
                    );
                }}
                className="h-10 rounded-md border-slate-300 text-sm"
            >
                <option value="">Semua kategori</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
            <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm text-slate-600 hover:bg-slate-50"
            >
                <RotateCcw className="h-4 w-4" />
                Reset
            </button>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Stok" />
            <PageHeader
                title="Manajemen Stok"
                subtitle="Pantau persediaan dan kelola penyesuaian stok."
                actions={
                    <div className="flex gap-2">
                        <Link
                            href={route("stock.movements.index")}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-indigo-50"
                        >
                            <ClipboardList className="h-4 w-4" />
                            Audit Mutasi
                        </Link>
                        <Link
                            href={route("stock.adjustments.create")}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            <Plus className="h-4 w-4" />
                            Penyesuaian Stok
                        </Link>
                    </div>
                }
            />
            <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Total Jenis Produk"
                        value={summary.product_types}
                        icon={Package}
                        tone="bg-indigo-50 text-indigo-600"
                    />
                    <SummaryCard
                        label="Total Item Stok"
                        value={summary.total_stock}
                        icon={ArrowDownToLine}
                        tone="bg-blue-50 text-blue-600"
                    />
                    <SummaryCard
                        label="Produk Stok Menipis"
                        value={summary.low_stock}
                        icon={AlertTriangle}
                        tone="bg-amber-50 text-amber-600"
                    />
                    <SummaryCard
                        label="Produk Stok Habis"
                        value={summary.out_of_stock}
                        icon={Package}
                        tone="bg-red-50 text-red-600"
                    />
                </div>
                <DataTable
                    data={rows}
                    columns={columns}
                    search={{
                        value: searchTerm,
                        onChange: (event) => setSearchTerm(event.target.value),
                        onSubmit: applyFilters,
                        placeholder: "Cari nama, SKU, atau barcode...",
                    }}
                    filters={filterContent}
                    emptyMessage="Tidak ada data stok."
                    total={products?.total ?? rows.length}
                    from={products?.from ?? 0}
                    to={products?.to ?? rows.length}
                    paginationLinks={products?.links ?? []}
                />
            </div>
        </AuthenticatedLayout>
    );
}
