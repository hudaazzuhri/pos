import { useState } from 'react';
import { X } from 'lucide-react';

const csrfToken = () =>
    decodeURIComponent(
        document.cookie
            .split('; ')
            .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || '',
    );

export default function CashMovementModal({ open, onClose, onSuccess }) {
    const [type, setType] = useState('in');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    if (!open) {
        return null;
    }

    const submit = async (event) => {
        event.preventDefault();
        const numericAmount = Number(amount);
        const trimmedNotes = notes.trim();

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setError('Nominal harus lebih besar dari 0.');
            return;
        }

        if (!trimmedNotes) {
            setError('Catatan wajib diisi.');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const response = await fetch(route('pos.cash-drawer.movement'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({
                    type,
                    amount: numericAmount,
                    notes: trimmedNotes,
                }),
            });
            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || 'Gagal menyimpan pergerakan kas.');
            }

            setAmount('');
            setNotes('');
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
                            Pergerakan Kas
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
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            ['in', 'Kas Masuk'],
                            ['out', 'Kas Keluar'],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setType(value)}
                                className={[
                                    'rounded-xl border px-3 py-2.5 text-sm font-semibold transition',
                                    type === value
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                                ].join(' ')}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Nominal
                        </label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                            placeholder="0"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Catatan
                        </label>
                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows={3}
                            maxLength={255}
                            placeholder="Contoh: Pembelian perlengkapan toko"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

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
                            {processing ? 'Menyimpan...' : 'Simpan Pergerakan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
