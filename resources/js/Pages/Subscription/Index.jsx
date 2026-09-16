import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Modal from "@/Components/Modal";
import { Head } from "@inertiajs/react";
import {
    ArrowRight,
    Building2,
    CalendarDays,
    Check,
    CreditCard,
    Crown,
    QrCode,
    ShieldCheck,
    Store,
    Users,
    X,
} from "lucide-react";
import { useState } from "react";

const plans = [
    {
        name: "Basic",
        description: "Untuk bisnis yang baru mulai bertumbuh.",
        price: "Rp 149.000",
        period: "/bulan",
        outletLimit: "1 Outlet",
        userLimit: "2 User",
        features: ["Laporan penjualan", "Manajemen produk", "Dukungan standar"],
    },
    {
        name: "Pro",
        description: "Fleksibel untuk operasional multi-cabang.",
        price: "Rp 399.000",
        period: "/bulan",
        outletLimit: "5 Outlet",
        userLimit: "10 User",
        recommended: true,
        features: ["Semua fitur Basic", "Laporan lanjutan", "Dukungan prioritas"],
    },
    {
        name: "Enterprise",
        description: "Kontrol penuh untuk skala bisnis yang lebih besar.",
        price: "Hubungi kami",
        period: "",
        outletLimit: "Unlimited Outlet",
        userLimit: "Unlimited User",
        features: ["Semua fitur Pro", "Onboarding khusus", "Account manager khusus"],
    },
];

const paymentMethods = [
    {
        id: "bank-transfer",
        name: "Transfer Bank",
        detail: "BCA 1234 5678 90 a.n. POS Admin",
        icon: Building2,
    },
    {
        id: "qris",
        name: "QRIS",
        detail: "Bayar instan melalui aplikasi pilihan Anda",
        icon: QrCode,
    },
];

function UsageBar({ label, used, total, icon: Icon }) {
    const percentage = Math.round((used / total) * 100);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Icon className="h-4 w-4 text-slate-400" />
                    {label}
                </span>
                <span className="text-slate-500">
                    {used} dari {total}
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export default function SubscriptionIndex() {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("bank-transfer");

    const openPaymentModal = (plan) => {
        setSelectedPlan(plan);
        setPaymentMethod("bank-transfer");
    };

    return (
        <AuthenticatedLayout>
            <Head title="Paket Langganan" />

            <PageHeader
                title="Paket Langganan"
                subtitle="Daftar paket langganan yang tersedia untuk pelanggan"
            />

            <div className="space-y-6">
                <section className="relative overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
                    <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-emerald-400/10" />
                    <div className="relative grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Langganan aktif
                            </div>
                            <div>
                                <div className="mb-2 flex items-center gap-3">
                                    <Crown className="h-6 w-6 text-amber-300" />
                                    <h3 className="text-3xl font-bold tracking-tight">PRO PLAN</h3>
                                </div>
                                <p className="text-sm leading-6 text-slate-300">
                                    Akses fitur lengkap untuk mengelola operasional bisnis multi-cabang.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                                <span className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                    Berlaku sampai 16 Oktober 2026
                                </span>
                                <span className="font-semibold text-amber-300">30 hari tersisa</span>
                            </div>
                        </div>

                        <div className="space-y-5 rounded-lg border border-white/10 bg-white/[0.06] p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Pemakaian saat ini</p>
                                    <p className="mt-1 font-semibold text-white">Kuota akun dan cabang</p>
                                </div>
                                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                            </div>
                            <UsageBar label="Outlet" used={3} total={5} icon={Store} />
                            <UsageBar label="User" used={7} total={10} icon={Users} />
                        </div>
                    </div>
                </section>

                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900">Pilih paket yang sesuai</h3>
                        <p className="mt-1 text-sm text-slate-500">Upgrade kapan saja dan nikmati operasional yang lebih lancar.</p>
                    </div>
                </div>

                <section className="grid gap-5 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <article
                            key={plan.name}
                            className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                                plan.recommended ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200"
                            }`}
                        >
                            {plan.recommended && (
                                <div className="absolute right-5 top-5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                    Recommended
                                </div>
                            )}
                            <div className="mb-6">
                                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{plan.name}</p>
                                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">{plan.description}</p>
                                <div className="mt-5 flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-950">{plan.price}</span>
                                    <span className="text-sm text-slate-500">{plan.period}</span>
                                </div>
                            </div>

                            <div className="space-y-3 border-y border-slate-100 py-5 text-sm">
                                {[plan.outletLimit, plan.userLimit, ...plan.features].map((feature) => (
                                    <div key={feature} className="flex items-start gap-3 text-slate-700">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                            <Check className="h-3.5 w-3.5" />
                                        </span>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => openPaymentModal(plan)}
                                className={`mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition ${
                                    plan.recommended
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                                Upgrade / Perpanjang Paket
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </article>
                    ))}
                </section>
            </div>

            <Modal show={Boolean(selectedPlan)} onClose={() => setSelectedPlan(null)} maxWidth="lg">
                <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Konfirmasi paket</p>
                            <h3 className="mt-1 text-xl font-bold text-slate-900">Metode pembayaran</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Pilih metode pembayaran untuk {selectedPlan?.name}.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedPlan(null)}
                            className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Tutup modal"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="space-y-5 p-6">
                    <div className="rounded-lg bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-500">Paket dipilih</span>
                            <span className="font-semibold text-slate-900">{selectedPlan?.name}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-500">Total pembayaran</span>
                            <span className="font-bold text-emerald-700">{selectedPlan?.price}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            const isSelected = paymentMethod === method.id;

                            return (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition ${
                                        isSelected ? "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500" : "border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-semibold text-slate-900">{method.name}</span>
                                        <span className="mt-1 block text-xs text-slate-500">{method.detail}</span>
                                    </span>
                                    <span className={`h-4 w-4 rounded-full border-4 ${isSelected ? "border-emerald-600" : "border-slate-300"}`} />
                                </button>
                            );
                        })}
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelectedPlan(null)}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                        Lanjutkan Pembayaran
                        <CreditCard className="h-4 w-4" />
                    </button>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}