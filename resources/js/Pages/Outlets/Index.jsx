import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Checkbox from "@/Components/Checkbox";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import TextInput from "@/Components/TextInput";
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
import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Edit2, Trash } from "lucide-react";

export default function OutletsIndex({
    outlets,
    search = "",
}) {
    const rows = outlets?.data ?? [];
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState(search);
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
            route("outlets.index"),
            {
                search: searchTerm,
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
            route("outlets.index"),
            {
                search: searchTerm,
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
            route("outlets.index"),
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
                `Hapus ${ids.length} cabang terpilih?`,
            );

            if (!confirmed) {
                return;
            }
        }

        router.delete(route("outlets.bulk-delete"), {
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
                            aria-label="Pilih semua cabang"
                        />
                    </div>
                ),
                cell: ({ row }) =>
                    !row.original.is_main && (
                        <div className="flex items-center justify-center">
                            <Checkbox
                                checked={selectedIds.includes(row.original.id)}
                                onChange={(event) =>
                                    toggleRow(
                                        row.original.id,
                                        event.target.checked,
                                    )
                                }
                                aria-label={`Pilih cabang ${row.original.name}`}
                            />
                        </div>
                    ),
            },
            {
                accessorKey: "name",
                header: "Nama Cabang",
                cell: ({ row }) => (
                    <span className="font-medium text-gray-900">
                        {row.original.name}
                    </span>
                ),
            },
            {
                accessorKey: "phone",
                header: "No. Telp",
            },
            {
                accessorKey: "address",
                header: "Alamat",
            },
            {
                accessorKey: "is_main",
                header: "Pusat",
                cell: ({ row }) => (
                    <div className="bg-gray-50 border border-grey-200 text-grey-300 py-1 px-3 text-xs w-fit rounded-md">
                        {row.original.is_main ? "Pusat" : "Cabang"}
                    </div>
                ),
            },
            {
                header: "Aksi",
                cell: ({ row }) => (
                    <div className="flex flex-row items-center gap-x-1">
                        <a
                            href={route("outlets.edit", row.original.id)}
                            className="rounded-md bg-blue-50 h-8 w-8 flex items-center justify-center text-sm font-medium text-blue-600 hover:bg-blue-200"
                        >
                            <Edit2 size="14" />
                        </a>
                        {!row.original.is_main && (

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

    const paginationLinks = outlets?.links ?? [];
    const bulkAction = {
        selectedIds,
        label: "cabang dipilih",
        deleteLabel: "Hapus yang Dipilih",
        clearLabel: "Batal",
        onDelete: bulkDelete,
        onClearSelection: () => setSelectedIds([]),
    };

    const pageHeaderActions = (
        <div className="flex items-center gap-2">
            <a
                href={route("outlets.create")}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
                Tambah Cabang
            </a>
        </div>
    );

    return (
        <AuthenticatedLayout title="Outlets">
            <Head title="Cabang" />

            <PageHeader
                title="Cabang"
                subtitle="Daftar cabang yang tersedia"
                actions={pageHeaderActions}
            />

            <DataTable
                data={rows}
                columns={columns}
                search={{
                    value: searchTerm,
                    onChange: (event) => setSearchTerm(event.target.value),
                    onSubmit: applySearch,
                    placeholder: "Cari nama cabang...",
                    buttonText: "Search",
                }}
                bulkAction={bulkAction}
                emptyMessage="Tidak ada data cabang."
                total={outlets?.total ?? rows.length}
                from={outlets?.from ?? 0}
                to={outlets?.to ?? rows.length}
                paginationLinks={paginationLinks}
            />

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus cabang</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus cabang ini? Tindakan ini tidak dapat dibatalkan.
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
