import { Printer, Receipt, Store } from "lucide-react";

const tabs = [
    { id: "profile", label: "Profil Toko", icon: Store },
    { id: "receipt", label: "Struk & Printer", icon: Printer },
    { id: "tax", label: "Pajak & Biaya", icon: Receipt },
];

export default function SettingsTabs({ activeTab, onChange }) {
    return (
        <div className="flex overflow-x-auto border-b border-slate-200 px-2 sm:px-4">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm font-semibold transition ${isActive ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                    >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}