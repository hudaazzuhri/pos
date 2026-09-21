import {
    CalendarDays,
    Check,
    Info,
    Package,
    Search,
    SlidersHorizontal,
    Tag,
} from "lucide-react";
import { formatCurrency } from "@/Helper/helper";
import { Link } from "@inertiajs/react";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import CurrencyInput from "@/Components/CurrencyInput";
import PercentageInput from "@/Components/PercentageInput";
import SelectInput from "@/Components/SelectInput";
import { Button } from "@/Components/ui/button";

export default function DiscountForm({
    data,
    setData,
    errors,
    products,
    productSearch,
    setProductSearch,
    toggleProduct,
    processing,
    editing,
    onSubmit,
    submitLabel,
    cancelHref = route("discounts.index"),
}) {
    const selectedProductCount = data.product_ids.length;

    const updateScope = (scope) => {
        setData({
            ...data,
            scope,
            product_ids: scope === "product" ? data.product_ids : [],
        });
    };

    const cakupanOptions = [
        { value: "global", label: "Semua produk (global)" },
        { value: "product", label: "Produk tertentu" },
    ];

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <form
                id="discount-form"
                onSubmit={onSubmit}
                className="space-y-6 p-4"
            >
                <FormSection
                    icon={Tag}
                    title="Informasi promo"
                    description="Gunakan nama yang mudah dikenali kasir."
                >
                    <Input
                        label="Nama diskon"
                        autoFocus
                        value={data.name}
                        onChange={(event) =>
                            setData("name", event.target.value)
                        }
                        placeholder="Contoh: Promo Akhir Pekan"
                        required
                    />
                </FormSection>

                <FormSection
                    icon={SlidersHorizontal}
                    title="Aturan diskon"
                    description="Tentukan cara promo dihitung dan produk yang menerima promo."
                >
                    <div className="space-y-4">
                        <div>
                            <Label>Tipe Diskon</Label>
                            <div className="mt-1 grid gap-3 sm:grid-cols-2">
                                {[
                                    [
                                        "percentage",
                                        "Persentase",
                                        "Potongan berdasarkan persentase harga.",
                                    ],
                                    [
                                        "fixed",
                                        "Nominal tetap",
                                        "Potongan nominal untuk setiap transaksi.",
                                    ],
                                ].map(([value, label, description]) => (
                                    <label
                                        key={value}
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${data.type === value ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500" : "border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-slate-50"}`}
                                    >
                                        <input
                                            type="radio"
                                            checked={data.type === value}
                                            onChange={() =>
                                                setData("type", value)
                                            }
                                            className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>
                                            <span className="block text-sm font-bold">
                                                {label}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-slate-500">
                                                {description}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {data.type === "percentage" && (
                                <>
                                    <PercentageInput
                                        label="Nilai diskon (%)"
                                        value={data.value}
                                        onChange={(value) =>
                                            setData("value", value)
                                        }
                                        className="field"
                                        placeholder="0.00"
                                    />
                                </>
                            )}
                            {data.type === "fixed" && (
                                <>
                                    <CurrencyInput
                                        label="Nilai diskon (Rp)"
                                        min="0"
                                        step="0.01"
                                        value={data.value}
                                        onChange={(value) =>
                                            setData("value", value)
                                        }
                                        placeholder="0"
                                    />
                                </>
                            )}

                            <CurrencyInput
                                label="Minimal belanja (Rp)"
                                min="0"
                                step="0.01"
                                value={data.min_purchase_amount}
                                onChange={(value) =>
                                    setData("min_purchase_amount", value)
                                }
                                placeholder="0"
                            />
                            <CurrencyInput
                                label="Maksimal potongan (Rp)"
                                min="0"
                                step="0.01"
                                value={data.max_discount_amount}
                                onChange={(value) =>
                                    setData("max_discount_amount", value)
                                }
                                placeholder="Opsional"
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-1">
                                <SelectInput
                                    label="Cakupan Promo"
                                    options={cakupanOptions}
                                    value={cakupanOptions.find(
                                        (option) => option.value === data.scope,
                                    )}
                                    onChange={(e) => {
                                        updateScope(e.value);
                                    }}
                                />
                            </div>
                        </div>

                        {data.scope === "product" && (
                            <ProductPicker
                                products={products}
                                selectedIds={data.product_ids}
                                productSearch={productSearch}
                                setProductSearch={setProductSearch}
                                toggleProduct={toggleProduct}
                                error={errors.product_ids}
                            />
                        )}
                    </div>
                </FormSection>

                <FormSection
                    icon={CalendarDays}
                    title="Periode promo"
                    description="Promo hanya dapat digunakan di antara waktu berikut."
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            label="Tanggal mulai"
                            type="datetime-local"
                            value={data.start_date}
                            onChange={(event) =>
                                setData("start_date", event.target.value)
                            }
                            required
                        />
                        <Input
                            label="Tanggal berakhir"
                            type="datetime-local"
                            value={data.end_date}
                            onChange={(event) =>
                                setData("end_date", event.target.value)
                            }
                            required
                        />
                    </div>
                    {errors.end_date && !errors.start_date && (
                        <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                                Pastikan tanggal berakhir tidak lebih awal dari
                                tanggal mulai.
                            </span>
                        </div>
                    )}
                </FormSection>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40">
                    <input
                        type="checkbox"
                        checked={Boolean(data.is_active)}
                        onChange={(event) =>
                            setData("is_active", event.target.checked)
                        }
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>
                        <span className="block text-sm font-bold text-slate-800">
                            Aktifkan promo setelah disimpan
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                            Promo tetap mengikuti periode yang sudah ditentukan.
                        </span>
                    </span>
                </label>

                {Object.keys(errors).length > 0 && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                            Periksa kembali kolom yang ditandai sebelum
                            menyimpan.
                        </span>
                    </div>
                )}
            </form>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center justify-end">
                    <Link href={cancelHref}>
                        <Button variant="cancel" size="lg">
                            Batal
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        form="discount-form"
                        disabled={processing}
                        variant="primary"
                        size="lg"
                    >
                        {processing
                            ? "Menyimpan..."
                            : submitLabel ||
                              (editing ? "Simpan Perubahan" : "Simpan Diskon")}
                    </Button>
            </div>
        </div>
    );
}

function ProductPicker({
    products,
    selectedIds,
    productSearch,
    setProductSearch,
    toggleProduct,
    error,
}) {
    return (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-bold text-slate-800">
                        Pilih produk
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Promo akan diterapkan pada produk yang dipilih.
                    </p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
                    {selectedIds.length} dipilih
                </span>
            </div>
            <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Cari nama atau SKU..."
                    className="field pl-9"
                />
            </div>
            <div className="mt-3 max-h-52 space-y-1 overflow-y-auto rounded-lg border border-indigo-100 bg-white p-1">
                {products.map((product) => {
                    const selected = selectedIds.includes(product.id);
                    return (
                        <label
                            key={product.id}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition ${selected ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                        >
                            <span className="flex min-w-0 items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => toggleProduct(product.id)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold text-slate-800">
                                        {product.name}
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                                        {product.sku || "Tanpa SKU"} ·{" "}
                                        {formatCurrency(product.sell_price)}
                                    </span>
                                </span>
                            </span>
                            {selected && (
                                <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                            )}
                        </label>
                    );
                })}
                {!products.length && (
                    <div className="px-4 py-8 text-center">
                        <Package className="mx-auto h-7 w-7 text-slate-300" />
                        <p className="mt-2 text-xs text-slate-500">
                            Produk tidak ditemukan.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FormSection({ icon: Icon, title, description, children }) {
    return (
        <section className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-6">
                <div>
                    <h3 className="text-lg font-black text-slate-900">
                        {title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}
