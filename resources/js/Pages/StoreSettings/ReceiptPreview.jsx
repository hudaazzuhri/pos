export default function ReceiptPreview({ data, logoUrl }) {
    const paperWidth = data.paper_size === "80mm" ? "max-w-[360px]" : "max-w-[300px]";

    return (
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-800">Live Receipt Preview</p>
                    <p className="mt-1 text-xs text-slate-500">Preview mengikuti input Anda secara real-time.</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 shadow-sm">{data.paper_size}</span>
            </div>
            <div className={`mx-auto overflow-hidden bg-white px-5 py-6 font-mono text-[11px] text-slate-800 shadow-md ${paperWidth}`}>
                <div className="space-y-1 text-center">
                    {logoUrl && <img src={logoUrl} alt="Logo toko" className="mx-auto mb-2 h-10 w-10 object-contain" />}
                    <p className="font-bold uppercase">{data.store_name || "Nama Toko"}</p>
                    <p className="whitespace-pre-line text-[10px]">{data.address_header || "Alamat header struk"}</p>
                    <p>{data.phone || "No. telepon"}</p>
                </div>
                <div className="my-4 border-t border-dashed border-slate-400" />
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Kopi Susu x1</span><span>25.000</span></div>
                    <div className="flex justify-between"><span>Roti Bakar x1</span><span>18.000</span></div>
                    <div className="flex justify-between"><span>Air Mineral x1</span><span>5.000</span></div>
                </div>
                <div className="my-4 border-t border-dashed border-slate-400" />
                <div className="space-y-1 text-right">
                    <div className="flex justify-between"><span>Subtotal</span><span>48.000</span></div>
                    <div className="flex justify-between"><span>{data.enable_tax ? `PPN (${data.tax_percentage || 0}%)` : "Pajak"}</span><span>{data.enable_tax ? "5.280" : "0"}</span></div>
                    <div className="flex justify-between font-bold"><span>Total</span><span>{data.enable_tax ? "53.280" : "48.000"}</span></div>
                </div>
                <div className="my-4 border-t border-dashed border-slate-400" />
                <p className="whitespace-pre-line text-center text-[10px]">{data.footer_receipt_notes || "Terima kasih atas kunjungan Anda."}</p>
            </div>
        </div>
    );
}