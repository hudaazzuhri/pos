import Toggle from "./Toggle";
import { ErrorMessage, FieldLabel, inputClassName } from "./FormField";

export default function TaxSettings({ data, errors, onChange }) {
    return (
        <div className="max-w-2xl space-y-5">
            <Toggle checked={data.enable_tax} onChange={(value) => onChange("enable_tax", value)} label="Aktifkan Pajak (PPN)" description="Pajak akan dihitung otomatis pada setiap transaksi." />
            <div className={`${data.enable_tax ? "opacity-100" : "opacity-50"} transition`}>
                <FieldLabel>Persentase Pajak (%)</FieldLabel>
                <div className="relative">
                    <input type="number" min="0" max="100" step="0.01" value={data.tax_percentage} disabled={!data.enable_tax} onChange={(event) => onChange("tax_percentage", event.target.value)} className={inputClassName} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">%</span>
                </div>
                <ErrorMessage error={errors.tax_percentage} />
            </div>
        </div>
    );
}