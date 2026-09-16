import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm } from "@inertiajs/react";
import { Check, Save } from "lucide-react";
import { useEffect, useState } from "react";
import OutletSelector from "./OutletSelector";
import ProfileSettings from "./ProfileSettings";
import ReceiptSettings from "./ReceiptSettings";
import SettingsTabs from "./SettingsTabs";
import TaxSettings from "./TaxSettings";

export default function StoreSettingsIndex({
    outlets = [],
    selectedOutletId,
    storeSettings = {},
}) {
    const [activeTab, setActiveTab] = useState("profile");
    const [logoPreview, setLogoPreview] = useState(
        storeSettings.logo_url ?? null,
    );
    const { data, setData, post, processing, errors, recentlySuccessful } =
        useForm({
            outlet_id: selectedOutletId ?? storeSettings.outlet_id ?? "",
            store_name: storeSettings.store_name ?? "",
            phone: storeSettings.phone ?? "",
            address_header: storeSettings.address_header ?? "",
            logo: null,
            paper_size: storeSettings.paper_size ?? "58mm",
            auto_print_receipt: Boolean(storeSettings.auto_print_receipt),
            footer_receipt_notes: storeSettings.footer_receipt_notes ?? "",
            enable_tax: Boolean(storeSettings.enable_tax),
            tax_percentage: storeSettings.tax_percentage ?? "0",
        });

    useEffect(() => {
        return () => {
            if (logoPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setData("logo", file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const handleChange = (field, value) => {
        setData(field, value);
    };

    const submit = (event) => {
        event.preventDefault();
        post(route("settings.update"), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const changeOutlet = (event) => {
        router.get(
            route("settings.index"),
            { outlet_id: event.target.value },
            { preserveScroll: true },
        );
    };

    const renderActiveTab = () => {
        if (activeTab === "receipt") {
            return (
                <ReceiptSettings
                    data={data}
                    errors={errors}
                    logoPreview={logoPreview}
                    onChange={handleChange}
                />
            );
        }

        if (activeTab === "tax") {
            return (
                <TaxSettings
                    data={data}
                    errors={errors}
                    onChange={handleChange}
                />
            );
        }

        return (
            <ProfileSettings
                data={data}
                errors={errors}
                logoPreview={logoPreview}
                onChange={handleChange}
                onLogoChange={handleLogoChange}
            />
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Toko" />
            <PageHeader
                title="Pengaturan Toko"
                subtitle="Kelola profil toko, struk, printer thermal, dan pajak."
            />

            <form onSubmit={submit} className="space-y-3">
                <OutletSelector
                    outlets={outlets}
                    selectedOutletId={selectedOutletId}
                    onChange={changeOutlet}
                />
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <SettingsTabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                    />
                    <div className="p-5 sm:p-8">{renderActiveTab()}</div>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {processing ? "Menyimpan..." : "Simpan Pengaturan"}
                    </button>
                    {recentlySuccessful && (
                        <span className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600">
                            <Check className="h-4 w-4" />
                            Pengaturan tersimpan
                        </span>
                    )}
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
