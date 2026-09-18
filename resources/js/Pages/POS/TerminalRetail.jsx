import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Barcode,
    Banknote,
    CheckCircle2,
    ChevronDown,
    CreditCard,
    Minus,
    Plus,
    Printer,
    QrCode,
    Receipt,
    Search,
    ShoppingCart,
    Trash2,
    UserCheck,
    WalletCards,
    X,
    LogOut,
    Monitor,
    Wallet,
} from "lucide-react";
import { formatCurrency, formatShortDateTime } from "@/Helper/helper";
import OpenDrawerModal from "@/Components/POS/OpenDrawerModal";
import CashMovementModal from "@/Components/POS/CashMovementModal";
import ReconcileShiftModal from "@/Components/POS/ReconcileShiftModal";
import OpenShiftModal from "@/Components/POS/OpenShiftModal";
import CurrencyInput from "@/Components/CurrencyInput";


const paymentMethods = [
    { key: "cash", label: "Uang Tunai", icon: Banknote },
    { key: "qris", label: "QRIS", icon: QrCode },
    { key: "debit", label: "Kartu Debit/Kredit", icon: CreditCard },
    { key: "bank_transfer", label: "Transfer Bank", icon: WalletCards },
];
const cashPresets = [
    { label: "Uang Pas", value: "exact" },
    { label: "Rp 50.000", value: 50000 },
    { label: "Rp 100.000", value: 100000 },
    { label: "Rp 200.000", value: 200000 },
];

export default function POSTerminalRetail({
    products = [],
    customers = [],
    activeShift,
    storeSettings = null,
}) {
    const { props } = usePage();
    const user = props.auth?.user || {};
    const scannerRef = useRef(null);
    const [scanValue, setScanValue] = useState("");
    const [cart, setCart] = useState([]);
    const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
    const [voidOpen, setVoidOpen] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [cashModalOpen, setCashModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paidAmount, setPaidAmount] = useState(0);
    const [printReceipt, setPrintReceipt] = useState(true);
    const [sendReceipt, setSendReceipt] = useState(false);
    const [noteDiscount, setNoteDiscount] = useState(0);
    const [extraCharge, setExtraCharge] = useState(0);
    const [manualSearch, setManualSearch] = useState(false);
    const [openDrawerModal, setOpenDrawerModal] = useState(false);
    const [cashMovementModal, setCashMovementModal] = useState(false);
    const [reconcileShiftModal, setReconcileShiftModal] = useState(false);
    const { setData, post, processing } = useForm({
        customer_id: customerId || null,
        items: [],
        payment_method: "cash",
        paid_amount: 0,
        discount_amount: 0,
    });

    useEffect(() => {
        scannerRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "F2") {
                event.preventDefault();
                scannerRef.current?.focus();
                scannerRef.current?.select();
            }
            if (event.key === "F3") {
                event.preventDefault();
                setManualSearch(true);
                scannerRef.current?.focus();
            }
            if (event.key === "F4") {
                event.preventDefault();
                document.getElementById("receipt-discount")?.focus();
            }
            if (event.key === "F8") {
                event.preventDefault();
                openPayment();
            }
            if (event.key === "Escape") {
                event.preventDefault();
                if (cashModalOpen) setCashModalOpen(false);
                else if (cart.length) setVoidOpen(true);
            }
            if (event.key === "Enter" && successData) {
                event.preventDefault();
                resetTransaction();
            }
            if (event.key.toLowerCase() === "p" && successData) {
                event.preventDefault();
                document.body.classList.add("printing-receipt");
                window.addEventListener(
                    "afterprint",
                    () => document.body.classList.remove("printing-receipt"),
                    { once: true },
                );
                window.print();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cart.length, cashModalOpen, successData]);

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const itemDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
    const totalDiscount = Math.min(
        subtotal,
        itemDiscount + Number(noteDiscount || 0),
    );
    const total = Math.max(
        subtotal - totalDiscount + Number(extraCharge || 0),
        0,
    );
    const change = Math.max(Number(paidAmount || 0) - total, 0);
    const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0);
    const searchResults = useMemo(() => {
        const term = scanValue.trim().toLowerCase();
        if (!term || !manualSearch) return [];
        return products
            .filter((product) =>
                [product.name, product.sku, product.barcode].some((value) =>
                    String(value || "")
                        .toLowerCase()
                        .includes(term),
                ),
            )
            .slice(0, 8);
    }, [manualSearch, products, scanValue]);

    const focusScanner = () =>
        window.setTimeout(() => scannerRef.current?.focus(), 50);
    const productStock = (product, variantId = null) =>
        Number(
            product.variants?.find((item) => item.id === variantId)?.stock ??
                product.stock ??
                0,
        );

    const addProduct = (sourceProduct, sourceVariant = null) => {
        const variantId = sourceVariant?.id ?? null;
        const product = sourceVariant
            ? {
                  ...sourceProduct,
                  sell_price: sourceVariant.sell_price,
                  barcode: sourceVariant.barcode || sourceProduct.barcode,
                  sku: sourceVariant.sku || sourceProduct.sku,
              }
            : sourceProduct;
        const stock = productStock(sourceProduct, variantId);
        const key = `${product.id}-${variantId || "base"}`;
        const existing = cart.find((item) => item.key === key);
        if (existing?.qty >= stock) return;
        setCart((current) =>
            existing
                ? current.map((item) =>
                      item.key === key ? { ...item, qty: item.qty + 1 } : item,
                  )
                : [
                      ...current,
                      {
                          key,
                          id: product.id,
                          variant_id: variantId,
                          name: product.name,
                          variant_name: sourceVariant?.name || null,
                          barcode:
                              sourceVariant?.barcode || sourceProduct.barcode,
                          sku: sourceVariant?.sku || sourceProduct.sku,
                          price: Number(product.sell_price || 0),
                          stock,
                          qty: 1,
                          discount: 0,
                      },
                  ],
        );
        setScanValue("");
        setManualSearch(false);
        focusScanner();
    };

    const scanProduct = () => {
        const value = scanValue.trim().toLowerCase();
        if (!value) return;
        const product = products.find(
            (item) =>
                String(item.barcode || "").toLowerCase() === value ||
                String(item.sku || "").toLowerCase() === value,
        );
        const variantMatch = products
            .flatMap((item) =>
                (item.variants || []).map((variant) => ({
                    product: item,
                    variant,
                })),
            )
            .find(
                ({ variant }) =>
                    String(variant.barcode || "").toLowerCase() === value ||
                    String(variant.sku || "").toLowerCase() === value,
            );
        if (variantMatch)
            addProduct(variantMatch.product, variantMatch.variant);
        else if (product && product.variants?.length)
            addProduct(product, product.variants[0]);
        else if (product) addProduct(product);
        else setManualSearch(true);
    };

    const updateCart = (key, changes) =>
        setCart((current) =>
            current.map((item) =>
                item.key === key ? { ...item, ...changes } : item,
            ),
        );
    const adjustQuantity = (item, amount) =>
        updateCart(item.key, {
            qty: Math.max(1, Math.min(item.stock, item.qty + amount)),
        });
    const removeItem = (key) =>
        setCart((current) => current.filter((item) => item.key !== key));
    const openPayment = () => {
        if (!cart.length) return;
        setPaidAmount(paymentMethod === "cash" ? 0 : total);
        setCashModalOpen(true);
    };
    const selectPayment = (method) => {
        setPaymentMethod(method);
        setData("payment_method", method);
        setPaidAmount(method === "cash" ? 0 : total);
    };
    const submitCheckout = (event) => {
        event?.preventDefault();
        if (paidAmount < total) return;
        setData({
            customer_id: customerId || null,
            items: cart.map((item) => ({
                id: item.id,
                variant_id: item.variant_id,
                qty: item.qty,
                price: item.price,
            })),
            payment_method: paymentMethod,
            paid_amount: Number(paidAmount),
            discount_amount: Number(totalDiscount),
            extra_charge: Number(extraCharge),
        });
        post(route("pos.checkout"), {
            preserveScroll: true,
            onSuccess: (page) => {
                const result = page.props.flash?.success || {};
                setSuccessData({
                    invoice: result.invoice_number || "Transaksi berhasil",
                    total: result.total || total,
                    change: result.change || change,
                    paidAmount,
                    paymentMethod,
                    customerName:
                        customers.find((customer) => customer.id == customerId)
                            ?.name || "Pelanggan Umum",
                    cashierName: user.name || "Kasir",
                    items: cart,
                    subtotal,
                    discount: totalDiscount,
                    extraCharge,
                });
                setCashModalOpen(false);
            },
        });
    };
    const resetTransaction = () => {
        setCart([]);
        setNoteDiscount(0);
        setExtraCharge(0);
        setPaidAmount(0);
        setSuccessData(null);
        focusScanner();
    };

    const openFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error("Fullscreen error:", error);
        }
    };

    const handleLogout = () => {
        router.post(route("logout"));
    };

    return (
        <>
            <Head title="POS Retail" />
            <div className="min-h-screen bg-slate-100 text-slate-900 lg:h-screen lg:overflow-hidden">
                <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-950">
                                Retail POS
                            </p>
                            <p className="text-xs text-slate-500">
                                {activeShift?.outlet?.name || "Outlet Aktif"}
                            </p>
                        </div>
                    </div>
                    <div className="hidden items-center gap-2 md:flex">
                        <div className="flex flex-row items-start gap-x-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                            <span>Kasir:</span>
                            {user.name || "Kasir"}
                        </div>

                        <div className="flex flex-row items-start gap-x-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                            <span>Shift:</span>
                            {formatShortDateTime(activeShift?.opened_at) ||
                                "Open"}
                        </div>

                        <div className="flex flex-row items-start gap-x-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
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
                </header>
                <main className="grid min-h-0 lg:h-[calc(100vh-64px)] lg:grid-cols-[minmax(0,2.4fr)_minmax(360px,1fr)]">
                    <section className="flex min-h-0 flex-col border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
                        <div className="border-b border-slate-200 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative min-w-0 flex-1">
                                    <Barcode className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-indigo-700" />
                                    <input
                                        ref={scannerRef}
                                        autoFocus
                                        value={scanValue}
                                        onChange={(event) => {
                                            setScanValue(event.target.value);
                                            setManualSearch(true);
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                scanProduct();
                                            }
                                        }}
                                        placeholder="Scan Barcode atau ketik Nama/SKU [F2]"
                                        className="h-14 w-full rounded-xl border-2 border-indigo-500 bg-indigo-50/40 pl-14 pr-32 text-base font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-indigo-100 px-2 py-1 text-[11px] font-bold text-indigo-700">
                                        Scanner Ready
                                    </span>
                                    {manualSearch &&
                                        searchResults.length > 0 && (
                                            <div className="absolute inset-x-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                                {searchResults.map(
                                                    (product) => (
                                                        <button
                                                            type="button"
                                                            key={product.id}
                                                            onClick={() =>
                                                                product.variants
                                                                    ?.length
                                                                    ? addProduct(
                                                                          product,
                                                                          product
                                                                              .variants[0],
                                                                      )
                                                                    : addProduct(
                                                                          product,
                                                                      )
                                                            }
                                                            className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-indigo-50"
                                                        >
                                                            <span>
                                                                <span className="block text-sm font-bold text-slate-800">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-slate-500">
                                                                    {product.barcode ||
                                                                        product.sku ||
                                                                        "Tanpa kode"}{" "}
                                                                    · Stok{" "}
                                                                    {product.stock ??
                                                                        0}
                                                                </span>
                                                            </span>
                                                            <span className="text-sm font-bold text-indigo-700">
                                                                {formatCurrency(
                                                                    product.sell_price,
                                                                )}
                                                            </span>
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setManualSearch(true);
                                        scannerRef.current?.focus();
                                    }}
                                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
                                >
                                    <Search className="h-5 w-5" /> Cari Manual{" "}
                                    <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
                                        F3
                                    </kbd>
                                </button>
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 overflow-auto">
                            <table className="min-w-[860px] w-full text-left text-sm">
                                <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-3 py-3">
                                            Barcode / SKU
                                        </th>
                                        <th className="px-3 py-3">
                                            Produk & Variasi
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                            Harga
                                        </th>
                                        <th className="px-3 py-3">Qty</th>
                                        <th className="px-3 py-3 text-right">
                                            Diskon
                                        </th>
                                        <th className="px-3 py-3 text-right">
                                            Subtotal
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {cart.length ? (
                                        cart.map((item, index) => (
                                            <tr
                                                key={item.key}
                                                className="hover:bg-slate-50"
                                            >
                                                <td className="px-4 py-4 font-semibold text-slate-400">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-4 text-xs text-slate-500">
                                                    {item.barcode ||
                                                        item.sku ||
                                                        "-"}
                                                </td>
                                                <td className="max-w-[220px] px-3 py-4">
                                                    <p className="truncate font-bold text-slate-800">
                                                        {item.name}
                                                    </p>
                                                    {item.variant_name && (
                                                        <p className="mt-1 text-xs text-indigo-700">
                                                            {item.variant_name}
                                                        </p>
                                                    )}
                                                    {item.qty >= item.stock && (
                                                        <p className="mt-1 text-xs font-bold text-rose-600">
                                                            Stok maksimum
                                                            tercapai (
                                                            {item.stock})
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right font-semibold text-slate-700">
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="px-3 py-4">
                                                    <div className="flex w-fit items-center rounded-lg border border-slate-200 bg-white">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                adjustQuantity(
                                                                    item,
                                                                    -1,
                                                                )
                                                            }
                                                            className="p-2 text-slate-500 hover:bg-slate-100"
                                                        >
                                                            <Minus className="h-3.5 w-3.5" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.stock}
                                                            value={item.qty}
                                                            onChange={(event) =>
                                                                updateCart(
                                                                    item.key,
                                                                    {
                                                                        qty: Math.max(
                                                                            1,
                                                                            Math.min(
                                                                                item.stock,
                                                                                Number(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                ) ||
                                                                                    1,
                                                                            ),
                                                                        ),
                                                                    },
                                                                )
                                                            }
                                                            className="w-10 border-0 bg-transparent p-0 text-center text-sm font-bold focus:ring-0"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                adjustQuantity(
                                                                    item,
                                                                    1,
                                                                )
                                                            }
                                                            className="p-2 text-slate-500 hover:bg-slate-100"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-right">
                                                    <CurrencyInput
                                                        value={item.discount}
                                                        onChange={(value) =>
                                                            updateCart(
                                                                item.key,
                                                                {
                                                                    discount:
                                                                        value,
                                                                },
                                                            )
                                                        }
                                                        className="w-24 rounded-lg border-slate-200 px-2 py-1.5 text-right text-xs focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-right font-bold text-slate-900">
                                                    {formatCurrency(
                                                        Math.max(
                                                            item.price *
                                                                item.qty -
                                                                item.discount,
                                                            0,
                                                        ),
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(item.key)
                                                        }
                                                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                                                        title="Hapus item"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="px-6 py-24 text-center"
                                            >
                                                <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
                                                <p className="mt-3 font-semibold text-slate-500">
                                                    Keranjang transaksi kosong
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    Arahkan scanner ke barcode
                                                    untuk memulai.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 sm:px-5">
                            <span>
                                <kbd className="mr-1 rounded bg-white px-1.5 py-1 text-slate-700 shadow-sm">
                                    F2
                                </kbd>{" "}
                                Focus Scan
                            </span>
                            <span>
                                <kbd className="mr-1 rounded bg-white px-1.5 py-1 text-slate-700 shadow-sm">
                                    F4
                                </kbd>{" "}
                                Diskon Nota
                            </span>
                            <span>
                                <kbd className="mr-1 rounded bg-white px-1.5 py-1 text-slate-700 shadow-sm">
                                    F8
                                </kbd>{" "}
                                Bayar
                            </span>
                            <span>
                                <kbd className="mr-1 rounded bg-white px-1.5 py-1 text-slate-700 shadow-sm">
                                    ESC
                                </kbd>{" "}
                                Void Keranjang
                            </span>
                        </div>
                    </section>
                    <aside className="flex min-h-0 flex-col bg-slate-50">
                        <div className="bg-slate-950 p-5 text-white sm:p-6">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                Total harga
                            </p>
                            <p className="mt-2 break-words text-4xl font-black tracking-tight sm:text-5xl">
                                {formatCurrency(total)}
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                <Receipt className="h-4 w-4" /> {totalQuantity}{" "}
                                item · {cart.length} produk
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4 sm:p-5">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                    <UserCheck className="h-4 w-4" /> Pelanggan
                                    / Member
                                </label>
                                <div className="relative">
                                    <select
                                        value={customerId}
                                        onChange={(event) =>
                                            setCustomerId(event.target.value)
                                        }
                                        className="w-full appearance-none rounded-xl border-slate-200 bg-white py-3 pl-3 pr-9 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="">Pelanggan Umum</option>
                                        {customers.map((customer) => (
                                            <option
                                                key={customer.id}
                                                value={customer.id}
                                            >
                                                {customer.name}
                                                {customer.phone
                                                    ? ` · ${customer.phone}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="text-xs font-bold text-slate-500">
                                    DISKON NOTA (Rp)
                                    <CurrencyInput
                                        id="receipt-discount"
                                        value={noteDiscount}
                                        onChange={setNoteDiscount}
                                        className="mt-2 w-full rounded-xl border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </label>
                                <label className="text-xs font-bold text-slate-500">
                                    BIAYA TAMBAHAN
                                    <CurrencyInput
                                        value={extraCharge}
                                        onChange={setExtraCharge}
                                        className="mt-2 w-full rounded-xl border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </label>
                            </div>
                            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Total diskon</span>
                                    <span className="text-rose-600">
                                        -{formatCurrency(totalDiscount)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t border-slate-100 pt-2 font-black text-slate-950">
                                    <span>Grand Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
                            <button
                                type="button"
                                onClick={openPayment}
                                disabled={!cart.length}
                                className="flex w-full items-center justify-center gap-3 rounded-xl bg-indigo-600 px-4 py-4 text-base font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                PROSES PEMBAYARAN{" "}
                                <kbd className="rounded bg-white/20 px-2 py-1 text-xs">
                                    F8
                                </kbd>
                            </button>
                        </div>
                    </aside>
                </main>
            </div>
            {cashModalOpen && (
                <PaymentModal
                    total={total}
                    paymentMethod={paymentMethod}
                    paidAmount={paidAmount}
                    change={change}
                    processing={processing}
                    setPaymentMethod={selectPayment}
                    printReceipt={printReceipt}
                    sendReceipt={sendReceipt}
                    setPaidAmount={setPaidAmount}
                    setPrintReceipt={setPrintReceipt}
                    setSendReceipt={setSendReceipt}
                    onClose={() => setCashModalOpen(false)}
                    onSubmit={submitCheckout}
                />
            )}
            {voidOpen && (
                <ConfirmModal
                    title="Bersihkan keranjang?"
                    description="Semua item dan diskon transaksi akan dihapus."
                    confirmLabel="Ya, Bersihkan"
                    onClose={() => setVoidOpen(false)}
                    onConfirm={() => {
                        resetTransaction();
                        setVoidOpen(false);
                    }}
                />
            )}
            {successData && (
                <SuccessModal
                    data={successData}
                    settings={storeSettings}
                    onNew={resetTransaction}
                />
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
        </>
    );
}

function PaymentModal({
    total,
    paymentMethod,
    paidAmount,
    change,
    processing,
    setPaymentMethod,
    printReceipt,
    sendReceipt,
    setPaidAmount,
    setPrintReceipt,
    setSendReceipt,
    onClose,
    onSubmit,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                            Konfirmasi pembayaran
                        </p>
                        <h2 className="mt-1 text-2xl font-black text-slate-950">
                            {formatCurrency(total)}
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
                <div className="mt-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Pilih metode pembayaran
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {paymentMethods.map(({ key, label, icon: Icon }) => (
                            <button
                                type="button"
                                key={key}
                                onClick={() => setPaymentMethod(key)}
                                className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center text-xs font-bold transition ${paymentMethod === key ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"}`}
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-5 rounded-xl bg-slate-950 p-4 text-white">
                    <p className="text-xs text-slate-400">
                        {paymentMethod === "cash"
                            ? "Uang fisik diterima"
                            : "Nominal pembayaran"}
                    </p>
                    <CurrencyInput
                        autoFocus
                        value={paidAmount}
                        onChange={setPaidAmount}
                        disabled={paymentMethod !== "cash"}
                        className="mt-2 w-full border-0 bg-transparent p-0 text-4xl font-black text-white outline-none focus:ring-0 disabled:opacity-60"
                        placeholder="Rp 0"
                    />
                    {paymentMethod === "cash" && (
                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {cashPresets.map((preset) => (
                                <button
                                    type="button"
                                    key={preset.label}
                                    onClick={() =>
                                        setPaidAmount(
                                            preset.value === "exact"
                                                ? total
                                                : preset.value,
                                        )
                                    }
                                    className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                        <span className="text-sm text-slate-400">
                            Kembalian
                        </span>
                        <span className="text-2xl font-black text-indigo-400">
                            {formatCurrency(change)}
                        </span>
                    </div>
                </div>
                <div className="mt-5 space-y-3">
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700">
                        <input
                            type="checkbox"
                            checked={printReceipt}
                            onChange={(event) =>
                                setPrintReceipt(event.target.checked)
                            }
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Printer className="h-4 w-4 text-slate-500" /> Cetak
                        struk thermal
                    </label>
                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700">
                        <input
                            type="checkbox"
                            checked={sendReceipt}
                            onChange={(event) =>
                                setSendReceipt(event.target.checked)
                            }
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-indigo-600">WhatsApp</span> Kirim
                        struk digital
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={processing || paidAmount < total}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 text-base font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {processing
                        ? "Memproses..."
                        : "Konfirmasi & Simpan Transaksi"}
                </button>
            </form>
        </div>
    );
}

function ConfirmModal({
    title,
    description,
    confirmLabel,
    onClose,
    onConfirm,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SuccessModal({ data, settings, onNew }) {
    const paperWidth = settings?.paper_size === "80mm" ? "max-w-[360px]" : "max-w-[300px]";
    const receiptRef = useRef(null);

    const printReceipt = () => {
        const restorePrintMode = () => {
            document.body.classList.remove("printing-receipt");
            window.removeEventListener("afterprint", restorePrintMode);
        };

        document.body.classList.add("printing-receipt");
        window.addEventListener("afterprint", restorePrintMode);
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body.printing-receipt * { visibility: hidden !important; }
                    body.printing-receipt #receipt-print-area,
                    body.printing-receipt #receipt-print-area * { visibility: visible !important; }
                    body.printing-receipt #receipt-print-area {
                        position: absolute;
                        top: 0;
                        left: 0;
                        margin: 0;
                        box-shadow: none !important;
                    }
                }
            `}</style>
            <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                                Transaksi berhasil
                            </p>
                            <h2 className="text-xl font-black text-slate-950">
                                Preview struk
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onNew}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                        aria-label="Tutup preview"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-5 rounded-xl bg-slate-100 p-4 sm:p-6">
                    <div
                        ref={receiptRef}
                        id="receipt-print-area"
                        className={`mx-auto overflow-hidden bg-white px-5 py-6 font-mono text-[11px] text-slate-800 shadow-md ${paperWidth}`}
                    >
                        <div className="space-y-1 text-center">
                            {settings?.logo_url && (
                                <img
                                    src={settings.logo_url}
                                    alt="Logo toko"
                                    className="mx-auto mb-2 h-10 w-10 object-contain"
                                />
                            )}
                            <p className="font-bold uppercase">
                                {settings?.store_name || "Nama Toko"}
                            </p>
                            <p className="whitespace-pre-line text-[10px]">
                                {settings?.address_header ||
                                    "Alamat header struk"}
                            </p>
                        </div>
                        <div className="my-4 border-t border-dashed border-slate-400" />
                        <div className="mb-2 flex justify-between text-[10px]">
                            <span className="font-bold">{data.invoice}</span>
                            <span>{new Date().toLocaleString("id-ID")}</span>
                        </div>
                        <div className="mb-2 text-[10px] text-slate-500">
                            Kasir: {data.cashierName}
                        </div>
                        <div className="mb-3 text-[10px] text-slate-500">
                            Pelanggan: {data.customerName}
                        </div>
                        <div className="my-4 border-t border-dashed border-slate-400" />
                        <div className="space-y-2">
                            {data.items.map((item) => (
                                <div key={item.key}>
                                    <div className="flex justify-between gap-3">
                                        <span className="min-w-0 truncate">
                                            {item.name}
                                            {item.variant_name
                                                ? ` - ${item.variant_name}`
                                                : ""}{" "}
                                            x{item.qty}
                                        </span>
                                        <span className="shrink-0">
                                            {formatCurrency(
                                                item.price * item.qty -
                                                    item.discount,
                                            )
                                                .replace("Rp", "")
                                                .trim()}
                                        </span>
                                    </div>
                                    {item.discount > 0 && (
                                        <div className="flex justify-between text-[10px] text-slate-500">
                                            <span>Diskon item</span>
                                            <span>
                                                -
                                                {formatCurrency(item.discount)
                                                    .replace("Rp", "")
                                                    .trim()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="my-4 border-t border-dashed border-slate-400" />
                        <div className="space-y-1 text-right">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                    {formatCurrency(data.subtotal)
                                        .replace("Rp", "")
                                        .trim()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Diskon</span>
                                <span>
                                    -
                                    {formatCurrency(data.discount)
                                        .replace("Rp", "")
                                        .trim()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Biaya tambahan</span>
                                <span>
                                    {formatCurrency(data.extraCharge)
                                        .replace("Rp", "")
                                        .trim()}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>
                                    {formatCurrency(data.total)
                                        .replace("Rp", "")
                                        .trim()}
                                </span>
                            </div>
                            <div className="mt-2 flex justify-between">
                                <span>Bayar ({data.paymentMethod})</span>
                                <span>
                                    {formatCurrency(data.paidAmount)
                                        .replace("Rp", "")
                                        .trim()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kembalian</span>
                                <span>
                                    {formatCurrency(data.change)
                                        .replace("Rp", "")
                                        .trim()}
                                </span>
                            </div>
                        </div>
                        <div className="my-4 border-t border-dashed border-slate-400" />
                        <p className="whitespace-pre-line text-center text-[10px]">
                            {settings?.footer_receipt_notes ||
                                "Terima kasih atas kunjungan Anda."}
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onNew}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
                    >
                        Transaksi Baru{" "}
                        <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
                            Enter
                        </kbd>
                    </button>
                    <button
                        type="button"
                        onClick={printReceipt}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-700"
                    >
                        <Printer className="h-4 w-4" /> Cetak Struk{" "}
                        <kbd className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">
                            P
                        </kbd>
                    </button>
                </div>
            </div>
        </div>
    );
}

// function CurrencyInput({ value, onChange, className = "", ...props }) {
//     const formattedValue = value ? formatCurrency(value) : "";

//     return (
//         <input
//             {...props}
//             type="text"
//             inputMode="numeric"
//             value={formattedValue}
//             onChange={(event) => {
//                 const digits = event.target.value.replace(/[^0-9]/g, "");
//                 onChange(Number(digits) || 0);
//             }}
//             className={className}
//         />
//     );
// }
