import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Save } from "lucide-react";
import { useMemo, useState } from "react";
import FormSection from "@/Components/FormSection";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";

const inputClassName =
    "h-10 w-full rounded-md border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500";

export default function StockOpnameCreate({ products = [], outlet }) {
    const [search, setSearch] = useState("");
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
    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        return data.items.reduce((items, item, index) => {
            const product = productMap.get(item.product_id);
            const searchableText = [
                product?.name,
                product?.sku,
                product?.barcode,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (!query || searchableText.includes(query)) {
                items.push({ item, index, product });
            }

            return items;
        }, []);
    }, [data.items, productMap, search]);

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
            <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <form
                    id="opname-form"
                    onSubmit={submit}
                    className="space-y-6 p-4"
                >
                    <FormSection
                        title="Informasi Opname"
                        description="Isi catatan untuk stock opname ini. Catatan bersifat opsional."
                    >
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
                    </FormSection>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Penghitungan Fisik
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Stok sistem disnapshot saat draft
                                        dibuat. Isi stok fisik aktual pada kolom
                                        terakhir.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <Input
                                id="product-search"
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Nama, SKU, atau barcode..."
                            />
                        </div>
                        <div className="max-h-[32rem] overflow-auto border-t border-slate-200">
                            <table className="min-w-[820px] w-full divide-y divide-slate-200 text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="sticky top-0 z-10 bg-slate-50 px-4 py-3 font-semibold text-slate-600">
                                            Produk
                                        </th>
                                        <th className="sticky top-0 z-10 w-28 bg-slate-50 px-4 py-3 font-semibold text-slate-600">
                                            Stok Sistem
                                        </th>
                                        <th className="sticky top-0 z-10 w-48 bg-slate-50 px-4 py-3 font-semibold text-slate-600">
                                            Stok Fisik
                                        </th>
                                        <th className="sticky top-0 z-10 w-32 bg-slate-50 px-4 py-3 font-semibold text-slate-600">
                                            Selisih
                                        </th>
                                        <th className="sticky top-0 z-10 w-64 bg-slate-50 px-4 py-3 font-semibold text-slate-600">
                                            Catatan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 overflow-y-auto bg-white">
                                    {filteredItems.length ? (
                                        filteredItems.map(
                                            ({ item, index, product }) => {
                                                const difference =
                                                    Number(
                                                        item.physical_stock,
                                                    ) -
                                                    Number(product?.stock ?? 0);
                                                return (
                                                    <tr
                                                        key={item.product_id}
                                                        className="hover:bg-slate-50"
                                                    >
                                                        <td className="px-4 py-3 flex flex-col gap-0.5">
                                                            <div className="flex flex-row items-center gap-1">
                                                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md w-fit">
                                                                    {product?.sku ||
                                                                        "-"}
                                                                </span>
                                                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md w-fit">
                                                                    {product?.barcode ||
                                                                        "-"}
                                                                </span>
                                                            </div>
                                                            <span className="font-medium text-slate-900">
                                                                {product?.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-slate-700">
                                                            {product?.stock}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={
                                                                    item.physical_stock
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updatePhysicalStock(
                                                                        index,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className={
                                                                    inputClassName
                                                                }
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`block text-sm ${difference < 0 ? "text-red-600" : difference > 0 ? "text-emerald-600" : "text-slate-400"}`}
                                                            >
                                                                {difference > 0
                                                                    ? "+"
                                                                    : ""}
                                                                {difference}{" "}
                                                                selisih
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                value={
                                                                    item.notes
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateItemNotes(
                                                                        index,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className={
                                                                    inputClassName
                                                                }
                                                                placeholder="Opsional"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            },
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-4 py-8 text-center text-sm text-slate-500"
                                            >
                                                Tidak ada produk yang cocok
                                                dengan pencarian.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center justify-end">
                    <Link href={route("stock-opname.index")}>
                        <Button variant="cancel" size="lg">
                            Batal
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        form="opname-form"
                        disabled={processing}
                        variant="primary"
                        size="lg"
                    >
                        {processing
                            ? "Menyimpan..."
                            : "Simpan Draft Opname"}
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
