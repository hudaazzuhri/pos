import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import { Button } from "@/Components/ui/button";
import { Head, Link, router } from "@inertiajs/react";
import { ChevronRight, Download, Filter, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDateTime } from "@/Helper/helper";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";

const moduleLabels = {
    auth: "Auth / Akses",
    sales: "Penjualan / POS",
    inventory: "Inventaris Stok",
    products: "Master Produk",
    discounts: "Diskon & Promo",
    users: "Pengguna / Staff",
};

const moduleClasses = {
    auth: "bg-violet-50 text-violet-700",
    sales: "bg-indigo-50 text-indigo-700",
    inventory: "bg-amber-50 text-amber-700",
    products: "bg-cyan-50 text-cyan-700",
    discounts: "bg-pink-50 text-pink-700",
    users: "bg-slate-100 text-slate-700",
};

const eventLabels = {
    created: "Created",
    updated: "Updated",
    deleted: "Deleted",
    login: "Login",
    logout: "Logout",
    void: "Void / Cancel",
    refund: "Refund",
};

const eventClasses = {
    created: "bg-emerald-50 text-emerald-700",
    updated: "bg-blue-50 text-blue-700",
    deleted: "bg-red-50 text-red-700",
    login: "bg-violet-50 text-violet-700",
    logout: "bg-violet-50 text-violet-700",
    void: "bg-red-50 text-red-700",
    refund: "bg-red-50 text-red-700",
};

export default function AuditLogsIndex({
    logs,
    filters: initialFilters = {},
    users = [],
    modules = [],
}) {
    const [filters, setFilters] = useState({
        search: "",
        user_id: "",
        module: "",
        event: "",
        date_start: "",
        date_end: "",
        ...initialFilters,
    });
    const setFilter = (name, value) =>
        setFilters((current) => ({ ...current, [name]: value }));

    const applyFilters = (event) => {
        event?.preventDefault();
        router.get(route("audit-logs.index"), filters, {
            preserveState: true,
            replace: true,
        });
    };

    const exportUrl = `${route("audit-logs.export")}?${new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value),
    ).toString()}`;

    const columns = useMemo(
        () => [
            {
                accessorKey: "created_at",
                header: "Waktu",
                cell: ({ row }) => (
                    <span className="whitespace-wrap text-xs text-slate-600">
                        {formatDateTime(row.original.created_at)}
                    </span>
                ),
            },
            {
                accessorKey: "causer",
                header: "Staff / User",
                cell: ({ row }) => <ActorCell log={row.original} />,
            },
            {
                accessorKey: "log_name",
                header: "Modul / Kategori",
                cell: ({ row }) => (
                    <ModuleBadge module={row.original.log_name} />
                ),
            },
            {
                accessorKey: "event",
                header: "Aksi / Event",
                cell: ({ row }) => <EventBadge event={row.original.event} />,
            },
            {
                accessorKey: "description",
                header: "Deskripsi Ringkas",
                cell: ({ row }) => (
                    <div className="min-w-52">
                        <p className="font-medium text-slate-800">
                            {row.original.description}
                        </p>
                        {row.original.subject && (
                            <p className="mt-1 text-xs text-slate-500">
                                {row.original.subject.type} #
                                {row.original.subject.id}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                id: "device",
                header: "IP & Perangkat",
                cell: ({ row }) => (
                    <div className="min-w-40 text-xs text-slate-500">
                        <p>{row.original.metadata?.ip_address || "-"}</p>
                        <p
                            className="mt-1 line-clamp-2 text-xs text-slate-500"
                            title={row.original.metadata?.user_agent}
                        >
                            {shortUserAgent(row.original.metadata?.user_agent)}
                        </p>
                    </div>
                ),
            },
            {
                id: "actions",
                header: "Aksi",
                headerClass: "w-4",
                cell: ({ row }) => (
                    <Link
                        href={route("audit-logs.show", row.original.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-50 text-green-700 hover:bg-green-100"
                        aria-label="Lihat detail audit log"
                    >
                        <ChevronRight size={14} />
                    </Link>
                ),
            },
        ],
        [],
    );

    const hasActiveFilters =
        filters?.search !== "" ||
        filters?.user_id !== "" ||
        filters?.module !== "" ||
        filters?.event !== "" ||
        filters?.date_start !== "" ||
        filters?.date_end !== "";
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
                        <label className="sr-only" htmlFor="audit-user">
                            Staff
                        </label>
                        <select
                            id="audit-user"
                            value={filters.user_id}
                            onChange={(event) =>
                                setFilter("user_id", event.target.value)
                            }
                            className="h-10 rounded-md border-slate-300 text-sm"
                        >
                            <option value="">Semua staff</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                        <label className="sr-only" htmlFor="audit-module">
                            Modul
                        </label>
                        <select
                            id="audit-module"
                            value={filters.module}
                            onChange={(event) =>
                                setFilter("module", event.target.value)
                            }
                            className="h-10 rounded-md border-slate-300 text-sm"
                        >
                            <option value="">Semua modul</option>
                            {modules.map((module) => (
                                <option key={module} value={module}>
                                    {moduleLabels[module] || module}
                                </option>
                            ))}
                        </select>
                        <label className="sr-only" htmlFor="audit-event">
                            Event
                        </label>
                        <select
                            id="audit-event"
                            value={filters.event}
                            onChange={(event) =>
                                setFilter("event", event.target.value)
                            }
                            className="h-10 rounded-md border-slate-300 text-sm"
                        >
                            <option value="">Semua event</option>
                            {Object.entries(eventLabels).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>
                        <input
                            aria-label="Tanggal mulai"
                            type="date"
                            value={filters.date_start}
                            onChange={(event) =>
                                setFilter("date_start", event.target.value)
                            }
                            className="h-10 rounded-md border-slate-300 text-sm"
                        />
                        <input
                            aria-label="Tanggal akhir"
                            type="date"
                            value={filters.date_end}
                            onChange={(event) =>
                                setFilter("date_end", event.target.value)
                            }
                            className="h-10 rounded-md border-slate-300 text-sm"
                        />
                        <Button
                            type="button"
                            variant="primary"
                            onClick={applyFilters}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Terapkan
                        </Button>
                    </form>
                </PopoverContent>
            </Popover>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Audit Log & Aktivitas Staff" />
            <PageHeader
                title="Audit Log & Aktivitas Staff"
                subtitle="Pantau perubahan data dan aktivitas pengguna dalam tenant."
                actions={
                    <a
                        href={exportUrl}
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </a>
                }
            />
            <DataTable
                data={logs?.data ?? []}
                columns={columns}
                search={{
                    value: filters.search,
                    onChange: (event) =>
                        setFilter("search", event.target.value),
                    onSubmit: applyFilters,
                    placeholder: "Cari deskripsi, staff, atau IP...",
                }}
                filters={filterContent}
                topContent={
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <ShieldAlert className="h-4 w-4 text-indigo-600" />
                        <span>
                            Aktivitas terbaru tercatat otomatis dari perubahan
                            data.
                        </span>
                    </div>
                }
                emptyMessage="Tidak ada aktivitas yang sesuai filter."
                total={logs?.total ?? 0}
                from={logs?.from ?? 0}
                to={logs?.to ?? 0}
                paginationLinks={logs?.links ?? []}
            />
        </AuthenticatedLayout>
    );
}

function ActorCell({ log }) {
    const actor = log.causer;
    const initials =
        actor?.name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "SY";

    return (
        <div className="min-w-40">
            <p className="font-medium text-slate-800">
                {actor?.name || "System"}
            </p>
            <p className="text-xs capitalize text-slate-500">
                {actor?.role || "system"}
                {log.outlet ? ` · ${log.outlet}` : ""}
            </p>
        </div>
    );
}

function ModuleBadge({ module }) {
    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${moduleClasses[module] || "bg-slate-100 text-slate-700"}`}
        >
            {moduleLabels[module] || module || "-"}
        </span>
    );
}

function EventBadge({ event }) {
    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${eventClasses[event] || "bg-slate-100 text-slate-700"}`}
        >
            {eventLabels[event] || event || "-"}
        </span>
    );
}

function shortUserAgent(value = "") {
    return value ? value.replace(/\s+/g, " ").slice(0, 54) : "-";
}
