import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Checkbox from "@/Components/Checkbox";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";
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
import { Head, router, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Edit2, Trash } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";

export default function CategoriesIndex({
    categories,
    search = "",
}) {
    const rows = categories?.data ?? [];
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState(search);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const {
        data: categoryData,
        setData: setCategoryData,
        post: createCategory,
        put: updateCategory,
        processing: categoryProcessing,
        errors: categoryErrors,
        reset: resetCategoryForm,
        clearErrors: clearCategoryErrors,
    } = useForm({ name: "" });

    const openCreateModal = () => {
        setEditingCategory(null);
        resetCategoryForm();
        clearCategoryErrors();
        setIsCategoryModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setCategoryData("name", category.name);
        clearCategoryErrors();
        setIsCategoryModalOpen(true);
    };

    const closeCategoryModal = () => {
        if (categoryProcessing) {
            return;
        }

        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        resetCategoryForm();
        clearCategoryErrors();
    };

    const submitCategory = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: closeCategoryModal,
        };

        if (editingCategory) {
            updateCategory(route("categories.update", editingCategory.id), options);
            return;
        }

        createCategory(route("categories.store"), options);
    };

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
            route("categories.index"),
            {
                search: searchTerm,
            },
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
                `Hapus ${ids.length} kategori produk terpilih?`,
            );

            if (!confirmed) {
                return;
            }
        }

        router.delete(route("categories.bulk-delete"), {
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
                headerClass: "w-2",
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
                            aria-label="Pilih semua kategori produk"
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
                            aria-label={`Pilih kategori produk ${row.original.name}`}
                        />
                    </div>
                ),
            },
            {
                accessorKey: "name",
                header: "Nama Kategori",
                cell: ({ row }) => (
                    <span className="font-medium text-gray-900">
                        {row.original.name}
                    </span>
                ),
            },
            {
                accessorKey: "products_count",
                header: "Jumlah Produk",
            },
            {
                header: "Aksi",
                headerClass: "w-4",
                cell: ({ row }) => (
                    <div className="flex flex-row items-center gap-x-1">
                        <button
                            type="button"
                            onClick={() => openEditModal(row.original)}
                            className="rounded-md bg-blue-50 h-8 w-8 flex items-center justify-center text-sm font-medium text-blue-600 hover:bg-blue-200"
                        >
                            <Edit2 size="14" />
                        </button>
                        {row.original.products_count == 0 && (
                            <button
                            type="button"
                            className="rounded-md bg-red-50 h-8 w-8 flex items-center justify-center text-sm font-medium text-red-600 hover:bg-red-200"
                            onClick={() => confirmDelete(row.original.id)}
                            >
                            <Trash size="14" />
                        </button>
                        )}
                    </div>
                ),
            },
        ],
        [rows, selectedIds],
    );

    const paginationLinks = categories?.links ?? [];

    const bulkAction = {
        selectedIds,
        label: "kategori produk dipilih",
        deleteLabel: "Hapus yang Dipilih",
        clearLabel: "Batal",
        onDelete: bulkDelete,
        onClearSelection: () => setSelectedIds([]),
    };

    const pageHeaderActions = (
        <div className="flex items-center gap-2">

                <Button variant="primary" size="lg" onClick={openCreateModal}>
                    Tambah Kategori
                </Button>
        </div>
    );

    return (
        <AuthenticatedLayout title="Categories">
            <Head title="Kategori Produk" />

            <PageHeader
                title="Kategori Produk"
                subtitle="Daftar kategori produk yang tersedia"
                actions={pageHeaderActions}
            />

            <DataTable
                data={rows}
                columns={columns}
                search={{
                    value: searchTerm,
                    onChange: (event) => setSearchTerm(event.target.value),
                    onSubmit: applySearch,
                    placeholder: "Cari nama...",
                    buttonText: "Search",
                }}
                bulkAction={bulkAction}
                emptyMessage="Tidak ada data kategori produk."
                total={categories?.total ?? rows.length}
                from={categories?.from ?? 0}
                to={categories?.to ?? rows.length}
                paginationLinks={paginationLinks}
            />

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus kategori produk</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kategori produk ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleDeleteConfirmed} className={"bg-red-500 text-white"}>
                            Ya, Hapus
                        </AlertDialogAction>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Modal
                show={isCategoryModalOpen}
                onClose={closeCategoryModal}
                maxWidth="md"
            >
                <form onSubmit={submitCategory} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                {editingCategory ? "Edit Kategori Produk" : "Tambah Kategori Produk"}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Masukkan nama kategori produk.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeCategoryModal}
                            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Tutup modal"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="mt-6">
                        <Input
                        label="Nama Kategori"
                            name="category_name"
                            value={categoryData.name}
                            onChange={(event) => setCategoryData("name", event.target.value)}
                            className="mt-2 block w-full"
                            placeholder="Contoh: Minuman"
                            isFocused
                            required
                        />
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            onClick={closeCategoryModal}
                            variant="cancel"
                        >
                            Batal
                        </Button>
                        <button
                            type="submit"
                            disabled={categoryProcessing}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {categoryProcessing ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
