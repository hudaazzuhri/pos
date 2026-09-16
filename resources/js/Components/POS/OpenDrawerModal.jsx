import { useState } from 'react';
import { X } from 'lucide-react';
import { triggerPhysicalDrawer } from '@/Utils/cashDrawer';

const csrfToken = () =>
    decodeURIComponent(
        document.cookie
            .split('; ')
            .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || '',
    );

export default function OpenDrawerModal({ open, onClose, onSuccess }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [drawerWarning, setDrawerWarning] = useState('');

    if (!open) {
        return null;
    }

    const submit = async (event) => {
        event.preventDefault();
        const trimmedReason = reason.trim();

        if (!trimmedReason) {
            setError('Alasan wajib diisi.');
            return;
        }

        setProcessing(true);
        setError('');
        setDrawerWarning('');

        try {
            const drawerPromise = triggerPhysicalDrawer().catch((drawerError) => {
                setDrawerWarning(drawerError.message);
            });
            const response = await fetch(route('pos.cash-drawer.open-manual'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({ reason: trimmedReason }),
            });
            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || 'Gagal mencatat pembukaan laci.');
            }

            await drawerPromise;

            setReason('');
            onSuccess?.(payload);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Laci Uang
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Buka Laci Manual
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
                            Alasan
                        </label>
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            rows={3}
                            maxLength={255}
                            placeholder="Contoh: Mengambil uang pecahan kecil"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                            autoFocus
                        />
                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        {drawerWarning && (
                            <p className="mt-2 text-sm text-amber-600">{drawerWarning}</p>
                        )}
                    </div>

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
                            {processing ? 'Memproses...' : 'Buka Laci'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
