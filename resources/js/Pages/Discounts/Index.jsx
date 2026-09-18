import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHeader from "@/Components/PageHeader";
import { Head, router, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Filter,
    Plus,
    Search,
    Tag,
    Trash2,
    X,
} from "lucide-react";
import { formatCurrency } from "@/Helper/helper";

const inputClassName =
    "mt-1 block w-full rounded-lg border-slate-200 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500";
const labelClassName =
    "mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500";

const emptyForm = {
    name: "",
    type: "percentage",
    value: "",
    scope: "global",
    product_ids: [],
    min_purchase_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    is_active: true,
};

export default function DiscountsIndex({
    discounts,
    products = [],
    filters = {},
}) {
    const rows = discounts?.data ?? [];
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "all");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [productSearch, setProductSearch] = useState("");
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm(emptyForm);

    const filteredProducts = useMemo(() => {
        const term = productSearch.trim().toLowerCase();
        if (!term) return products;
        return products.filter((product) =>
            [product.name, product.sku].some((value) =>
                String(value || "")
                    .toLowerCase()
                    .includes(term),
            ),
        );
    }, [productSearch, products]);

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(
            route("discounts.index"),
            { search, status },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const openCreate = () => {
        reset();
        clearErrors();
        setEditingDiscount(null);
        setProductSearch("");
        setModalOpen(true);
    };

    const openEdit = (discount) => {
        reset({
            name: discount.name,
            type: discount.type === "fixed_amount" ? "fixed" : discount.type,
            value: discount.value,
            scope: discount.scope === "transaction" ? "global" : discount.scope,
            product_ids: discount.products?.map((product) => product.id) || [],
            min_purchase_amount: discount.min_purchase_amount || "",
            max_discount_amount: discount.max_discount_amount || "",
            start_date: toDateTimeLocal(discount.start_date),
            end_date: toDateTimeLocal(discount.end_date),
            is_active: Boolean(discount.is_active),
        });
        clearErrors();
        setEditingDiscount(discount);
        setProductSearch("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (processing) return;
        setModalOpen(false);
        setEditingDiscount(null);
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: closeModal,
        };
        if (editingDiscount) {
            put(route("discounts.update", editingDiscount.id), options);
            return;
        }
        post(route("discounts.store"), options);
    };

    const toggleProduct = (id) => {
        const selected = data.product_ids.includes(id);
        setData(
            "product_ids",
            selected
                ? data.product_ids.filter((productId) => productId !== id)
                : [...data.product_ids, id],
        );
    };

    const toggleStatus = (discount) => {
        router.patch(
            route("discounts.toggleStatus", discount.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const deleteDiscount = (discount) => {
        if (!window.confirm(`Hapus diskon "${discount.name}"?`)) return;
        router.delete(route("discounts.destroy", discount.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Diskon & Promo" />
            <PageHeader
                title="Manajemen Diskon & Promo"
                subtitle="Kelola harga promo berdasarkan transaksi atau produk tertentu."
                actions={
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" /> Buat Diskon Baru
                    </button>
                }
            />

            <div className="space-y-5">
                <form
                    onSubmit={applyFilters}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center"
                >
                    <div className="relative min-w-0 flex-1">
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari nama promo..."
                            className="w-full rounded-lg border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                router.get(
                                    route("discounts.index"),
                                    { search, status: event.target.value },
                                    { preserveState: true, replace: true },
                                );
                            }}
                            className="rounded-lg border-slate-200 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Non-Aktif</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                        Terapkan
                    </button>
                </form>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-[1050px] w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    {[
                                        "Nama Promo",
                                        "Tipe & Nilai",
                                        "Cakupan",
                                        "Syarat",
                                        "Masa Berlaku",
                                        "Status",
                                        "Aksi",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="px-5 py-3 font-bold"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length ? (
                                    rows.map((discount) => {
                                        const expired =
                                            discount.end_date &&
                                            new Date(discount.end_date) <
                                                new Date();
                                        const inactive = !discount.is_active;
                                        return (
                                            <tr
                                                key={discount.id}
                                                className={
                                                    expired
                                                        ? "bg-rose-50/40"
                                                        : "hover:bg-slate-50"
                                                }
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-bold text-slate-900">
                                                        {discount.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        #{discount.id}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                                                        {discount.type ===
                                                        "percentage"
                                                            ? `${discount.value}%`
                                                            : formatCurrency(
                                                                  discount.value,
                                                              )}
                                                    </span>
                                                    {discount.max_discount_amount &&
                                                        discount.type ===
                                                            "percentage" && (
                                                            <p className="mt-2 text-xs text-slate-500">
                                                                Maks.{" "}
                                                                {formatCurrency(
                                                                    discount.max_discount_amount,
                                                                )}
                                                            </p>
                                                        )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                                                        {discount.scope ===
                                                        "transaction"
                                                            ? "Global"
                                                            : "Produk tertentu"}
                                                    </span>
                                                    {discount.products?.length >
                                                        0 && (
                                                        <p className="mt-2 max-w-[180px] truncate text-xs text-slate-500">
                                                            {discount.products
                                                                .map(
                                                                    (product) =>
                                                                        product.name,
                                                                )
                                                                .join(", ")}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-xs text-slate-600">
                                                    <p>
                                                        Min.{" "}
                                                        {formatCurrency(
                                                            discount.min_purchase_amount,
                                                        )}
                                                    </p>
                                                    {discount.max_discount_amount && (
                                                        <p className="mt-1">
                                                            Maks.{" "}
                                                            {formatCurrency(
                                                                discount.max_discount_amount,
                                                            )}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                                                    {formatDate(
                                                        discount.start_date,
                                                    )}
                                                    <span className="mx-1 text-slate-300">
                                                        -
                                                    </span>
                                                    {formatDate(
                                                        discount.end_date,
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        expired={expired}
                                                        inactive={inactive}
                                                    />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    discount,
                                                                )
                                                            }
                                                            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${discount.is_active ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                                                        >
                                                            {discount.is_active
                                                                ? "Nonaktifkan"
                                                                : "Aktifkan"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(
                                                                    discount,
                                                                )
                                                            }
                                                            className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteDiscount(
                                                                    discount,
                                                                )
                                                            }
                                                            className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-5 py-16 text-center"
                                        >
                                            <Tag className="mx-auto h-10 w-10 text-slate-300" />
                                            <p className="mt-3 font-semibold text-slate-500">
                                                Belum ada diskon.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={discounts?.links || []} />
                </div>
            </div>

            {modalOpen && (
                <DiscountModal
                    data={data}
                    setData={setData}
                    errors={errors}
                    products={filteredProducts}
                    productSearch={productSearch}
                    setProductSearch={setProductSearch}
                    toggleProduct={toggleProduct}
                    processing={processing}
                    editing={Boolean(editingDiscount)}
                    onClose={closeModal}
                    onSubmit={submit}
                />
            )}
        </AuthenticatedLayout>
    );
}

function DiscountModal({
    data,
    setData,
    errors,
    products,
    productSearch,
    setProductSearch,
    toggleProduct,
    processing,
    editing,
    onClose,
    onSubmit,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-200 p-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                            {editing ? "Perbarui promo" : "Promo baru"}
                        </p>
                        <h2 className="mt-1 text-xl font-black text-slate-950">
                            {editing ? "Edit Diskon" : "Buat Diskon Baru"}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form
                    onSubmit={onSubmit}
                    className="max-h-[calc(100vh-180px)] space-y-5 overflow-y-auto p-5"
                >
                    <Field label="Nama Diskon" error={errors.name}>
                        <input
                            value={data.name}
                            onChange={(event) =>
                                setData("name", event.target.value)
                            }
                            className="field"
                            placeholder="Contoh: Promo Akhir Pekan"
                        />
                    </Field>
                    <div>
                        <p className="label">Tipe Diskon</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ["percentage", "Persentase (%)"],
                                ["fixed", "Nominal Tetap (Rp)"],
                            ].map(([value, label]) => (
                                <label
                                    key={value}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-semibold ${data.type === value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600"}`}
                                >
                                    <input
                                        type="radio"
                                        checked={data.type === value}
                                        onChange={() => setData("type", value)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label={
                                data.type === "percentage"
                                    ? "Nilai Diskon (%)"
                                    : "Nilai Diskon (Rp)"
                            }
                            error={errors.value}
                        >
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.value}
                                onChange={(event) =>
                                    setData("value", event.target.value)
                                }
                                className="field"
                            />
                        </Field>
                        <Field label="Cakupan Promo" error={errors.scope}>
                            <select
                                value={data.scope}
                                onChange={(event) =>
                                    setData("scope", event.target.value)
                                }
                                className="field"
                            >
                                <option value="global">
                                    Semua Produk (Global)
                                </option>
                                <option value="product">Produk Tertentu</option>
                            </select>
                        </Field>
                    </div>
                    {data.scope === "product" && (
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="label">Pilih Produk</p>
                                <span className="text-xs font-bold text-indigo-700">
                                    {data.product_ids.length} dipilih
                                </span>
                            </div>
                            <div className="relative mt-2">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={productSearch}
                                    onChange={(event) =>
                                        setProductSearch(event.target.value)
                                    }
                                    placeholder="Cari nama atau SKU..."
                                    className="field pl-9"
                                />
                            </div>
                            <div className="mt-3 max-h-44 space-y-1 overflow-y-auto">
                                {products.map((product) => (
                                    <label
                                        key={product.id}
                                        className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-3 py-2 text-sm hover:bg-indigo-50"
                                    >
                                        <span className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={data.product_ids.includes(
                                                    product.id,
                                                )}
                                                onChange={() =>
                                                    toggleProduct(product.id)
                                                }
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span>
                                                <span className="block font-semibold text-slate-800">
                                                    {product.name}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {product.sku || "Tanpa SKU"}{" "}
                                                    ·{" "}
                                                    {formatCurrency(
                                                        product.sell_price,
                                                    )}
                                                </span>
                                            </span>
                                        </span>
                                        {data.product_ids.includes(
                                            product.id,
                                        ) && (
                                            <Check className="h-4 w-4 text-indigo-600" />
                                        )}
                                    </label>
                                ))}
                                {!products.length && (
                                    <p className="py-5 text-center text-xs text-slate-500">
                                        Produk tidak ditemukan.
                                    </p>
                                )}
                            </div>
                            {errors.product_ids && (
                                <p className="mt-2 text-xs text-rose-600">
                                    {errors.product_ids}
                                </p>
                            )}
                        </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Minimal Belanja (Rp)"
                            error={errors.min_purchase_amount}
                        >
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.min_purchase_amount}
                                onChange={(event) =>
                                    setData(
                                        "min_purchase_amount",
                                        event.target.value,
                                    )
                                }
                                className="field"
                            />
                        </Field>
                        <Field
                            label="Maksimal Potongan (Rp)"
                            error={errors.max_discount_amount}
                        >
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.max_discount_amount}
                                onChange={(event) =>
                                    setData(
                                        "max_discount_amount",
                                        event.target.value,
                                    )
                                }
                                className="field"
                            />
                        </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Tanggal Mulai" error={errors.start_date}>
                            <input
                                type="datetime-local"
                                value={data.start_date}
                                onChange={(event) =>
                                    setData("start_date", event.target.value)
                                }
                                className="field"
                            />
                        </Field>
                        <Field label="Tanggal Berakhir" error={errors.end_date}>
                            <input
                                type="datetime-local"
                                value={data.end_date}
                                onChange={(event) =>
                                    setData("end_date", event.target.value)
                                }
                                className="field"
                            />
                        </Field>
                    </div>
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700">
                        <input
                            type="checkbox"
                            checked={Boolean(data.is_active)}
                            onChange={(event) =>
                                setData("is_active", event.target.checked)
                            }
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />{" "}
                        Diskon aktif setelah disimpan
                    </label>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {processing
                                ? "Menyimpan..."
                                : editing
                                  ? "Simpan Perubahan"
                                  : "Simpan Diskon"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="label">{label}</span>
            {children}
            {error && (
                <span className="mt-1 block text-xs text-rose-600">
                    {error}
                </span>
            )}
        </label>
    );
}
function StatusBadge({ expired, inactive }) {
    if (expired)
        return (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                Expired
            </span>
        );
    if (inactive)
        return (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                Non-Aktif
            </span>
        );
    return (
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
            Aktif
        </span>
    );
}
function Pagination({ links }) {
    if (links.length < 2) return null;
    return (
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-xs text-slate-500">Navigasi halaman</p>
            <div className="flex gap-1">
                {links.map((link) => (
                    <button
                        type="button"
                        key={link.label}
                        disabled={!link.url}
                        onClick={() =>
                            link.url &&
                            router.visit(link.url, {
                                preserveScroll: true,
                                preserveState: true,
                            })
                        }
                        className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${link.active ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                        dangerouslySetInnerHTML={{
                            __html: link.label.includes("Previous")
                                ? "<"
                                : link.label.includes("Next")
                                  ? ">"
                                  : link.label,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
function toDateTimeLocal(value) {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
function formatDate(value) {
    return value
        ? new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          }).format(new Date(value))
        : "-";
}
