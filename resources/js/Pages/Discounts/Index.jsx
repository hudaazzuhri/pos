import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Head, Link, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    CheckCircle2,
    Edit2,
    Plus,
    Trash2,
    XCircle,
} from "lucide-react";
import { formatCurrency } from "@/Helper/helper";
import { Button } from "@/Components/ui/button";
import SelectInput from "@/Components/SelectInput";

export default function DiscountsIndex({
    discounts,
    filters = {},
}) {
    const rows = discounts?.data ?? [];
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || "all",
    );
    const statusOptions = [
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Non-Aktif" },
        { value: "expired", label: "Expired" },
    ];

    const applySearch = (event) => {
        event.preventDefault();
        router.get(
            route("discounts.index"),
            { search: searchTerm, status: selectedStatus },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const applyFilter = (event) => {
        event.preventDefault();
        router.get(
            route("discounts.index"),
            { search: searchTerm, status: selectedStatus },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedStatus("all");
        router.get(
            route("discounts.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const toggleStatus = (discount) => {
        router.patch(
            route("discounts.toggleStatus", discount.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const deleteDiscount = (discount) => {
        if (!window.confirm(`Hapus diskon "${discount.name}"?`)) return;
        router.delete(route("discounts.destroy", discount.id), {
            preserveScroll: true,
        });
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Nama Promo"
            },
            {
                accessorKey: "value",
                header: "Tipe & Nilai",
                cell: ({ row }) => (
                    <div>
                        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                            {row.original.type === "percentage"
                                ? `${row.original.value}%`
                                : formatCurrency(row.original.value)}
                        </span>
                        {row.original.max_discount_amount &&
                            row.original.type === "percentage" && (
                                <p className="mt-2 text-xs text-slate-500">
                                    Maks.{" "}
                                    {formatCurrency(
                                        row.original.max_discount_amount,
                                    )}
                                </p>
                            )}
                    </div>
                ),
            },
            {
                accessorKey: "scope",
                header: "Cakupan",
                cell: ({ row }) => (
                    <div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                            {row.original.scope === "transaction"
                                ? "Global"
                                : "Produk tertentu"}
                        </span>
                        {row.original.products?.length > 0 && (
                            <p className="mt-2 max-w-[180px] truncate text-xs text-slate-500">
                                {row.original.products
                                    .map((product) => product.name)
                                    .join(", ")}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "min_purchase_amount",
                header: "Syarat",
                cell: ({ row }) => (
                    <div className="text-xs text-slate-600">
                        <p>
                            Min.{" "}
                            {formatCurrency(row.original.min_purchase_amount)}
                        </p>
                        {row.original.max_discount_amount && (
                            <p className="mt-1">
                                Maks.{" "}
                                {formatCurrency(
                                    row.original.max_discount_amount,
                                )}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "start_date",
                header: "Masa Berlaku",
                cell: ({ row }) => (
                    <span className="whitespace-nowrap text-xs text-slate-600">
                        {formatDate(row.original.start_date)}
                        <span className="mx-1 text-slate-300">-</span>
                        {formatDate(row.original.end_date)}
                    </span>
                ),
            },
            {
                accessorKey: "is_active",
                header: "Status",
                cell: ({ row }) => (
                    <StatusBadge
                        expired={isExpired(row.original.end_date)}
                        inactive={!row.original.is_active}
                    />
                ),
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        {row.original.is_active ? (
                            <button
                                type="button"
                                onClick={() => toggleStatus(row.original)}
                                className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                                title="Nonaktifkan"
                            >
                                <XCircle className="h-4 w-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => toggleStatus(row.original)}
                                className="rounded-lg bg-teal-50 p-2 text-teal-600 hover:bg-teal-100"
                                title="Aktifkan"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </button>
                        )}
                        <Link
                            href={route("discounts.edit", row.original.id)}
                            className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                            title="Edit"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                            type="button"
                            onClick={() => deleteDiscount(row.original)}
                            className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                            title="Hapus"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [rows],
    );

    const hasActiveFilters = selectedStatus !== "all";
    const filterContent = (
        <div className="flex justify-end">
            <Popover>
                <PopoverTrigger
                    className={`relative rounded-md border px-4 py-2 text-sm font-medium transition ${hasActiveFilters ? "border-orange-300 bg-orange-200 text-black hover:bg-orange-100" : "border-orange-200 bg-orange-50 text-black hover:bg-orange-100"}`}
                >
                    <span className="flex items-center gap-2">
                        <span>Filter</span>
                        {hasActiveFilters && (
                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                        )}
                    </span>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-4">
                    <form onSubmit={applyFilter} className="space-y-3">
                        <div>
                            <SelectInput
                                label="Status"
                                value={statusOptions.find((option) => option.value === selectedStatus)}
                                placeholder="Semua Status"
                                onChange={(event) => setSelectedStatus(event?.value)}
                                options={statusOptions}
                            />
                            </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                            >
                                Terapkan
                            </button>
                        </div>
                    </form>
                </PopoverContent>
            </Popover>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Diskon & Promo" />
            <PageHeader
                title="Manajemen Diskon & Promo"
                subtitle="Kelola harga promo berdasarkan transaksi atau produk tertentu."
                actions={
                    <Link href={route("discounts.create")}>
                        <Button type="button" variant="primary" size="lg">
                            Tambah Diskon
                        </Button>
                    </Link>
                }
            />

            <div className="space-y-5">
                <DataTable
                    data={rows}
                    columns={columns}
                    search={{
                        value: searchTerm,
                        onChange: (event) => setSearchTerm(event.target.value),
                        onSubmit: applySearch,
                        placeholder: "Cari nama promo...",
                    }}
                    filters={filterContent}
                    emptyMessage="Belum ada diskon."
                    total={discounts?.total ?? rows.length}
                    from={discounts?.from ?? 0}
                    to={discounts?.to ?? rows.length}
                    paginationLinks={discounts?.links ?? []}
                />
            </div>
        </AuthenticatedLayout>
    );
}

function StatusBadge({ expired, inactive }) {
    if (expired)
        return (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                Expired
            </span>
        );
    if (inactive)
        return (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                Non-Aktif
            </span>
        );
    return (
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Aktif
        </span>
    );
}
function isExpired(value) {
    return Boolean(value && new Date(value) < new Date());
}

function formatDate(value) {
    return value
        ? new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          }).format(new Date(value))
        : "-";
}
