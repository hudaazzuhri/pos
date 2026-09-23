import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { BarChart3, Boxes, Check, Crown, Store, Users } from "lucide-react";

const money = (value) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
}).format(value);

function UsageBar({ label, used, limit, icon: Icon }) {
    const unlimited = limit === 0;
    const percentage = unlimited ? 0 : Math.min(100, (used / limit) * 100);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700"><Icon className="h-4 w-4 text-slate-400" />{label}</span>
                <span className="text-slate-500">{used.toLocaleString("id-ID")} / {unlimited ? "Unlimited" : limit.toLocaleString("id-ID")}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${percentage}%` }} /></div>
        </div>
    );
}

export default function SubscriptionIndex({ plans, subscription, usage }) {
    const { post, processing } = useForm();
    const choosePlan = (planId) => post(route("subscriptions.store"), { plan_id: planId });

    return (
        <AuthenticatedLayout>
            <Head title="Paket Langganan" />
            <PageHeader title="Paket Langganan" subtitle="Kelola paket dan pantau penggunaan tenant Anda." />
            <div className="space-y-6">
                <section className="rounded-xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
                    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" />{subscription.status === "active" ? "Langganan aktif" : "Belum ada langganan aktif"}</div>
                            <div className="flex items-center gap-3"><Crown className="h-7 w-7 text-amber-300" /><h2 className="text-3xl font-bold">{subscription.package_name}</h2></div>
                            <p className="text-sm text-slate-300">{subscription.expires_at ? `Berlaku sampai ${new Date(subscription.expires_at).toLocaleDateString("id-ID")}. ${subscription.days_remaining} hari tersisa.` : "Pilih paket untuk mengaktifkan seluruh fitur POS."}</p>
                        </div>
                        <div className="space-y-5 rounded-lg border border-white/10 bg-white/[0.06] p-5">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white"><BarChart3 className="h-5 w-5 text-emerald-300" />Penggunaan bulan ini</div>
                            <UsageBar label="Transaksi" used={usage.transactions} limit={usage.transactions_limit} icon={BarChart3} />
                            <UsageBar label="Outlet" used={usage.outlets} limit={usage.outlets_limit} icon={Store} />
                            <UsageBar label="User" used={usage.users} limit={usage.users_limit} icon={Users} />
                        </div>
                    </div>
                </section>
                <div><h2 className="text-xl font-bold text-slate-900">Pilih paket yang sesuai</h2><p className="mt-1 text-sm text-slate-500">Permintaan upgrade akan membuat instruksi pembayaran untuk diproses.</p></div>
                <section className="grid gap-5 lg:grid-cols-3">
                    {plans.map((plan) => {
                        const isCurrent = subscription.package_name.toLowerCase() === plan.name.toLowerCase() && subscription.status === "active";
                        const limits = [`${plan.max_outlets || "Unlimited"} outlet`, `${plan.max_users || "Unlimited"} user`, `${plan.max_monthly_transactions || "Unlimited"} transaksi/bulan`, `${plan.max_products || "Unlimited"} produk`, `Retensi audit ${plan.audit_retention_days} hari`];
                        return (
                            <article key={plan.id} className={`flex flex-col rounded-xl border bg-white p-6 shadow-sm ${isCurrent ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200"}`}>
                                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{plan.name}</p><p className="mt-3 text-2xl font-bold text-slate-950">{money(plan.price)}<span className="text-sm font-normal text-slate-500">/bulan</span></p></div>{isCurrent && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Paket Anda Saat Ini</span>}</div>
                                <div className="mt-6 flex-1 space-y-3 border-y border-slate-100 py-5 text-sm">{limits.map((limit) => <div key={limit} className="flex items-start gap-3 text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{limit}</div>)}</div>
                                <button type="button" disabled={processing || isCurrent} onClick={() => choosePlan(plan.id)} className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{isCurrent ? "Paket Aktif" : "Pilih / Upgrade Paket"}</button>
                            </article>
                        );
                    })}
                </section>
                <div className="flex items-center gap-2 text-sm text-slate-500"><Boxes className="h-4 w-4" />Limit bernilai Unlimited jika ditampilkan sebagai 0.</div>
            </div>
        </AuthenticatedLayout>
    );
}
