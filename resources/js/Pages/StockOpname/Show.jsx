import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
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
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const statusLabels = {
    draft: "Draft",
    completed: "Selesai",
    canceled: "Dibatalkan",
};
const statusClasses = {
    draft: "bg-amber-50 text-amber-700",
    completed: "bg-emerald-50 text-emerald-700",
    canceled: "bg-red-50 text-red-700",
};

export default function StockOpnameShow({ opname }) {
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

    const approve = () => {
        router.post(
            route("stock-opname.adjust", opname.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsApprovalDialogOpen(false),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Opname ${opname.opname_number}`} />
            <PageHeader
                title={opname.opname_number}
                subtitle={`${opname.outlet?.name ?? "Outlet"} · dibuat oleh ${opname.user?.name ?? "-"}`}
                backAction={route("stock-opname.index")}
            />
            <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-black font-bold">Status</p>
                        <span
                            className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[opname.status]}`}
                        >
                            {statusLabels[opname.status]}
                        </span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-black font-bold">Item diperiksa</p>
                        <p className="mt-2 text-xl font-bold text-slate-900">
                            {opname.total_items_checked}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-black font-bold">Total selisih</p>
                        <p
                            className={`mt-2 text-xl font-bold ${opname.total_discrepancy_qty < 0 ? "text-red-600" : "text-emerald-600"}`}
                        >
                            {opname.total_discrepancy_qty > 0 ? "+" : ""}
                            {opname.total_discrepancy_qty}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-sm text-black font-bold">Nilai selisih</p>
                        <p className="mt-2 text-xl font-bold text-slate-900">
                            Rp{" "}
                            {Number(
                                opname.total_discrepancy_value,
                            ).toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>
                {opname.notes && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                        <span className="font-semibold text-slate-800">
                            Catatan:
                        </span>{" "}
                        {opname.notes}
                    </div>
                )}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 p-4">
                        <h2 className="font-semibold text-slate-900">
                            Detail Penghitungan
                        </h2>
                        {opname.status === "draft" && (
                            <button
                                type="button"
                                onClick={() => setIsApprovalDialogOpen(true)}
                                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                            >
                                Setujui & Sesuaikan Stok
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-[760px] w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                        Sistem
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                        Fisik
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                        Selisih
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                        Nilai Selisih
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                        Catatan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {opname.details?.map((detail) => (
                                    <tr key={detail.id}>
                                        <td className="px-4 py-3 font-semibold text-slate-900">
                                            {detail.product?.name}
                                            <p className="text-xs font-normal text-slate-500">
                                                {detail.product?.sku ||
                                                    "Tanpa SKU"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {detail.system_stock}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {detail.physical_stock}
                                        </td>
                                        <td
                                            className={`px-4 py-3 font-bold ${detail.difference < 0 ? "text-red-600" : detail.difference > 0 ? "text-emerald-600" : "text-slate-400"}`}
                                        >
                                            {detail.difference > 0 ? "+" : ""}
                                            {detail.difference}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            Rp{" "}
                                            {Number(
                                                detail.total_discrepancy_value,
                                            ).toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {detail.notes || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AlertDialog
                open={isApprovalDialogOpen}
                onOpenChange={setIsApprovalDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Setujui stock opname?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Stok sistem akan disesuaikan dengan stok fisik pada dokumen ini dan mutasinya akan dicatat sebagai audit.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={approve}
                            className="bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                            Ya, Setujui
                        </AlertDialogAction>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
