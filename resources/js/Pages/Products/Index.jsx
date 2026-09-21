import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Checkbox from "@/Components/Checkbox";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Head, Link, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Edit2, Trash } from "lucide-react";
import SelectInput from "@/Components/SelectInput";
import { Button } from "@/Components/ui/button";

export default function ProductsIndex({
    products,
    categories = [],
    search = "",
    category_id = "",
}) {
    const rows = products?.data ?? [];
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState(search);
    const [selectedCategory, setSelectedCategory] = useState(category_id || "");
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const toggleRow = (id, checked) => {
        setSelectedIds((prev) =>
            checked
                ? [...new Set([...prev, id])]
                : prev.filter((item) => item !== id),
        );
    };

    const toggleSelectAll = (checked) => {
        setSelectedIds(checked ? rows.map((row) => row.id) : []);
    };

    const applySearch = (event) => {
        event.preventDefault();

        router.get(
            route("products.index"),
            {
                search: searchTerm,
                category_id: selectedCategory,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const applyFilter = (event) => {
        event.preventDefault();

        router.get(
            route("products.index"),
            {
                search: searchTerm,
                category_id: selectedCategory,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");

        router.get(
            route("products.index"),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const bulkDelete = (ids = selectedIds, skipConfirm = false) => {
        if (!ids.length) {
            return;
        }

        if (!skipConfirm) {
            const confirmed = window.confirm(
                `Hapus ${ids.length} produk terpilih?`,
            );

            if (!confirmed) {
                return;
            }
        }

        router.delete(route("products.bulk-delete"), {
            data: { ids },
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setSelectedIds([]),
        });
    };

    const confirmDelete = (id) => {
        setDeleteTargetId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirmed = () => {
        if (!deleteTargetId) {
            return;
        }

        bulkDelete([deleteTargetId], true);
        setDeleteTargetId(null);
        setIsDeleteDialogOpen(false);
    };

    const columns = useMemo(
        () => [
            {
                id: "select",
                header: () => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={
                                rows.length > 0 &&
                                selectedIds.length === rows.length
                            }
                            onChange={(event) =>
                                toggleSelectAll(event.target.checked)
                            }
                            aria-label="Pilih semua produk"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={selectedIds.includes(row.original.id)}
                            onChange={(event) =>
                                toggleRow(row.original.id, event.target.checked)
                            }
                            aria-label={`Pilih produk ${row.original.name}`}
                        />
                    </div>
                ),
            },
            {
                accessorKey: "name",
                header: "Nama Produk",
                cell: ({ row }) => (
                    <span className="font-medium text-gray-900">
                        {row.original.name}
                    </span>
                ),
            },
            {
                accessorKey: "category",
                header: "Kategori",
                cell: ({ row }) => row.original.category?.name ?? "-",
            },
            {
                accessorKey: "sku",
                header: "SKU",
                cell: ({ row }) => row.original.sku ?? "-",
            },
            {
                accessorKey: "stock",
                header: "Stok",
                headerClass: "text-right",
                cell: ({ row }) => (
                    <div className="text-right">
                        {row.original.stock ?? "-"}
                    </div>
                ),
            },
            {
                accessorKey: "buy_price",
                header: "Harga Beli",
                headerClass: "text-right",
                cell: ({ row }) => (
                    <div className="text-right">
                        {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                        }).format(row.original.buy_price ?? 0)}
                    </div>
                ),
            },
            {
                accessorKey: "sell_price",
                header: "Harga Jual",
                headerClass: "text-right",
                cell: ({ row }) => (
                    <div className="text-right">
                        {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                        }).format(row.original.sell_price ?? 0)}
                    </div>
                ),
            },
            {
                header: "Aksi",
                cell: ({ row }) => (
                    <div className="flex flex-row items-center gap-x-1">
                        <a
                            href={route("products.edit", row.original.id)}
                            className="rounded-md bg-blue-50 h-8 w-8 flex items-center justify-center text-sm font-medium text-blue-600 hover:bg-blue-200"
                        >
                            <Edit2 size="14" />
                        </a>
                        <button
                            type="button"
                            className="rounded-md bg-red-50 h-8 w-8 flex items-center justify-center text-sm font-medium text-red-600 hover:bg-red-200"
                            onClick={() => confirmDelete(row.original.id)}
                        >
                            <Trash size="14" />
                        </button>
                    </div>
                ),
            },
        ],
        [rows, selectedIds],
    );

    const paginationLinks = products?.links ?? [];
    const hasActiveFilters = searchTerm.trim() !== "" || selectedCategory !== "";

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
                    <form onSubmit={applyFilter} className="space-y-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Kategori
                            </label>
                            <SelectInput
                                value={selectedCategory}
                                options={categories.map((category) => ({
                                    value: category.id,
                                    label: category.name,
                                }))}
                                placeholder="Semua Kategori"
                                onChange={(event) =>
                                    setSelectedCategory(event.target.value)
                                }
                            />
                            {/* <select
                                value={selectedCategory}
                                onChange={(event) =>
                                    setSelectedCategory(event.target.value)
                                }
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select> */}
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

    const bulkAction = {
        selectedIds,
        label: "produk dipilih",
        deleteLabel: "Hapus yang Dipilih",
        clearLabel: "Batal",
        onDelete: bulkDelete,
        onClearSelection: () => setSelectedIds([]),
    };

    const pageHeaderActions = (
        <div className="flex items-center gap-2">
            <Link
                href={route("products.create")}
                >
                    <Button variant="primary" size="lg">
                        Tambah Produk
                    </Button>
                </Link>
        </div>
    );

    return (
        <AuthenticatedLayout title="Products">
            <Head title="Produk" />

            <PageHeader
                title="Produk"
                subtitle="Daftar produk yang tersedia"
                actions={pageHeaderActions}
            />

            <DataTable
                data={rows}
                columns={columns}
                search={{
                    value: searchTerm,
                    onChange: (event) => setSearchTerm(event.target.value),
                    onSubmit: applySearch,
                    placeholder: "Cari nama, SKU, atau barcode...",
                    buttonText: "Search",
                }}
                filters={filterContent}
                bulkAction={bulkAction}
                emptyMessage="Tidak ada data produk."
                total={products?.total ?? rows.length}
                from={products?.from ?? 0}
                to={products?.to ?? rows.length}
                paginationLinks={paginationLinks}
            />

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus produk</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirmed} className={"bg-red-500 text-white"}>
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
