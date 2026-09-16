import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

export default function OpenShiftModal({ open }) {
    const { data, setData, post, processing, errors } = useForm({
        starting_cash: '',
    });

    if (!open) {
        return null;
    }

    const submit = (event) => {
        event.preventDefault();
        post(route('pos.shift.open'));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Kasir
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">
                            Buka Shift Kasir
                        </h2>
                    </div>
                    <X className="h-5 w-5 text-slate-400" />
                </div>

                <form onSubmit={submit} className="mt-5 space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Modal awal
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.starting_cash}
                            onChange={(event) =>
                                setData('starting_cash', event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                            placeholder="0"
                            autoFocus
                        />
                        {errors.starting_cash && (
                            <p className="mt-2 text-sm text-red-600">
                                {errors.starting_cash}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                    >
                        {processing ? 'Membuka shift...' : 'Buka Shift'}
                    </button>
                </form>
            </div>
        </div>
    );
}