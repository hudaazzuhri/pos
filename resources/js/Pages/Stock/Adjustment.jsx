import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useMemo } from "react";
import FormSection from "@/Components/FormSection";
import { Button } from "@/Components/ui/button";
import SelectInput from "@/Components/SelectInput";
import { Input } from "@/Components/ui/input";

export default function StockAdjustment({ products = [], outlet }) {
    const { data, setData, post, processing, errors } = useForm({
        type: "addition",
        notes: "",
        items: [{ product_id: "", quantity: 0 }],
    });

    const jenisPenyesuaianOptions = [
        {
            value: "addition",
            label: "Penambahan stok",
        },
        {
            value: "subtraction",
            label: "Pengurangan stok",
        },
        {
            value: "opname",
            label: "Stok opname",
        },
    ];

    const selectedIds = useMemo(
        () => data.items.map((item) => String(item.product_id)).filter(Boolean),
        [data.items],
    );

    const updateItem = (index, field, value) => {
        const items = [...data.items];
        items[index] = {
            ...items[index],
            [field]: field === "quantity" ? Math.max(0, Number(value)) : value,
        };
        setData("items", items);
    };

    const addItem = () =>
        setData("items", [...data.items, { product_id: "", quantity: 0 }]);
    const removeItem = (index) =>
        setData(
            "items",
            data.items.filter((_, itemIndex) => itemIndex !== index),
        );

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
            <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <form
                    id="adjustment-form"
                    onSubmit={submit}
                    className="space-y-6 p-4"
                >
                    <FormSection
                        title="Informasi Penyesuaian"
                        description="Pilih jenis penyesuaian dan catatan terkait."
                    >
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <SelectInput
                                    label="Jenis Penyesuaian"
                                    value={jenisPenyesuaianOptions.find(
                                        (option) => option.value === data.type,
                                    )}
                                    onChange={(event) =>
                                        setData("type", event?.value)
                                    }
                                    options={jenisPenyesuaianOptions}
                                    placeholder="Pilih jenis penyesuaian"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Catatan"
                                    value={data.notes}
                                    onChange={(event) =>
                                        setData("notes", event.target.value)
                                    }
                                    placeholder="Contoh: Kulakan supplier / barang rusak"
                                />
                            </div>
                        </div>
                    </FormSection>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-200 p-4">
                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Daftar Produk
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {data.type === "opname"
                                        ? "Masukkan jumlah stok fisik akhir."
                                        : "Masukkan jumlah perubahan stok."}
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={addItem}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                size="lg"
                            >
                                Tambah Produk
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-[720px] w-full divide-y divide-slate-200 text-left text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="w-[48%] px-4 py-3 font-semibold text-slate-600">
                                            Produk
                                        </th>
                                        <th className="w-36 px-4 py-3 font-semibold text-slate-600">
                                            Stok Saat Ini
                                        </th>
                                        <th className="w-44 px-4 py-3 font-semibold text-slate-600">
                                            {data.type === "opname"
                                                ? "Stok Akhir"
                                                : "Jumlah"}
                                        </th>
                                        <th className="w-20 px-4 py-3 text-right font-semibold text-slate-600">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {data.items.map((item, index) => {
                                        const product = products.find(
                                            (entry) =>
                                                String(entry.id) ===
                                                String(item.product_id),
                                        );

                                        return (
                                            <tr
                                                key={index}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-3">
                                                    <SelectInput
                                                        value={
                                                            products.find((option) => option.value === item.product_id)
                                                        }
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                "product_id",
                                                                event
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Pilih produk"
                                                        options={products.map(
                                                            (entry) => ({
                                                                value: entry.id,
                                                                label: `${entry.name} (${entry.stock} stok)`,
                                                                disabled:
                                                                    selectedIds.includes(
                                                                        String(
                                                                            entry.id,
                                                                        ),
                                                                    ) &&
                                                                    String(
                                                                        entry.id,
                                                                    ) !==
                                                                        String(
                                                                            item.product_id,
                                                                        ),
                                                            }),
                                                        )}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                    {product
                                                        ? `${product.stock} stok`
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={item.quantity}
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                "quantity",
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(index)
                                                        }
                                                        disabled={
                                                            data.items
                                                                .length === 1
                                                        }
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
                </form>
                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center justify-end">
                    <Link href={route("stock.index")}>
                        <Button variant="cancel" size="lg">
                            Batal
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        form="adjustment-form"
                        disabled={processing}
                        variant="primary"
                        size="lg"
                    >
                        {processing ? "Menyimpan..." : "Simpan Penyesuaian"}
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
