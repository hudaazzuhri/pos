import React, { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import CashMovementModal from '@/Components/POS/CashMovementModal';
import OpenDrawerModal from '@/Components/POS/OpenDrawerModal';
import OpenShiftModal from '@/Components/POS/OpenShiftModal';
import ReconcileShiftModal from '@/Components/POS/ReconcileShiftModal';
import {
    Banknote,
    CheckCircle2,
    ChevronDown,
    CreditCard,
    DollarSign,
    LogOut,
    MessageSquare,
    Minus,
    Monitor,
    Package,
    Percent,
    Plus,
    Printer,
    QrCode,
    Search,
    ShoppingCart,
    Trash2,
    Wallet,
    X,
} from 'lucide-react';
import {
    formatShortDateTime,
    formatCurrency,
} from "@/Helper/helper";

const quickAmounts = [20000, 50000, 100000, 200000];

export default function POSTerminal({
    products = [],
    categories = [],
    activeShift,
    customers = [],
}) {
    const { props } = usePage();
    const user = props.auth?.user || {};

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(
        customers.find((customer) => customer.name === 'Pelanggan Umum')?.id ||
            customers[0]?.id ||
            null,
    );
    const [variantProduct, setVariantProduct] = useState(null);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [notesOpenItemId, setNotesOpenItemId] = useState(null);
    const [openDrawerModal, setOpenDrawerModal] = useState(false);
    const [cashMovementModal, setCashMovementModal] = useState(false);
    const [reconcileShiftModal, setReconcileShiftModal] = useState(false);

    const { data, setData, transform, post, processing } = useForm({
        outlet_id: activeShift?.outlet_id ?? null,
        customer_id: selectedCustomerId,
        items: [],
        payment_method: 'cash',
        paid_amount: 0,
        discount_amount: 0,
    });

    useEffect(() => {
        setData('customer_id', selectedCustomerId);
    }, [selectedCustomerId]);

    const filteredProducts = useMemo(() => {
        const normalizedSearch = search.toLowerCase();

        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === 'all' ||
                product.category_id === Number(selectedCategory);

            const haystack = [
                product.name,
                product.sku,
                product.barcode,
                product.category?.name,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchesSearch = haystack.includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [products, search, selectedCategory]);

    const subtotal = cart.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
        0,
    );
    const discountAmount = Number(data.discount_amount || 0);
    const total = Math.max(subtotal - discountAmount, 0);
    const changeAmount = Math.max(Number(data.paid_amount || 0) - total, 0);

    const syncCheckoutData = () => {
        setData(
            'items',
            cart.map((item) => ({
                id: item.id,
                variant_id: item.variant_id || null,
                qty: Number(item.qty || 1),
                price: Number(item.price || 0),
                notes: item.notes || '',
            })),
        );
    };

    const addToCart = (product, variant = null) => {
        const normalizedVariantId = variant?.id ?? null;
        const existingIndex = cart.findIndex(
            (item) =>
                item.id === product.id &&
                (item.variant_id || null) === normalizedVariantId,
        );

        if (existingIndex >= 0) {
            const updatedCart = [...cart];
            updatedCart[existingIndex] = {
                ...updatedCart[existingIndex],
                qty: updatedCart[existingIndex].qty + 1,
            };
            setCart(updatedCart);
            return;
        }

        setCart((current) => [
            ...current,
            {
                id: product.id,
                name: product.name,
                price:
                    Number((variant?.sell_price ?? variant?.price ?? product.sell_price) || 0),
                qty: 1,
                variant_id: normalizedVariantId,
                variant_name: variant?.name || null,
                notes: '',
            },
        ]);
    };

    const handleProductClick = (product) => {
        if (product.variants && product.variants.length > 0) {
            setVariantProduct(product);
            return;
        }

        addToCart(product);
    };

    const updateQty = (itemKey, delta) => {
        setCart((current) =>
            current
                .map((item) => {
                    if (
                        item.id === itemKey.id &&
                        (item.variant_id || null) === (itemKey.variant_id || null)
                    ) {
                        const nextQty = Math.max(0, Number(item.qty || 0) + delta);
                        return nextQty === 0
                            ? null
                            : { ...item, qty: nextQty };
                    }

                    return item;
                })
                .filter(Boolean),
        );
    };

    const updateManualQty = (itemKey, value) => {
        setCart((current) =>
            current.map((item) => {
                if (
                    item.id === itemKey.id &&
                    (item.variant_id || null) === (itemKey.variant_id || null)
                ) {
                    return {
                        ...item,
                        qty: Math.max(1, Number(value || 1)),
                    };
                }

                return item;
            }),
        );
    };

    const removeItem = (itemKey) => {
        setCart((current) =>
            current.filter(
                (item) =>
                    !(item.id === itemKey.id && (item.variant_id || null) === (itemKey.variant_id || null)),
            ),
        );
    };

    const toggleNotes = (itemKey) => {
        setNotesOpenItemId((current) =>
            current === `${itemKey.id}-${itemKey.variant_id || 'none'}`
                ? null
                : `${itemKey.id}-${itemKey.variant_id || 'none'}`,
        );
    };

    const updateItemNotes = (itemKey, value) => {
        setCart((current) =>
            current.map((item) => {
                if (
                    item.id === itemKey.id &&
                    (item.variant_id || null) === (itemKey.variant_id || null)
                ) {
                    return { ...item, notes: value };
                }

                return item;
            }),
        );
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;

        syncCheckoutData();
        setCheckoutOpen(true);
    };

    const submitCheckout = (e) => {
        e.preventDefault();

        const payloadItems = cart.map((item) => ({
            id: item.id,
            variant_id: item.variant_id || null,
            qty: Number(item.qty || 1),
            price: Number(item.price || 0),
            notes: item.notes || '',
        }));

        transform((currentData) => ({
            ...currentData,
            items: payloadItems,
            customer_id: selectedCustomerId,
            paid_amount: Number(data.paid_amount || 0),
            discount_amount: Number(data.discount_amount || 0),
        }));

        post(route('pos.checkout'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const successPayload = page?.props?.flash?.success || {};

                setReceiptData({
                    invoice_number:
                        successPayload.invoice_number ||
                        `INV-${new Date()
                            .toISOString()
                            .slice(0, 10)
                            .replace(/-/g, '')}-${String(Date.now()).slice(-4)}`,
                    total: successPayload.total || total,
                    paid_amount: Number(data.paid_amount || 0),
                    change_amount:
                        successPayload.change ||
                        Math.max(Number(data.paid_amount || 0) - total, 0),
                });

                setCheckoutOpen(false);
                setReceiptOpen(true);
                setCart([]);
                setData('items', []);
                setData('paid_amount', 0);
                setData('discount_amount', 0);
                setData('payment_method', 'cash');
            },
        });
    };

    const openFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <>
            <Head title="Terminal" />
            <div className="h-screen overflow-hidden bg-slate-100 text-slate-900">
                <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Package className="h-5 w-5" />
                        </div>

                        <div>
                            <div className="text-sm font-semibold text-slate-800">
                                {activeShift?.outlet?.name || "Outlet Aktif"}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                Online PWA
                            </div>
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 md:flex">
                        <div className="flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                            <span>Kasir:</span>
                            {user.name || "Kasir"}
                        </div>

                        <div className="flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                            <span>Shift:</span>
                            {formatShortDateTime(activeShift?.opened_at) ||
                                "Open"}
                        </div>

                        <div className="flex flex-col items-start rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                            <span>Modal Awal:</span>
                            {formatCurrency(activeShift?.starting_cash || 0)}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={openFullscreen}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                            <Monitor className="h-4 w-4" />
                            Fullscreen
                        </button>

                        <button
                            type="button"
                            onClick={() => setOpenDrawerModal(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                            <Wallet className="h-4 w-4" />
                            Buka Laci
                        </button>

                        <button
                            type="button"
                            onClick={() => setCashMovementModal(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                            <Banknote className="h-4 w-4" />
                            Pergerakan Kas
                        </button>

                        <button
                            type="button"
                            onClick={() => setReconcileShiftModal(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Shift Close
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(100vh-64px)]">
                    <div className="flex w-full flex-col lg:w-[62%]">
                        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                                    <div className="relative flex-1">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            placeholder="Cari produk, SKU, barcode..."
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedCategory("all")
                                        }
                                        className={[
                                            "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                                            selectedCategory === "all"
                                                ? "border-indigo-600 bg-indigo-600 text-white"
                                                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                                        ].join(" ")}
                                    >
                                        Semua
                                    </button>

                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategory(
                                                    String(category.id),
                                                )
                                            }
                                            className={[
                                                "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                                                String(selectedCategory) ===
                                                String(category.id)
                                                    ? "border-indigo-600 bg-indigo-600 text-white"
                                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                                            ].join(" ")}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6">
                            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() =>
                                            handleProductClick(product)
                                        }
                                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                                    >
                                        <div className="relative h-32 bg-gradient-to-br from-slate-200 to-slate-100">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-slate-500">
                                                    <Package className="h-10 w-10" />
                                                </div>
                                            )}

                                            {product.variants &&
                                                product.variants.length > 0 && (
                                                    <span className="absolute right-2 top-2 rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white">
                                                        {
                                                            product.variants
                                                                .length
                                                        }{" "}
                                                        Varian
                                                    </span>
                                                )}
                                        </div>

                                        <div className="space-y-2 p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">
                                                    {product.name}
                                                </h3>
                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                                    {product.stock ?? 0} Stock
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-slate-500">
                                                    {product.category?.name ||
                                                        "Tanpa Kategori"}
                                                </div>
                                                <div className="text-lg font-bold text-indigo-700">
                                                    {formatCurrency(
                                                        product.sell_price || 0,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full flex-col border-l border-slate-200 bg-white lg:w-[38%]">
                        <div className="border-b border-slate-200 p-4">
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Pelanggan
                            </label>

                            <div className="relative">
                                <select
                                    value={selectedCustomerId || ""}
                                    onChange={(e) =>
                                        setSelectedCustomerId(
                                            e.target.value || null,
                                        )
                                    }
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white"
                                >
                                    {customers.map((customer) => (
                                        <option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-3">
                                {cart.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                        <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                                        <p className="text-sm font-medium text-slate-600">
                                            Keranjang masih kosong
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Klik produk untuk menambahkan ke
                                            transaksi
                                        </p>
                                    </div>
                                ) : (
                                    cart.map((item) => {
                                        const itemKey = {
                                            id: item.id,
                                            variant_id: item.variant_id || null,
                                        };
                                        const itemNotesKey = `${item.id}-${item.variant_id || "none"}`;

                                        return (
                                            <div
                                                key={itemNotesKey}
                                                className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                                {item.name}
                                                            </p>
                                                            {item.variant_name && (
                                                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                                                    {
                                                                        item.variant_name
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {formatCurrency(
                                                                item.price,
                                                            )}{" "}
                                                            / unit
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(itemKey)
                                                        }
                                                        className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between gap-2">
                                                    <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQty(
                                                                    itemKey,
                                                                    -1,
                                                                )
                                                            }
                                                            className="px-2 py-1.5 text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>

                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={item.qty}
                                                            onChange={(e) =>
                                                                updateManualQty(
                                                                    itemKey,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-12 border-0 bg-transparent text-center text-sm font-medium text-slate-800 outline-none"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQty(
                                                                    itemKey,
                                                                    1,
                                                                )
                                                            }
                                                            className="px-2 py-1.5 text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="text-sm font-bold text-slate-900">
                                                        {formatCurrency(
                                                            Number(
                                                                item.price || 0,
                                                            ) *
                                                                Number(
                                                                    item.qty ||
                                                                        0,
                                                                ),
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleNotes(itemKey)
                                                        }
                                                        className="text-xs font-medium text-indigo-600"
                                                    >
                                                        {notesOpenItemId ===
                                                        itemNotesKey
                                                            ? "Tutup catatan"
                                                            : "Tambah catatan"}
                                                    </button>

                                                    {notesOpenItemId ===
                                                        itemNotesKey && (
                                                        <textarea
                                                            value={
                                                                item.notes || ""
                                                            }
                                                            onChange={(e) =>
                                                                updateItemNotes(
                                                                    itemKey,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            rows={2}
                                                            placeholder="Catatan khusus item..."
                                                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="border-t border-slate-200 bg-slate-50 p-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Percent className="h-4 w-4 text-slate-500" />
                                    <input
                                        type="number"
                                        min={0}
                                        value={data.discount_amount || 0}
                                        onChange={(e) =>
                                            setData(
                                                "discount_amount",
                                                Number(e.target.value || 0),
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500"
                                        placeholder="Diskon transaksi"
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span>Pajak</span>
                                    <span>{formatCurrency(0)}</span>
                                </div>

                                <div className="flex items-center justify-between rounded-xl bg-indigo-50 p-3">
                                    <span className="text-sm font-medium text-indigo-700">
                                        Total Bayar
                                    </span>
                                    <span className="text-2xl font-bold text-indigo-800">
                                        {formatCurrency(total)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                                    disabled={cart.length === 0}
                                >
                                    <CreditCard className="h-5 w-5" />
                                    BAYAR / CHECKOUT (F9)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {variantProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Pilih Varian
                                    </p>
                                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                                        {variantProduct.name}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setVariantProduct(null)}
                                    className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-5 space-y-3">
                                {(variantProduct.variants || []).map(
                                    (variant) => (
                                        <button
                                            key={variant.id}
                                            type="button"
                                            onClick={() => {
                                                addToCart(
                                                    variantProduct,
                                                    variant,
                                                );
                                                setVariantProduct(null);
                                            }}
                                            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                                        >
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800">
                                                    {variant.name}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-500">
                                                    Stock: {variant.stock ?? 0}
                                                </div>
                                            </div>

                                            <div className="text-sm font-bold text-indigo-700">
                                                {formatCurrency(
                                                    variant.sell_price || 0,
                                                )}
                                            </div>
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {checkoutOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Pembayaran
                                    </p>
                                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                                        Checkout
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCheckoutOpen(false)}
                                    className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form
                                onSubmit={submitCheckout}
                                className="mt-5 space-y-5"
                            >
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    {[
                                        {
                                            key: "cash",
                                            label: "Tunai",
                                            icon: Banknote,
                                        },
                                        {
                                            key: "qris",
                                            label: "QRIS",
                                            icon: QrCode,
                                        },
                                        {
                                            key: "bank_transfer",
                                            label: "Transfer",
                                            icon: DollarSign,
                                        },
                                        {
                                            key: "debit",
                                            label: "Debit",
                                            icon: CreditCard,
                                        },
                                    ].map((method) => {
                                        const Icon = method.icon;

                                        return (
                                            <button
                                                key={method.key}
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        "payment_method",
                                                        method.key,
                                                    )
                                                }
                                                className={[
                                                    "flex flex-col items-center rounded-2xl border p-3 text-sm font-medium transition",
                                                    data.payment_method ===
                                                    method.key
                                                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                                                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                                                ].join(" ")}
                                            >
                                                <Icon className="mb-2 h-5 w-5" />
                                                {method.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between text-sm text-slate-600">
                                        <span>Total</span>
                                        <span className="font-semibold text-slate-800">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Jumlah Uang Diterima
                                        </label>

                                        <input
                                            type="number"
                                            min={0}
                                            value={data.paid_amount || ""}
                                            onChange={(e) =>
                                                setData(
                                                    "paid_amount",
                                                    Number(e.target.value || 0),
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-lg font-bold text-slate-900 outline-none transition focus:border-indigo-500"
                                            placeholder="Masukkan nominal"
                                        />
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        {[
                                            1000, 5000, 10000, 20000, 50000,
                                            100000,
                                        ].map((amount) => (
                                            <button
                                                key={amount}
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        "paid_amount",
                                                        Number(
                                                            data.paid_amount ||
                                                                0,
                                                        ) + amount,
                                                    )
                                                }
                                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                                            >
                                                + {formatCurrency(amount)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-slate-900 p-4 text-white">
                                    <div className="flex items-center justify-between text-sm text-slate-300">
                                        <span>Uang diterima</span>
                                        <span>
                                            {formatCurrency(
                                                data.paid_amount || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm text-slate-300">
                                        <span>Kembalian</span>
                                        <span className="text-lg font-bold text-emerald-400">
                                            {formatCurrency(changeAmount)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || cart.length === 0}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                                >
                                    {processing
                                        ? "Memproses..."
                                        : "Konfirmasi Pembayaran"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {receiptOpen && receiptData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Transaksi Berhasil
                                    </p>
                                    <h3 className="mt-1 text-2xl font-bold text-slate-900">
                                        {receiptData.invoice_number}
                                    </h3>
                                </div>

                                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                                <div className="flex items-center justify-between">
                                    <span>Total</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(receiptData.total)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Diterima</span>
                                    <span className="font-semibold text-slate-900">
                                        {formatCurrency(
                                            receiptData.paid_amount,
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Kembalian</span>
                                    <span className="font-semibold text-emerald-700">
                                        {formatCurrency(
                                            receiptData.change_amount,
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    <Printer className="h-4 w-4" />
                                    Struk
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    WhatsApp
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReceiptOpen(false);
                                        setReceiptData(null);
                                    }}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    Transaksi Baru
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <OpenDrawerModal
                    open={openDrawerModal}
                    onClose={() => setOpenDrawerModal(false)}
                    onSuccess={() => setOpenDrawerModal(false)}
                />

                <CashMovementModal
                    open={cashMovementModal}
                    onClose={() => setCashMovementModal(false)}
                    onSuccess={() => setCashMovementModal(false)}
                />

                <ReconcileShiftModal
                    open={reconcileShiftModal}
                    onClose={() => setReconcileShiftModal(false)}
                />

                <OpenShiftModal open={!activeShift} />
            </div>
        </>
    );
}

function Clock3Icon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 text-slate-500"
        >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l2.5 2.5" />
        </svg>
    );
}
