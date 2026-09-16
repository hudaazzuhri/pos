import { CheckCircle, XCircle } from "lucide-react";

export default function Toggle({ checked, onChange, label, description }) {
    console.log("Toggle checked:", checked);
    return (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
            <span>
                <span className="block text-sm font-semibold text-slate-800">
                    {label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {description}
                </span>
            </span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="sr-only"
            />

            {checked ? (
                <CheckCircle
                    size={24}
                    className={`h-6 w-6 text-emerald-600 transition-opacity`}
                />
            ) : (
                <XCircle
                    size={24}
                    className={`h-6 w-6 text-red-600 transition-opacity`}
                />
            )}
        </label>
    );
}
