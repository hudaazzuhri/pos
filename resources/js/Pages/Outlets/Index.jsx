import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Checkbox from "@/Components/Checkbox";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";
import { Button } from "@/Components/ui/button";
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

const emptyOutlet = {
    name: "",
    phone: "",
    address: "",
    is_main: false,
};

export default function OutletsIndex({
    outlets,
    search = "",
}) {
    const rows = outlets?.data ?? [];
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState(search);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingOutlet, setEditingOutlet] = useState(null);
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(emptyOutlet);

    const openCreate = () => {
        setEditingOutlet(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEdit = (outlet) => {
        setEditingOutlet(outlet);
        setData({
            name: outlet.name ?? "",
            phone: outlet.phone ?? "",
            address: outlet.address ?? "",
            is_main: Boolean(outlet.is_main),
        });
        clearErrors();
        setShowModal(true);
    };

    const closeModal = () => {
        if (processing) {
            return;
        }

        setShowModal(false);
        setEditingOutlet(null);
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };

        if (editingOutlet) {
            put(route("outlets.update", editingOutlet.id), options);
            return;
        }

        post(route("outlets.store"), options);
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
                        <button
                            type="button"
                            onClick={() => openEdit(row.original)}
                            className="rounded-md bg-blue-50 h-8 w-8 flex items-center justify-center text-sm font-medium text-blue-600 hover:bg-blue-200"
                        >
                            <Edit2 size="14" />
                        </button>
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
            <Button type="button" variant="primary" size="lg" onClick={openCreate}>Tambah Cabang</Button>
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
            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={submit} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                {editingOutlet ? "Edit Outlet" : "Tambah Outlet"}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Lengkapi informasi outlet Anda.
                            </p>
                        </div>
                        <button type="button" onClick={closeModal} className="rounded-md p-2 text-slate-400 hover:bg-slate-100" aria-label="Tutup modal">
                            &times;
                        </button>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="outlet-name" className="text-sm font-medium text-slate-700">Nama Outlet</label>
                            <input id="outlet-name" type="text" value={data.name} onChange={(event) => setData("name", event.target.value)} className="mt-1 block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" autoFocus />
                            <InputError message={errors.name} className="mt-1" />
                        </div>
                        <div>
                            <label htmlFor="outlet-phone" className="text-sm font-medium text-slate-700">Nomor Telepon</label>
                            <input id="outlet-phone" type="text" value={data.phone} onChange={(event) => setData("phone", event.target.value)} className="mt-1 block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>
                        <div>
                            <label htmlFor="outlet-address" className="text-sm font-medium text-slate-700">Alamat</label>
                            <textarea id="outlet-address" rows="3" value={data.address} onChange={(event) => setData("address", event.target.value)} className="mt-1 block w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            <InputError message={errors.address} className="mt-1" />
                        </div>
                        <label className="flex items-center gap-3 text-sm text-slate-700">
                            <input type="checkbox" checked={data.is_main} onChange={(event) => setData("is_main", event.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            Jadikan outlet utama
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
                        <Button type="button" variant="cancel" onClick={closeModal}>Batal</Button>
                        <Button type="submit" variant="primary" disabled={processing}>{processing ? "Menyimpan..." : "Simpan"}</Button>
                    </div>
                </form>
            </Modal>

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
