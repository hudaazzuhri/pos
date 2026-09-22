import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { formatDateTime } from "@/Helper/helper";

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

export default function AuditLogsShow({ log }) {
    const oldValues = log.properties?.old || {};
    const newValues = log.properties?.attributes || {};
    const fields = [
        ...new Set([...Object.keys(oldValues), ...Object.keys(newValues)]),
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Detail Audit Log" />
            <PageHeader
                title="Detail Perubahan Data"
                subtitle={log.description}
                backAction={route("audit-logs.index")}
            />
            <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <section>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="text-slate-600">
                            <p className="ext-lg font-semibold text-slate-800">
                                {log.causer?.name || "System"}
                            </p>
                            <p className="text-sm capitalize">
                                {log.causer?.role || "system"}
                                {log.outlet ? ` · ${log.outlet}` : ""}
                            </p>
                        </div>
                        <div className="flex flex-row items-center gap-4">
                            <p className="text-sm text-slate-800">
                                {formatDateTime(log.created_at)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge className={moduleClasses[log.log_name]}>
                                    {moduleLabels[log.log_name] ||
                                        log.log_name ||
                                        "-"}
                                </Badge>
                                <Badge
                                    className={
                                        eventClasses[log.event] ||
                                        "bg-slate-100 text-slate-700"
                                    }
                                >
                                    {eventLabels[log.event] || log.event || "-"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </section>

                {log.metadata?.reason && (
                    <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                        <strong>Alasan:</strong> {log.metadata.reason}
                    </section>
                )}

                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-semibold text-slate-900">
                        Perbandingan Nilai
                    </h2>
                    {fields.length ? (
                        <div className="overflow-hidden rounded-md border border-slate-200">
                            <div className="grid grid-cols-2 border-b bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                                <div className="p-3">Data Sebelum</div>
                                <div className="border-l p-3">Data Sesudah</div>
                            </div>
                            {fields.map((field) => (
                                <div
                                    key={field}
                                    className="grid grid-cols-2 border-b last:border-b-0"
                                >
                                    <div className="p-3 text-sm">
                                        <p className="mb-1 text-xs font-semibold text-slate-500">
                                            {field}
                                        </p>
                                        {displayValue(oldValues[field])}
                                    </div>
                                    <div className="border-l p-3 text-sm">
                                        <p className="mb-1 text-xs font-semibold text-slate-500">
                                            {field}
                                        </p>
                                        {displayValue(newValues[field])}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
                            Tidak ada detail perubahan atribut.
                        </p>
                    )}
                </section>

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Info label="IP Address" value={log.metadata?.ip_address} />
                    <Info
                        label="Perangkat"
                        value={shortUserAgent(log.metadata?.user_agent)}
                    />
                    <Info
                        label="Subjek"
                        value={
                            log.subject
                                ? `${log.subject.type} #${log.subject.id}`
                                : "-"
                        }
                    />
                    <Info
                        label="Waktu"
                        value={formatDateTime(log.created_at)}
                    />
                </section>

                <details className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                        Raw Metadata
                    </summary>
                    <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">
                        {JSON.stringify(log.properties, null, 2)}
                    </pre>
                </details>
            </div>
        </AuthenticatedLayout>
    );
}

function Badge({ className, children }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-sm font-semibold ${className || ""}`}
        >
            {children}
        </span>
    );
}
function Info({ label, value }) {
    return (
        <div className="rounded-md bg-slate-50 border border-slate-200 p-3">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 break-words text-xs font-medium text-slate-800">
                {value || "-"}
            </p>
        </div>
    );
}
function displayValue(value) {
    return (
        <span className="break-words text-slate-700">
            {value === undefined
                ? "-"
                : typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
        </span>
    );
}
function shortUserAgent(value = "") {
    return value ? value.replace(/\s+/g, " ").slice(0, 100) : "-";
}
