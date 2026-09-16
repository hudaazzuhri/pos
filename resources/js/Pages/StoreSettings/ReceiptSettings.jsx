import ReceiptPreview from "./ReceiptPreview";
import Toggle from "./Toggle";
import { ErrorMessage, FieldLabel, inputClassName } from "./FormField";

export default function ReceiptSettings({ data, errors, logoPreview, onChange }) {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
                <div>
                    <FieldLabel>Ukuran Kertas</FieldLabel>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {["58mm", "80mm"].map((size) => <label key={size} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${data.paper_size === size ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-300"}`}><input type="radio" name="paper_size" value={size} checked={data.paper_size === size} onChange={(event) => onChange("paper_size", event.target.value)} className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500" /><span><span className="block text-sm font-semibold text-slate-800">{size}</span><span className="mt-1 block text-xs text-slate-500">Thermal printer</span></span></label>)}
                    </div>
                    <ErrorMessage error={errors.paper_size} />
                </div>
                <Toggle checked={data.auto_print_receipt} onChange={(value) => onChange("auto_print_receipt", value)} label="Otomatis Cetak Struk Setelah Checkout" description="Struk langsung dikirim ke printer setelah transaksi berhasil." />
                <div>
                    <FieldLabel>Pesan / Catatan Footer Struk</FieldLabel>
                    <textarea value={data.footer_receipt_notes} onChange={(event) => onChange("footer_receipt_notes", event.target.value)} rows={4} className={`${inputClassName} h-auto py-3`} placeholder="Contoh: Terima kasih sudah berbelanja." />
                    <ErrorMessage error={errors.footer_receipt_notes} />
                </div>
            </div>
            <ReceiptPreview data={data} logoUrl={logoPreview} />
        </div>
    );
}