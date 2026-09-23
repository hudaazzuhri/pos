import { Link, useForm, usePage } from "@inertiajs/react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import CurrencyInput from "../CurrencyInput";

export default function OpenShiftModal({ open }) {
    const { user } = usePage().props.auth;
    const { data, setData, post, processing, errors } = useForm({
        starting_cash: "",
    });

    if (!open) {
        return null;
    }

    const submit = (event) => {
        event.preventDefault();
        post(route("pos.shift.open"));
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

                <form onSubmit={submit} className="mt-5">
                    <div>
                        <CurrencyInput
                            label="Modal Awal"
                            value={data.starting_cash}
                            onChange={(value) =>
                                setData("starting_cash", value)
                            }
                            placeholder="0"
                            autoFocus
                        />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-2">
                        {user.role === "owner" && (
                            <Link href={route("dashboard")} className="w-full">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    size="lg"
                                >
                                    Back To Dashboard
                                </Button>
                            </Link>
                        )}
                        {user.role === "cashier" && (
                            <Link href={route("logout")} method="post">
                                <Button
                                    type="button"
                                    variant="cancel"
                                    className="w-full"
                                    size="lg"
                                >
                                    Log Out
                                </Button>
                            </Link>
                        )}
                        <Button
                            type="submit"
                            disabled={processing}
                            variant="primary"
                            size="lg"
                        >
                            {processing ? "Membuka shift..." : "Buka Shift"}
                        </Button>
                    </div>
                    <div className="w-full"></div>
                </form>
            </div>
        </div>
    );
}
