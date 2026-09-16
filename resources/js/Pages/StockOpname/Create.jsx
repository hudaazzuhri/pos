import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Save } from "lucide-react";
import { useMemo } from "react";

const inputClassName =
    "h-10 w-full rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500";

export default function StockOpnameCreate({ products = [], outlet }) {
    const { data, setData, post, processing, errors } = useForm({
        notes: "",
        items: products.map((product) => ({
            product_id: product.id,
            physical_stock: product.stock,
            notes: "",
        })),
    });
    const productMap = useMemo(
        () => new Map(products.map((product) => [product.id, product])),
        [products],
    );

    const updatePhysicalStock = (index, value) => {
        const items = [...data.items];
        items[index] = {
            ...items[index],
            physical_stock: Math.max(0, Number(value)),
        };
        setData("items", items);
    };

    const updateItemNotes = (index, value) => {
        const items = [...data.items];
        items[index] = { ...items[index], notes: value };
        setData("items", items);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route("stock-opname.store"), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buat Stock Opname" />
            <PageHeader
                title="Buat Stock Opname"
                subtitle={`Hitung stok fisik untuk ${outlet?.name ?? "outlet aktif"}.`}
                backAction={route("stock-opname.index")}
            />
            <form onSubmit={submit} className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className="text-sm font-semibold text-slate-700">
                        Catatan Opname
                    </label>
                    <textarea
                        value={data.notes}
                        onChange={(event) =>
                            setData("notes", event.target.value)
                        }
                        rows="2"
                        className="mt-2 block w-full rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Contoh: Opname akhir bulan"
                    />
                    {errors.notes && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.notes}
                        </p>
                    )}
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4">
                        <h2 className="font-semibold text-slate-900">
                            Lembar Penghitungan Fisik
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Stok sistem disnapshot saat draft dibuat. Isi stok
                            fisik aktual pada kolom terakhir.
                        </p>
                        {errors.items && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.items}
                            </p>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-[820px] w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                        SKU
                                    </th>
                                    <th className="px-4 py-3 font-semibold text-slate-600">
                                        Stok Sistem
                                    </th>
                                    <th className="w-48 px-4 py-3 font-semibold text-slate-600">
                                        Stok Fisik
                                    </th>
                                    <th className="w-64 px-4 py-3 font-semibold text-slate-600">
                                        Catatan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.items.map((item, index) => {
                                    const product = productMap.get(
                                        item.product_id,
                                    );
                                    const difference =
                                        Number(item.physical_stock) -
                                        Number(product?.stock ?? 0);
                                    return (
                                        <tr
                                            key={item.product_id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                {product?.name}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {product?.sku || "-"}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {product?.stock}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.physical_stock}
                                                    onChange={(event) =>
                                                        updatePhysicalStock(
                                                            index,
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={inputClassName}
                                                />
                                                <span
                                                    className={`mt-1 block text-xs font-semibold ${difference < 0 ? "text-red-600" : difference > 0 ? "text-emerald-600" : "text-slate-400"}`}
                                                >
                                                    {difference > 0 ? "+" : ""}
                                                    {difference} selisih
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    value={item.notes}
                                                    onChange={(event) =>
                                                        updateItemNotes(
                                                            index,
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={inputClassName}
                                                    placeholder="Opsional"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                    >
                        {processing ? "Menyimpan..." : "Simpan Draft Opname"}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
