export const inputClassName =
    "mt-2 block h-11 w-full rounded-md border-slate-200 bg-white text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-indigo-500";

export function FieldLabel({ children }) {
    return <label className="text-sm font-semibold text-slate-700">{children}</label>;
}

export function ErrorMessage({ error }) {
    return error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null;
}