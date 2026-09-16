import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

export default function ReconcileShiftModal({ open, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        actual_cash: '',
    });

    if (!open) {
        return null;
    }

    const submit = (event) => {
        event.preventDefault();

        post(route('pos.shift.close'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Rekonsiliasi Kasir
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Tutup Shift
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                        aria-label="Tutup modal"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={submit} className="mt-5 space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Kas fisik di laci
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.actual_cash}
                            onChange={(event) => setData('actual_cash', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                            placeholder="0"
                            autoFocus
                        />
                        {errors.actual_cash && (
                            <p className="mt-2 text-sm text-red-600">{errors.actual_cash}</p>
                        )}
                    </div>

                    <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                        Sistem akan menghitung kas ekspektasi dan selisih secara otomatis berdasarkan transaksi tunai dan pergerakan kas.
                    </p>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                        >
                            {processing ? 'Menutup...' : 'Tutup Shift'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
