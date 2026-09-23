import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";
import PageHeader from "@/Components/PageHeader";
import { Head, router, useForm } from "@inertiajs/react";
import {
    CheckCircle2,
    KeyRound,
    Pencil,
    Plus,
    ShieldCheck,
    Trash2,
    UserRound,
    XCircle,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { useMemo, useState } from "react";
import { Input } from "@/Components/ui/input";
import SelectInput from "@/Components/SelectInput";
import { Button } from "@/Components/ui/button";

const roleLabels = { manager: "Manager", cashier: "Kasir" };
const roleOptions = [
    { value: "manager", label: "Manager" },
    { value: "cashier", label: "Kasir" },
];
const statusOptions = [
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Non Aktif" },
];
const emptyEmployee = {
    name: "",
    email: "",
    phone: "",
    role: "cashier",
    outlet_id: "",
    password: "",
    pin: "",
    is_active: true,
};



function StatusBadge({ active }) {
    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
        >
            {active ? "Aktif" : "Nonaktif"}
        </span>
    );
}

function EmployeeModal({
    show,
    editingEmployee,
    outlets,
    data,
    setData,
    errors,
    processing,
    onClose,
    onSubmit,
}) {
    const isEditing = Boolean(editingEmployee);
    const fieldClass =
        "mt-1 block h-10 w-full rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500";

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={onSubmit} className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {isEditing ? "Edit Karyawan" : "Tambah Karyawan"}
                        </h2>
                        <p className="text-sm text-slate-500">
                            Atur identitas, role, outlet, dan kredensial kasir.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Tutup modal"
                    >
                        ×
                    </button>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Input
                            label="Nama Lengkap"
                            value={data.name}
                            onChange={(event) =>
                                setData("name", event.target.value)
                            }
                            className={fieldClass}
                            placeholder="Nama karyawan"
                        />
                    </div>
                    <div>
                        <Input
                            label="Email"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData("email", event.target.value)
                            }
                            className={fieldClass}
                            placeholder="nama@toko.com"
                        />
                    </div>
                    <div>
                        <Input
                            label="No. Telp"
                            value={data.phone}
                            onChange={(event) =>
                                setData("phone", event.target.value)
                            }
                            className={fieldClass}
                            placeholder="08xxxxxxxxxx"
                        />
                    </div>
                    <div>
                        <SelectInput
                            label="Role"
                            value={roleOptions.find(
                                (option) => option.value === data.role,
                            )}
                            onChange={(event) => setData("role", event.value)}
                            options={roleOptions}
                        />
                    </div>
                    <div>
                        <SelectInput
                            label="Outlet"
                            value={outlets.find(
                                (option) => option.value === data.outlet_id,
                            )}
                            onChange={(event) =>
                                setData("outlet_id", event.value)
                            }
                            options={outlets}
                        />
                    </div>
                    <div>
                        <Input
                            label={
                                !isEditing ? "Password" : "Password (opsional)"
                            }
                            type="password"
                            value={data.password}
                            onChange={(event) =>
                                setData("password", event.target.value)
                            }
                            placeholder={
                                isEditing ? "Biarkan kosong" : "Min. 8 karakter"
                            }
                        />
                    </div>
                    <div>
                        <Input
                            label={
                                !isEditing
                                    ? "PIN Kasir"
                                    : "PIN Kasir (opsional)"
                            }
                            inputMode="numeric"
                            maxLength="6"
                            value={data.pin}
                            onChange={(event) =>
                                setData(
                                    "pin",
                                    event.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6),
                                )
                            }
                            placeholder={
                                isEditing ? "Biarkan kosong" : "6 digit angka"
                            }
                        />
                    </div>
                    {isEditing && (
                        <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) =>
                                    setData("is_active", event.target.checked)
                                }
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            Akun aktif dan dapat login
                        </label>
                    )}
                </div>
                {errors.employee && (
                    <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                        {errors.employee}
                    </p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="cancel"
                        size="lg"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                        variant="primary"
                        size="lg"
                    >
                        {processing ? "Menyimpan..." : "Simpan Karyawan"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default function EmployeesIndex({
    employees,
    outlets = [],
    filters = {},
    quota = {},
}) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [role, setRole] = useState(filters.role ?? "");
    const [outletId, setOutletId] = useState(filters.outlet_id ?? "");
    const [status, setStatus] = useState(filters.status ?? "");
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const outletOptions = outlets.map((outlet) => ({
        value: outlet.id,
        label: outlet.name,
    }));

    const {
        data,
        setData,
        post,
        put,
        patch,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm(emptyEmployee);

    const applyFilter = (event) => {
        event.preventDefault();
        router.get(
            route("employees.index"),
            { search, role, outlet_id: outletId, status },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch("");
        setRole("");
        setOutletId("");
        setStatus("");

        router.get(
            route("employees.index"),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const openCreate = () => {
        setEditingEmployee(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEdit = (employee) => {
        setEditingEmployee(employee);
        setData({
            name: employee.name,
            email: employee.email,
            phone: employee.phone ?? "",
            role: employee.role,
            outlet_id: employee.outlet_id ?? "",
            password: "",
            pin: "",
            is_active: Boolean(employee.is_active),
        });
        clearErrors();
        setShowModal(true);
    };

    const closeModal = () => {
        if (processing) return;
        setShowModal(false);
        setEditingEmployee(null);
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: closeModal };
        editingEmployee
            ? put(route("employees.update", editingEmployee.id), options)
            : post(route("employees.store"), options);
    };

    const toggleStatus = (employee) =>
        router.patch(
            route("employees.toggle-status", employee.id),
            {},
            { preserveScroll: true },
        );
    const deleteEmployee = (employee) => {
        if (window.confirm(`Hapus ${employee.name}?`))
            router.delete(route("employees.destroy", employee.id), {
                preserveScroll: true,
            });
    };

    const selectedOutlet = outlets.find((option) => option.id === outletId);
    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Karyawan",
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <UserRound className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">
                                {row.original.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {row.original.email}
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "role",
                header: "Role",
                cell: ({ row }) => (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                        {roleLabels[row.original.role]}
                    </span>
                ),
            },
            {
                accessorKey: "outlet",
                header: "Outlet",
                cell: ({ row }) => row.original.outlet?.name ?? "-",
            },
            {
                accessorKey: "phone",
                header: "No. HP",
                cell: ({ row }) => row.original.phone ?? "-",
            },
            {
                accessorKey: "is_active",
                header: "Status",
                cell: ({ row }) => (
                    <StatusBadge active={row.original.is_active} />
                ),
            },
            {
                id: "actions",
                header: "Aksi",
                headerClass: "w-4",
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => toggleStatus(row.original)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-md  ${row.original.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                            aria-label={
                                row.original.is_active
                                    ? "Nonaktifkan karyawan"
                                    : "Aktifkan karyawan"
                            }
                        >
                            {row.original.is_active ? (
                                <XCircle size="14" />
                            ) : (
                                <CheckCircle2 size="14" />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => openEdit(row.original)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                            aria-label="Edit karyawan"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>

                        <button
                            type="button"
                            onClick={() => deleteEmployee(row.original)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                            aria-label="Hapus karyawan"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ),
            },
        ],
        [employees],
    );

    const hasActiveFilters =
        search.trim() !== "" || role !== "" || outletId !== "" || status !== "";
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
                            <SelectInput
                                label="Role"
                                value={roleOptions.find(
                                    (option) => option.value === role,
                                )}
                                onChange={(event) => setRole(event?.value)}
                                options={roleOptions}
                                placeholder="Semua Role"
                                isClearable
                            />
                        </div>
                        <div>
                            <SelectInput
                                label="Outlet"
                                value={
                                    selectedOutlet
                                        ? {
                                              value: selectedOutlet.id,
                                              label: selectedOutlet.name,
                                          }
                                        : null
                                }
                                onChange={(event) => setOutletId(event?.value)}
                                options={outlets.map((outlet) => ({
                                    value: outlet.id,
                                    label: outlet.name,
                                }))}
                                placeholder="Outlet"
                                isClearable
                            />
                        </div>
                        <div>
                            <SelectInput
                                label="Status"
                                value={statusOptions.find(
                                    (option) => option.value === status,
                                )}
                                onChange={(event) => setStatus(event?.value)}
                                options={statusOptions}
                                placeholder="Semua Status"
                                isClearable
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
            <Head title="Manajemen Karyawan" />
            <PageHeader
                title="Manajemen Karyawan"
                subtitle="Kelola staf, role, dan penugasan outlet."
                actions={
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Karyawan
                    </button>
                }
            />
            <div className="space-y-5">
                <div className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <KeyRound className="h-5 w-5 text-indigo-600" />
                        <div>
                            <p className="text-sm font-semibold text-indigo-950">
                                Kuota Karyawan · {quota.package_name}
                            </p>
                            <p className="mt-1 text-xs text-indigo-700">
                                Terpakai {quota.used ?? 0} dari {quota.max ?? 0}{" "}
                                karyawan
                            </p>
                        </div>
                    </div>
                    <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-indigo-200">
                        <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{
                                width: `${Math.min(100, ((quota.used ?? 0) / Math.max(1, quota.max ?? 1)) * 100)}%`,
                            }}
                        />
                    </div>
                </div>
                <DataTable
                    data={employees?.data ?? []}
                    columns={columns}
                    search={{
                        value: search,
                        onChange: (event) => setSearch(event.target.value),
                        onSubmit: applyFilter,
                        placeholder: "Cari nama, email, atau HP...",
                    }}
                    filters={filterContent}
                    emptyMessage="Belum ada karyawan."
                    total={employees?.total ?? 0}
                    from={employees?.from ?? 0}
                    to={employees?.to ?? 0}
                    paginationLinks={employees?.links ?? []}
                />
            </div>
            <EmployeeModal
                show={showModal}
                editingEmployee={editingEmployee}
                outlets={outletOptions}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                onClose={closeModal}
                onSubmit={submit}
            />
        </AuthenticatedLayout>
    );
}
