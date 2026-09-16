import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useMemo } from "react";

const inputClassName = "h-10 w-full rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500";

export default function StockAdjustment({ products = [], outlet }) {
    const { data, setData, post, processing, errors } = useForm({
        type: "addition",
        notes: "",
        items: [{ product_id: "", quantity: 0 }],
    });

    const selectedIds = useMemo(() => data.items.map((item) => String(item.product_id)).filter(Boolean), [data.items]);

    const updateItem = (index, field, value) => {
        const items = [...data.items];
        items[index] = { ...items[index], [field]: field === "quantity" ? Math.max(0, Number(value)) : value };
        setData("items", items);
    };

    const addItem = () => setData("items", [...data.items, { product_id: "", quantity: 0 }]);
    const removeItem = (index) => setData("items", data.items.filter((_, itemIndex) => itemIndex !== index));

    const submit = (event) => {
        event.preventDefault();
        post(route("stock.adjustments.store"), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Penyesuaian Stok" />
            <PageHeader
                title="Penyesuaian Stok"
                subtitle={`Catat perubahan stok untuk ${outlet?.name ?? "outlet aktif"}.`}
                backAction={route("stock.index")}
            />
            <form onSubmit={submit} className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-4">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Jenis Penyesuaian
                            </label>
                            <select
                                value={data.type}
                                onChange={(event) =>
                                    setData("type", event.target.value)
                                }
                                className={`${inputClassName} mt-2`}
                            >
                                <option value="addition">
                                    Penambahan stok
                                </option>
                                <option value="subtraction">
                                    Pengurangan stok
                                </option>
                                <option value="opname">Stok opname</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700">
                                Catatan
                            </label>
                            <input
                                value={data.notes}
                                onChange={(event) =>
                                    setData("notes", event.target.value)
                                }
                                className={`${inputClassName} mt-2`}
                                placeholder="Contoh: Kulakan supplier / barang rusak"
                            />
                        </div>
                    </div>
                    {errors.items && (
                        <p className="mt-3 text-sm text-red-600">
                            {errors.items}
                        </p>
                    )}
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 p-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Daftar Produk
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {data.type === "opname"
                                    ? "Masukkan jumlah stok fisik akhir."
                                    : "Masukkan jumlah perubahan stok."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addItem}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Baris
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-[720px] w-full divide-y divide-slate-200 text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="w-[48%] px-4 py-3 font-semibold text-slate-600">Produk</th>
                                    <th className="w-36 px-4 py-3 font-semibold text-slate-600">Stok Saat Ini</th>
                                    <th className="w-44 px-4 py-3 font-semibold text-slate-600">
                                        {data.type === "opname" ? "Stok Akhir" : "Jumlah"}
                                    </th>
                                    <th className="w-20 px-4 py-3 text-right font-semibold text-slate-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {data.items.map((item, index) => {
                                    const product = products.find(
                                        (entry) => String(entry.id) === String(item.product_id),
                                    );

                                    return (
                                        <tr key={index} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <select
                                                    value={item.product_id}
                                                    onChange={(event) => updateItem(index, "product_id", event.target.value)}
                                                    className={inputClassName}
                                                >
                                                    <option value="">Pilih produk</option>
                                                    {products.map((entry) => (
                                                        <option
                                                            key={entry.id}
                                                            value={entry.id}
                                                            disabled={selectedIds.includes(String(entry.id)) && String(entry.id) !== String(item.product_id)}
                                                        >
                                                            {entry.name} ({entry.stock} stok)
                                                        </option>
                                                    ))}
                                                </select>
                                                {product?.sku && <p className="mt-1 text-xs text-slate-400">SKU: {product.sku}</p>}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-700">
                                                {product ? `${product.stock} stok` : "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.quantity}
                                                    onChange={(event) => updateItem(index, "quantity", event.target.value)}
                                                    className={inputClassName}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    disabled={data.items.length === 1}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50 disabled:opacity-30"
                                                    aria-label="Hapus baris"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
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
                        className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                    >
                        {processing ? "Menyimpan..." : "Simpan Penyesuaian"}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
