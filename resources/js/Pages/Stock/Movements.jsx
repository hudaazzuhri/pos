import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, ClipboardList, Search } from "lucide-react";
import { useState } from "react";

const typeLabels = {
    in: "Masuk",
    out: "Keluar",
    adjustment: "Penyesuaian",
    sale: "Penjualan",
    sale_void: "Void Penjualan",
    opname: "Opname",
};
const typeClasses = {
    in: "bg-emerald-50 text-emerald-700",
    out: "bg-red-50 text-red-700",
    adjustment: "bg-indigo-50 text-indigo-700",
    sale: "bg-orange-50 text-orange-700",
    sale_void: "bg-sky-50 text-sky-700",
};

export default function StockMovements({ movements, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [type, setType] = useState(filters.type ?? "");
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? "");
    const [dateTo, setDateTo] = useState(filters.date_to ?? "");

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(
            route("stock.movements.index"),
            { search, type, date_from: dateFrom, date_to: dateTo },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Audit Mutasi Stok" />
            <PageHeader
                title="Audit Mutasi Stok"
                subtitle="Riwayat perubahan stok secara kronologis."
                backAction={route("stock.index")}
            />
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <form
                    onSubmit={applyFilters}
                    className="grid gap-3 border-b border-slate-200 p-5 md:grid-cols-5"
                >
                    <div className="md:col-span-2">
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="h-10 w-full rounded-md border-slate-300 text-sm"
                            placeholder="Cari produk atau SKU..."
                        />
                    </div>
                    <select
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                        className="h-10 rounded-md border-slate-300 text-sm"
                    >
                        <option value="">Semua tipe</option>
                        {Object.entries(typeLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(event) => setDateFrom(event.target.value)}
                        className="h-10 rounded-md border-slate-300 text-sm"
                    />
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(event) => setDateTo(event.target.value)}
                            className="h-10 min-w-0 flex-1 rounded-md border-slate-300 text-sm"
                        />
                        <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-3 text-white hover:bg-indigo-500"
                            aria-label="Terapkan filter"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </form>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                {[
                                    "Waktu",
                                    "Produk",
                                    "Outlet",
                                    "Tipe",
                                    "Perubahan",
                                    "Stok",
                                    "Referensi",
                                    "User",
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="px-5 py-3 font-semibold text-slate-600"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {movements?.data?.length ? (
                                movements.data.map((movement) => (
                                    <tr
                                        key={movement.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="whitespace-wrap px-5 py-4 text-slate-500">
                                            {new Date(
                                                movement.created_at,
                                            ).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-900">
                                                {movement.product?.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {movement.product?.sku ||
                                                    "Tanpa SKU"}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {movement.outlet?.name ?? "-"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeClasses[movement.type] ?? "bg-slate-100 text-slate-600"}`}
                                            >
                                                {typeLabels[movement.type] ??
                                                    movement.type}
                                            </span>
                                        </td>
                                        <td
                                            className={`px-5 py-4 font-bold ${movement.quantity >= 0 ? "text-emerald-600" : "text-red-600"}`}
                                        >
                                            {movement.quantity > 0 ? "+" : ""}
                                            {movement.quantity}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {movement.stock_before} →{" "}
                                            {movement.stock_after}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {movement.reference_number ?? "-"}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {movement.user?.name ?? "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-5 py-12 text-center text-slate-500"
                                    >
                                        <ClipboardList className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                                        Belum ada histori mutasi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {movements?.links?.length > 0 && (
                    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4">
                        {movements.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    preserveState
                                    className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label
                                            .replace("Previous", "Sebelumnya")
                                            .replace("Next", "Berikutnya"),
                                    }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-400"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ),
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
