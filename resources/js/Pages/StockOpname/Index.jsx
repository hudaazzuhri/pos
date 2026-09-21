import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import { Head, Link, router } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import SelectInput from "@/Components/SelectInput";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";

const statusLabels = [
    { value: "draft", label: "Draft" },
    { value: "completed", label: "Selesai" },
    { value: "canceled", label: "Dibatalkan" }
];
const statusClasses = {
    draft: "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
    canceled: "bg-red-50 text-red-700",
};

export default function StockOpnameIndex({ opnames, search = "", filters = {} }) {
    const [status, setStatus] = useState(filters.status ?? "");
    const [searchTerm, setSearchTerm] = useState(search);
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

    const resetFilters = () => {
        setSearchTerm("");
        setStatus("");
        setDateFrom("");
        setDateTo("");

        router.get(
            route("stock-opname.index"),
            {},
            {
                preserveState: true,
                replace: true,
            },
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

    const hasActiveFilters =
        searchTerm.trim() !== "" || status !== "" || dateFrom !== "" || dateTo !== "";
    const filterContent = (
        <div className="flex justify-end">
            <Popover>
                <PopoverTrigger
                    className={[
                        "relative rounded-md border px-4 py-2 text-sm font-medium transition",
                        hasActiveFilters
                            ? "border-orange-300 bg-orange-200 text-black hover:bg-orange-100"
                            : "border-orange-200 bg-orange-50 text-black hover:bg-orange-100",
                    ].join(" ")}
                >
                    <span className="flex items-center gap-2">
                        <span>Filter</span>
                        {hasActiveFilters && (
                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                        )}
                    </span>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-80 p-4">
                    <form onSubmit={applyFilters} className="space-y-3">
                        <SelectInput
                            label="Status"
                            value={
                                statusLabels.find(
                                    (option) => option.value === status)
                            }
                            onChange={(event) => setStatus(event.value)}
                            options={statusLabels}
                        />
                        <Input
                            label="Dari tanggal"
                            type="date"
                            value={dateFrom}
                            onChange={(event) =>
                                setDateFrom(event.target.value)
                            }
                        />
                        <Input
                            label="Sampai tanggal"
                            type="date"
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                onClick={resetFilters}
                                variant="cancel"
                            >
                                Reset
                            </Button>
                            <Button type="submit" variant="primary">
                                Terapkan
                            </Button>
                        </div>
                    </form>
                </PopoverContent>
            </Popover>
        </div>
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
                search={{
                    value: searchTerm,
                    onChange: (event) => setSearchTerm(event.target.value),
                    onSubmit: applyFilters,
                    placeholder: "Cari nomor...",
                }}
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
