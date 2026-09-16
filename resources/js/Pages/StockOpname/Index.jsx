import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import { Head, Link, router } from "@inertiajs/react";
import { ChevronRight, Search, View } from "lucide-react";
import { useMemo, useState } from "react";

const statusLabels = {
    draft: "Draft",
    completed: "Selesai",
    canceled: "Dibatalkan",
};
const statusClasses = {
    draft: "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
    canceled: "bg-red-50 text-red-700",
};

export default function StockOpnameIndex({ opnames, filters = {} }) {
    const [status, setStatus] = useState(filters.status ?? "");
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? "");
    const [dateTo, setDateTo] = useState(filters.date_to ?? "");

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(
            route("stock-opname.index"),
            { status, date_from: dateFrom, date_to: dateTo },
            { preserveState: true, replace: true },
        );
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "opname_number",
                header: "Nomor Opname",
                cell: ({ row }) => (
                    <div>
                        <p className="font-semibold text-slate-900">
                            {row.original.opname_number}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {new Date(row.original.created_at).toLocaleString(
                                "id-ID",
                            )}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "outlet",
                header: "Outlet",
                cell: ({ row }) => row.original.outlet?.name ?? "-",
            },
            {
                accessorKey: "user",
                header: "Dibuat Oleh",
                cell: ({ row }) => row.original.user?.name ?? "-",
            },
            {
                accessorKey: "total_items_checked",
                header: "Item",
            },
            {
                accessorKey: "total_discrepancy_qty",
                header: "Selisih Qty",
                cell: ({ row }) => {
                    const quantity = row.original.total_discrepancy_qty;

                    return (
                        <span
                            className={
                                quantity < 0
                                    ? "font-semibold text-red-600"
                                    : "font-semibold text-emerald-600"
                            }
                        >
                            {quantity > 0 ? "+" : ""}
                            {quantity}
                        </span>
                    );
                },
            },
            {
                accessorKey: "total_discrepancy_value",
                header: "Nilai Selisih",
                cell: ({ row }) =>
                    `Rp ${Number(row.original.total_discrepancy_value).toLocaleString("id-ID")}`,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[row.original.status]}`}
                    >
                        {statusLabels[row.original.status]}
                    </span>
                ),
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => (
                    <Link
                        href={route("stock-opname.show", row.original.id)}
                        className="rounded-md bg-green-50 h-8 w-8 flex items-center justify-center text-sm font-medium text-green-600 hover:bg-green-200"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                ),
            },
        ],
        [],
    );

    const filterContent = (
        <form
            onSubmit={applyFilters}
            className="flex flex-wrap items-end gap-3"
        >
            <div>
                <label className="text-xs font-semibold text-slate-500">
                    Status
                </label>
                <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="mt-1 block h-10 rounded-md border-slate-300 text-sm"
                >
                    <option value="">Semua status</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className="text-xs font-semibold text-slate-500">
                    Dari tanggal
                </label>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="mt-1 block h-10 rounded-md border-slate-300 text-sm"
                />
            </div>
            <div>
                <label className="text-xs font-semibold text-slate-500">
                    Sampai tanggal
                </label>
                <input
                    type="date"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                    className="mt-1 block h-10 rounded-md border-slate-300 text-sm"
                />
            </div>
            <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
            >
                <Search className="h-4 w-4" />
                Filter
            </button>
        </form>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Stock Opname" />
            <PageHeader
                title="Stock Opname"
                subtitle="Penghitungan dan audit stok fisik per outlet."
                actions={
                    <Link
                        href={route("stock-opname.create")}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        Buat Stock Opname
                    </Link>
                }
            />
            <DataTable
                data={opnames?.data ?? []}
                columns={columns}
                filters={filterContent}
                emptyMessage="Belum ada dokumen stock opname."
                total={opnames?.total ?? 0}
                from={opnames?.from ?? 0}
                to={opnames?.to ?? 0}
                paginationLinks={opnames?.links ?? []}
            />
        </AuthenticatedLayout>
    );
}
