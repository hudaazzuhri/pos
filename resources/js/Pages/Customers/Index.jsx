import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";
import PageHeader from "@/Components/PageHeader";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
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
import { Edit2, Plus, Trash } from "lucide-react";
import { useMemo, useState } from "react";

const emptyCustomer = { name: "", phone: "" };

export default function CustomersIndex({ customers, search = "" }) {
    const rows = customers?.data ?? [];
    const [searchTerm, setSearchTerm] = useState(search);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(emptyCustomer);

    const openCreate = () => {
        setEditingCustomer(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEdit = (customer) => {
        setEditingCustomer(customer);
        setData({ name: customer.name, phone: customer.phone ?? "" });
        clearErrors();
        setShowModal(true);
    };

    const closeModal = () => {
        if (processing) return;
        setShowModal(false);
        setEditingCustomer(null);
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: closeModal };

        if (editingCustomer) {
            put(route("customers.update", editingCustomer.id), options);
            return;
        }

        post(route("customers.store"), options);
    };

    const applySearch = (event) => {
        event.preventDefault();
        router.get(route("customers.index"), { search: searchTerm }, { preserveState: true, replace: true });
    };

    const deleteCustomer = () => {
        if (!deleteTarget) return;

        router.delete(route("customers.destroy", deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const columns = useMemo(() => [
        {
            accessorKey: "name",
            header: "Nama Pelanggan",
            cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
        },
        {
            accessorKey: "phone",
            header: "No. HP",
            cell: ({ row }) => row.original.phone || "-",
        },
        {
            id: "actions",
            header: "Aksi",
            headerClass: "w-4",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openEdit(row.original)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100" aria-label="Edit pelanggan">
                        <Edit2 size="14" />
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(row.original)} className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 hover:bg-red-100" aria-label="Hapus pelanggan">
                        <Trash size="14" />
                    </button>
                </div>
            ),
        },
    ], [customers]);

    return (
        <AuthenticatedLayout>
            <Head title="Data Pelanggan" />
            <PageHeader
                title="Data Pelanggan"
                subtitle="Kelola data pelanggan toko."
                actions={<Button variant="primary" size="lg" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tambah Pelanggan</Button>}
            />
            <DataTable
                data={rows}
                columns={columns}
                search={{ value: searchTerm, onChange: (event) => setSearchTerm(event.target.value), onSubmit: applySearch, placeholder: "Cari nama atau no. HP..." }}
                emptyMessage="Belum ada data pelanggan."
                total={customers?.total ?? 0}
                from={customers?.from ?? 0}
                to={customers?.to ?? 0}
                paginationLinks={customers?.links ?? []}
            />

            <Modal show={showModal} onClose={closeModal} maxWidth="md">
                <form onSubmit={submit} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">{editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan"}</h2>
                            <p className="mt-1 text-sm text-slate-500">Masukkan nama dan nomor telepon pelanggan.</p>
                        </div>
                        <button type="button" onClick={closeModal} className="rounded-md p-2 text-slate-400 hover:bg-slate-100" aria-label="Tutup modal">&times;</button>
                    </div>
                    <div className="mt-6 space-y-4">
                        <div>
                            <Input label="Nama Pelanggan" name="customer_name" value={data.name} onChange={(event) => setData("name", event.target.value)} placeholder="Contoh: Budi Santoso" isFocused required />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <Input label="No. HP" name="customer_phone" value={data.phone} onChange={(event) => setData("phone", event.target.value)} placeholder="Contoh: 08123456789" />
                            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-end gap-2">
                        <Button type="button" onClick={closeModal} variant="cancel">Batal</Button>
                        <button type="submit" disabled={processing} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">{processing ? "Menyimpan..." : "Simpan"}</button>
                    </div>
                </form>
            </Modal>

            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus pelanggan</AlertDialogTitle>
                        <AlertDialogDescription>Apakah Anda yakin ingin menghapus {deleteTarget?.name}? Data transaksi pelanggan tetap dipertahankan.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={deleteCustomer} className="bg-red-500 text-white">Ya, Hapus</AlertDialogAction>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}