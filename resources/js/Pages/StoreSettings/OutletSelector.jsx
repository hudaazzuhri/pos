export default function OutletSelector({ outlets, selectedOutletId, onChange }) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
                <p className="text-sm font-semibold text-slate-800">Outlet yang sedang diatur</p>
                <p className="mt-1 text-xs text-slate-500">Setiap outlet memiliki profil, struk, dan pajak masing-masing.</p>
            </div>
            <div className="min-w-0 sm:w-72">
                <label htmlFor="outlet_id" className="sr-only">Pilih outlet</label>
                <select
                    id="outlet_id"
                    value={selectedOutletId ?? ""}
                    onChange={onChange}
                    className="block h-11 w-full rounded-md border-slate-200 bg-white text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    {outlets.map((outlet) => (
                        <option key={outlet.id} value={outlet.id}>
                            {outlet.name}{outlet.is_main ? " (Toko Utama)" : " (Cabang)"}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}