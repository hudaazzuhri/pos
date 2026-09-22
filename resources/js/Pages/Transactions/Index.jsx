import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { formatDateTime } from "@/Helper/helper";

export default function TransactionsIndex({
    transactions,
    outlets = [],
    search = "",
    outlet_id = "",
}) {
    const rows = transactions?.data ?? [];
    const [searchTerm, setSearchTerm] = useState(search);
    const [selectedOutlet, setSelectedOutlet] = useState(outlet_id);

    const applySearch = (event) => {
        event.preventDefault();

        router.get(
            route("products.index"),
            {
                search: searchTerm,
                outlet_id: selectedOutlet,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const applyFilters = (event) => {
        event?.preventDefault();
        router.get(
            route("transactions.index"),
            { search: searchTerm, outlet_id: selectedOutlet },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedOutlet("");
        router.get(
            route("transactions.index"),
            {},
            { preserveState: true, replace: true },
        );
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "transaction_number",
                header: "Nomor Transaksi",
                cell: ({ row }) => (
                    <div>
                        <p className="font-semibold text-slate-900">
                            {row.original.invoice_number}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(row.original.created_at)}
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
                header: "Kasir",
                cell: ({ row }) => row.original.user?.name ?? "-",
            },
            {
                accessorKey: "total_amount",
                header: "Total Transaksi",
                cell: ({ row }) => (
                    <span className="font-semibold text-slate-900">
                        Rp{" "}
                        {Number(row.original.total_amount).toLocaleString(
                            "id-ID",
                        )}
                    </span>
                ),
            },
        ],
        [],
    );

    const hasActiveFilters =
        searchTerm.trim() !== "" || selectedOutlet !== "";

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
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Outlets
                            </label>
                            <select
                                value={selectedOutlet}
                                onChange={(event) =>
                                    setSelectedOutlet(event.target.value)
                                }
                                className="w-full h-10 rounded-md border-slate-300 text-sm"
                            >
                                <option value="">Semua outlet</option>
                                {outlets.map((outlet) => (
                                    <option key={outlet.id} value={outlet.id}>
                                        {outlet.name}
                                    </option>
                                ))}
                            </select>
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
            <Head title="Transaksi" />
            <PageHeader title="Transaksi" />
            <div className="space-y-3">
                <DataTable
                    data={rows}
                    columns={columns}
                    search={{
                        value: searchTerm,
                        onChange: (event) => setSearchTerm(event.target.value),
                        onSubmit: applySearch,
                        placeholder: "Cari ...",
                        buttonText: "Search",
                    }}
                    filters={filterContent}
                    emptyMessage="Tidak ada data transaksi."
                    total={transactions?.total ?? rows.length}
                    from={transactions?.from ?? 0}
                    to={transactions?.to ?? rows.length}
                    paginationLinks={transactions?.links ?? []}
                />
    
            </div>
        </AuthenticatedLayout>
    );
}
