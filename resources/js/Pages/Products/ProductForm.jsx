import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Link } from "@inertiajs/react";

const emptyVariant = () => ({
    name: "",
    sku: "",
    barcode: "",
    buy_price: "",
    sell_price: "",
    stock: "",
    is_active: true,
});

export const normalizeCurrencyValue = (value) => {
    if (value === "" || value === null || value === undefined) {
        return "";
    }

    const sanitized = String(value)
        .replace(/\s+/g, "")
        .replace(/[^0-9,.-]/g, "");

    if (sanitized === "") {
        return "";
    }

    const hasDot = sanitized.includes(".");
    const hasComma = sanitized.includes(",");

    if (hasDot && hasComma) {
        const lastDot = sanitized.lastIndexOf(".");
        const lastComma = sanitized.lastIndexOf(",");
        const decimalSeparator = lastComma > lastDot ? "," : ".";
        const separatorless =
            decimalSeparator === ","
                ? sanitized.replace(/\./g, "")
                : sanitized.replace(/,/g, "");
        const [integerPart, decimalPart = ""] = separatorless.split(decimalSeparator);

        return `${integerPart.replace(/\D/g, "")}${decimalPart ? `.${decimalPart.replace(/\D/g, "")}` : ""}`;
    }

    if (hasDot) {
        const parts = sanitized.split(".");

        if (parts.length > 2) {
            return parts.join("").replace(/\D/g, "");
        }

        if (parts[1] && parts[1].length <= 2) {
            return `${parts[0].replace(/\D/g, "")}.${parts[1].replace(/\D/g, "")}`;
        }

        return parts.join("").replace(/\D/g, "");
    }

    if (hasComma) {
        const parts = sanitized.split(",");

        if (parts.length > 2) {
            return parts.join("").replace(/\D/g, "");
        }

        if (parts[1] && parts[1].length <= 2) {
            return `${parts[0].replace(/\D/g, "")}.${parts[1].replace(/\D/g, "")}`;
        }

        return parts.join("").replace(/\D/g, "");
    }

    return sanitized.replace(/\D/g, "");
};

export const formatCurrencyValue = (value) => {
    const normalizedValue = normalizeCurrencyValue(value);

    if (normalizedValue === "") {
        return "";
    }

    const numericValue = Number(normalizedValue);

    if (!Number.isFinite(numericValue)) {
        return "";
    }

    const formattedValue = new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numericValue);

    return `Rp ${formattedValue}`;
};

export default function ProductForm({
    categories = [],
    data,
    setData,
    errors = {},
    processing = false,
    onSubmit,
    submitLabel = "Simpan Produk",
    cancelHref = route("products.index"),
}) {
    const variants = data.variants ?? [];

    const updateVariant = (index, field, value) => {
        const nextVariants = variants.map((variant, variantIndex) =>
            variantIndex === index
                ? { ...variant, [field]: value }
                : variant,
        );

        setData("variants", nextVariants);
    };

    const addVariant = () => {
        setData("variants", [...variants, emptyVariant()]);
    };

    const removeVariant = (index) => {
        setData(
            "variants",
            variants.filter((_, variantIndex) => variantIndex !== index),
        );
    };

    return (
        <div className="space-y-6">
            <form
                onSubmit={onSubmit}
                className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="name" value="Nama Produk" />
                        <TextInput
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData("name", event.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="off"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="category_id" value="Kategori" />
                        <select
                            id="category_id"
                            value={data.category_id}
                            onChange={(event) =>
                                setData("category_id", event.target.value)
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <InputError
                            message={errors.category_id}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="sku" value="SKU" />
                        <TextInput
                            id="sku"
                            value={data.sku}
                            onChange={(event) =>
                                setData("sku", event.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="off"
                        />
                        <InputError message={errors.sku} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="barcode" value="Barcode" />
                        <TextInput
                            id="barcode"
                            value={data.barcode}
                            onChange={(event) =>
                                setData("barcode", event.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="off"
                        />
                        <InputError message={errors.barcode} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="buy_price" value="Harga Beli" />
                        <TextInput
                            id="buy_price"
                            type="text"
                            inputMode="decimal"
                            value={formatCurrencyValue(data.buy_price)}
                            onChange={(event) =>
                                setData(
                                    "buy_price",
                                    normalizeCurrencyValue(event.target.value),
                                )
                            }
                            className="mt-1 block w-full"
                            placeholder="Rp 0"
                        />
                        <InputError
                            message={errors.buy_price}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="sell_price" value="Harga Jual" />
                        <TextInput
                            id="sell_price"
                            type="text"
                            inputMode="decimal"
                            value={formatCurrencyValue(data.sell_price)}
                            onChange={(event) =>
                                setData(
                                    "sell_price",
                                    normalizeCurrencyValue(event.target.value),
                                )
                            }
                            className="mt-1 block w-full"
                            placeholder="Rp 0"
                        />
                        <InputError
                            message={errors.sell_price}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="stock" value="Stok" />
                        <TextInput
                            id="stock"
                            type="number"
                            min="0"
                            value={data.stock}
                            onChange={(event) =>
                                setData("stock", event.target.value)
                            }
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.stock} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="min_stock_alert" value="Min. Stok" />
                        <TextInput
                            id="min_stock_alert"
                            type="number"
                            min="0"
                            value={data.min_stock_alert}
                            onChange={(event) =>
                                setData("min_stock_alert", event.target.value)
                            }
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.min_stock_alert} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-start pt-6">
                        <label className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(event) =>
                                    setData("is_active", event.target.checked)
                                }
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Produk aktif
                            </span>
                        </label>
                    </div>
                </div>

                {/* <div className="space-y-4 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">
                                Varian Produk
                            </h2>
                            <p className="text-sm text-gray-500">
                                Tambahkan pilihan produk seperti ukuran, warna, atau rasa.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                        >
                            Tambah Varian
                        </button>
                    </div>

                    {variants.length === 0 && (
                        <p className="rounded-md border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500">
                            Belum ada varian produk.
                        </p>
                    )}

                    {variants.map((variant, index) => (
                        <div
                            key={variant.id ?? `new-${index}`}
                            className="space-y-4 rounded-lg border border-gray-200 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-800">
                                    Varian {index + 1}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="text-sm font-medium text-red-600 hover:text-red-500"
                                >
                                    Hapus
                                </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <InputLabel
                                        htmlFor={`variant-${index}-name`}
                                        value="Nama Varian"
                                    />
                                    <TextInput
                                        id={`variant-${index}-name`}
                                        value={variant.name ?? ""}
                                        onChange={(event) =>
                                            updateVariant(index, "name", event.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        autoComplete="off"
                                    />
                                    <InputError
                                        message={errors[`variants.${index}.name`]}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor={`variant-${index}-sku`}
                                        value="SKU Varian"
                                    />
                                    <TextInput
                                        id={`variant-${index}-sku`}
                                        value={variant.sku ?? ""}
                                        onChange={(event) =>
                                            updateVariant(index, "sku", event.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        autoComplete="off"
                                    />
                                    <InputError
                                        message={errors[`variants.${index}.sku`]}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor={`variant-${index}-barcode`}
                                        value="Barcode Varian"
                                    />
                                    <TextInput
                                        id={`variant-${index}-barcode`}
                                        value={variant.barcode ?? ""}
                                        onChange={(event) =>
                                            updateVariant(index, "barcode", event.target.value)
                                        }
                                        className="mt-1 block w-full"
                                        autoComplete="off"
                                    />
                                    <InputError
                                        message={errors[`variants.${index}.barcode`]}
                                        className="mt-2"
                                    />
                                </div>

                                {[
                                    ["buy_price", "Harga Beli"],
                                    ["sell_price", "Harga Jual"],
                                ].map(([field, label]) => (
                                    <div key={field}>
                                        <InputLabel
                                            htmlFor={`variant-${index}-${field}`}
                                            value={label}
                                        />
                                        <TextInput
                                            id={`variant-${index}-${field}`}
                                            type="text"
                                            inputMode="decimal"
                                            value={formatCurrencyValue(variant[field])}
                                            onChange={(event) =>
                                                updateVariant(
                                                    index,
                                                    field,
                                                    normalizeCurrencyValue(event.target.value),
                                                )
                                            }
                                            className="mt-1 block w-full"
                                            placeholder="Rp 0"
                                        />
                                        <InputError
                                            message={errors[`variants.${index}.${field}`]}
                                            className="mt-2"
                                        />
                                    </div>
                                ))}

                                <div>
                                    <InputLabel
                                        htmlFor={`variant-${index}-stock`}
                                        value="Stok Varian"
                                    />
                                    <TextInput
                                        id={`variant-${index}-stock`}
                                        type="number"
                                        min="0"
                                        value={variant.stock ?? ""}
                                        onChange={(event) =>
                                            updateVariant(index, "stock", event.target.value)
                                        }
                                        className="mt-1 block w-full"
                                    />
                                    <InputError
                                        message={errors[`variants.${index}.stock`]}
                                        className="mt-2"
                                    />
                                </div>

                                <label className="flex items-center gap-3 self-end pb-2">
                                    <input
                                        type="checkbox"
                                        checked={variant.is_active ?? true}
                                        onChange={(event) =>
                                            updateVariant(index, "is_active", event.target.checked)
                                        }
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Varian aktif
                                    </span>
                                </label>
                            </div>
                        </div>
                    ))}
                    <InputError message={errors.variants} className="mt-2" />
                </div>
                 */}

                <div className="flex items-center gap-2 border-t border-gray-200 pt-6">
                    <PrimaryButton
                        disabled={processing}
                        className="!bg-blue-600 !hover:bg-blue-700 !focus:ring-blue-500"
                    >
                        {processing ? "Menyimpan..." : submitLabel}
                    </PrimaryButton>
                    <Link
                        href={cancelHref}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Batal
                    </Link>
                </div>
            </form>
        </div>
    );
}
