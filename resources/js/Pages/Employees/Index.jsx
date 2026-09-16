import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import Modal from "@/Components/Modal";
import PageHeader from "@/Components/PageHeader";
import { Head, router, useForm } from "@inertiajs/react";
import {
    KeyRound,
    Pencil,
    Plus,
    ShieldCheck,
    Trash2,
    UserRound,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { useMemo, useState } from "react";

const roleLabels = { manager: "Manager", cashier: "Kasir" };

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
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
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
                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                            Manajemen akses
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            {isEditing ? "Edit Karyawan" : "Tambah Karyawan"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
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
                        <label className="text-sm font-semibold text-slate-700">
                            Nama Lengkap
                        </label>
                        <input
                            value={data.name}
                            onChange={(event) =>
                                setData("name", event.target.value)
                            }
                            className={fieldClass}
                            placeholder="Nama karyawan"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData("email", event.target.value)
                            }
                            className={fieldClass}
                            placeholder="nama@toko.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            No. HP
                        </label>
                        <input
                            value={data.phone}
                            onChange={(event) =>
                                setData("phone", event.target.value)
                            }
                            className={fieldClass}
                            placeholder="08xxxxxxxxxx"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.phone}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Role
                        </label>
                        <select
                            value={data.role}
                            onChange={(event) =>
                                setData("role", event.target.value)
                            }
                            className={fieldClass}
                        >
                            <option value="cashier">Kasir</option>
                            <option value="manager">Manager</option>
                        </select>
                        {errors.role && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.role}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Outlet
                        </label>
                        <select
                            value={data.outlet_id}
                            onChange={(event) =>
                                setData("outlet_id", event.target.value)
                            }
                            className={fieldClass}
                        >
                            <option value="">Pilih outlet</option>
                            {outlets.map((outlet) => (
                                <option key={outlet.id} value={outlet.id}>
                                    {outlet.name}
                                    {outlet.is_main ? " (Utama)" : ""}
                                </option>
                            ))}
                        </select>
                        {errors.outlet_id && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.outlet_id}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            Password{" "}
                            {isEditing && (
                                <span className="font-normal text-slate-400">
                                    (opsional)
                                </span>
                            )}
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(event) =>
                                setData("password", event.target.value)
                            }
                            className={fieldClass}
                            placeholder={
                                isEditing ? "Biarkan kosong" : "Min. 8 karakter"
                            }
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700">
                            PIN Kasir{" "}
                            {isEditing && (
                                <span className="font-normal text-slate-400">
                                    (opsional)
                                </span>
                            )}
                        </label>
                        <input
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
                            className={fieldClass}
                            placeholder={
                                isEditing ? "Biarkan kosong" : "6 digit angka"
                            }
                        />
                        {errors.pin && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.pin}
                            </p>
                        )}
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
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                    >
                        {processing ? "Menyimpan..." : "Simpan Karyawan"}
                    </button>
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
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
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
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
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
                            onClick={() => toggleStatus(row.original)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100"
                            aria-label={
                                row.original.is_active
                                    ? "Nonaktifkan karyawan"
                                    : "Aktifkan karyawan"
                            }
                        >
                            <ShieldCheck className="h-4 w-4" />
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
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(event) =>
                                    setRole(event.target.value)
                                }
                                className="w-full h-10 rounded-md border-slate-300 text-sm"
                            >
                                <option value="">Semua role</option>
                                <option value="manager">Manager</option>
                                <option value="cashier">Kasir</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Outlet
                            </label>
                            <select
                                value={outletId}
                                onChange={(event) =>
                                    setOutletId(event.target.value)
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
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className="w-full h-10 rounded-md border-slate-300 text-sm"
                            >
                                <option value="">Semua status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
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
                outlets={outlets}
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
