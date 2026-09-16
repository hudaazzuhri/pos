import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable";
import PageHeader from "@/Components/PageHeader";
import { Head } from "@inertiajs/react";
import {  Clock3, UserRound } from "lucide-react";
import { useMemo } from "react";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
});

function formatCurrency(value) {
    return value === null || value === undefined
        ? "-"
        : currencyFormatter.format(Number(value));
}

function formatDate(value) {
    return value ? dateFormatter.format(new Date(value)) : "-";
}

function formatDuration(openedAt, closedAt) {
    if (!openedAt || !closedAt) {
        return "Masih berjalan";
    }

    const durationInMinutes = Math.max(
        0,
        Math.round((new Date(closedAt) - new Date(openedAt)) / 60000),
    );
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    return hours ? `${hours} jam ${minutes} menit` : `${minutes} menit`;
}

function StatusBadge({ status }) {
    const isOpen = status === "open";

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                isOpen
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
            }`}
        >
            {isOpen ? "Aktif" : "Ditutup"}
        </span>
    );
}

export default function CashierShiftIndex({ shifts }) {
    const columns = useMemo(
        () => [
            {
                accessorKey: "opened_at",
                header: "Waktu Shift",
                cell: ({ row }) => (
                    <div className="min-w-44">
                        <p className="font-semibold text-slate-900">
                            {formatDate(row.original.opened_at)}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDuration(
                                row.original.opened_at,
                                row.original.closed_at,
                            )}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: "user",
                header: "Kasir",
                cell: ({ row }) => (
                            row.original.user?.name ?? "-"
                ),
            },
            {
                accessorKey: "outlet",
                header: "Outlet",
                cell: ({ row }) => row.original.outlet?.name ?? "-",
            },
            {
                accessorKey: "starting_cash",
                header: "Modal Awal",
                cell: ({ row }) => formatCurrency(row.original.starting_cash),
            },
            {
                accessorKey: "expected_cash",
                header: "Kas Seharusnya",
                cell: ({ row }) => formatCurrency(row.original.expected_cash),
            },
            {
                accessorKey: "actual_cash",
                header: "Kas Aktual",
                cell: ({ row }) => formatCurrency(row.original.actual_cash),
            },
            {
                accessorKey: "difference",
                header: "Selisih",
                cell: ({ row }) => {
                    const difference = row.original.difference;

                    return (
                        <span
                            className={`font-semibold ${
                                difference === null || difference === undefined
                                    ? "text-slate-400"
                                    : Number(difference) < 0
                                      ? "text-red-600"
                                      : Number(difference) > 0
                                        ? "text-emerald-600"
                                        : "text-slate-600"
                            }`}
                        >
                            {formatCurrency(difference)}
                        </span>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                accessorKey: "closed_at",
                header: "Ditutup",
                cell: ({ row }) => formatDate(row.original.closed_at),
            },
        ],
        [],
    );

    return (
        <AuthenticatedLayout>
            <Head title="History Shift Kasir" />
            <PageHeader
                title="History Shift Kasir"
                subtitle="Log pembukaan, penutupan, dan rekonsiliasi kas setiap shift."
            />

            <DataTable
                data={shifts?.data ?? []}
                columns={columns}
                emptyMessage="Belum ada history shift kasir."
                total={shifts?.total ?? 0}
                from={shifts?.from ?? 0}
                to={shifts?.to ?? 0}
                paginationLinks={shifts?.links ?? []}
            />
        </AuthenticatedLayout>
    );
}
