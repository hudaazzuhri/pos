import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import { Head, router } from "@inertiajs/react";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import SelectInput from "@/Components/SelectInput";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { formatShortDateTime } from "@/Helper/helper";

const typeLabels = [
    { value: "in", label: "Masuk" },
    { value: "out", label: "Keluar" },
    { value: "adjustment", label: "Penyesuaian" },
    { value: "sale", label: "Penjualan" },
    { value: "sale_void", label: "Void Penjualan" },
    { value: "opname", label: "Opname" },
];
const typeClasses = {
    in: "bg-emerald-50 text-emerald-700",
    out: "bg-red-50 text-red-700",
    adjustment: "bg-indigo-50 text-indigo-700",
    sale: "bg-orange-50 text-orange-700",
    sale_void: "bg-sky-50 text-sky-700",
};

export default function StockMovements({ movements, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [type, setType] = useState(filters.type ?? "");
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? "");
    const [dateTo, setDateTo] = useState(filters.date_to ?? "");

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(
            route("stock.movements.index"),
            { search, type, date_from: dateFrom, date_to: dateTo },
            { preserveState: true, replace: true },
        );
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "created_at",
                header: "Waktu",
                headerClass: "w-[120px]",
                cell: ({ row }) => (
                    <div className="whitespace-wrap text-slate-500">
                        {formatShortDateTime(row.original.created_at)}
                    </div>
                ),
            },
            {
                accessorKey: "product",
                header: "Produk",
                cell: ({ row }) => (
                    <div>
                        <p className="font-semibold text-slate-900">
                            {row.original.product?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {row.original.product?.sku || "Tanpa SKU"}
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
                accessorKey: "type",
                header: "Tipe",
                cell: ({ row }) => (
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs ${typeClasses[row.original.type] ?? "bg-slate-100 text-slate-600"}`}
                    >
                        {typeLabels.find((option) => option.value === row.original.type)?.label ?? row.original.type}
                    </span>
                ),
            },
            {
                accessorKey: "quantity",
                header: "Perubahan",
                cell: ({ row }) => {
                    const quantity = row.original.quantity;

                    return (
                        <span
                            className={`font-bold ${quantity >= 0 ? "text-emerald-600" : "text-red-600"}`}
                        >
                            {quantity > 0 ? "+" : ""}
                            {quantity}
                        </span>
                    );
                },
            },
            {
                accessorKey: "stock_before",
                header: "Stok",
                cell: ({ row }) => (
                    <span>
                        {row.original.stock_before} -&gt; {row.original.stock_after}
                    </span>
                ),
            },
            {
                accessorKey: "reference_number",
                header: "Referensi",
                cell: ({ row }) => row.original.reference_number ?? "-",
            },
            {
                accessorKey: "user",
                header: "User",
                cell: ({ row }) => row.original.user?.name ?? "-",
            },
        ],
        [],
    );

    const filterContent = (
        <form
            onSubmit={applyFilters}
            className="flex flex-wrap items-end gap-2"
        >
            <SelectInput
                value={typeLabels.find((option) => option.value === type)}
                onChange={(event) => setType(event?.value)}
                options={typeLabels.map((option) => ({
                    value: option.value,
                    label: option.label,
                }))}
                placeholder="Semua tipe"
                isClearable
            />
            <Input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
            />
            <Input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
            />
            <Button
                type="submit"
                aria-label="Terapkan filter"
                variant="primary"
                className="h-10 w-10"
                size="lg"
            >
                <Search className="h-4 w-4" />
            </Button>
        </form>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Audit Mutasi Stok" />
            <PageHeader
                title="Audit Mutasi Stok"
                subtitle="Riwayat perubahan stok secara kronologis."
                backAction={route("stock.index")}
            />
            <DataTable
                data={movements?.data ?? []}
                columns={columns}
                search={{
                    value: search,
                    onChange: (event) => setSearch(event.target.value),
                    onSubmit: applyFilters,
                    placeholder: "Cari produk atau SKU...",
                }}
                filters={filterContent}
                emptyMessage="Belum ada histori mutasi."
                total={movements?.total ?? 0}
                from={movements?.from ?? 0}
                to={movements?.to ?? 0}
                paginationLinks={movements?.links ?? []}
            />
        </AuthenticatedLayout>
    );
}
