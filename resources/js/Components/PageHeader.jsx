import { ArrowLeft } from "lucide-react";
import * as React from "react";

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function PageHeader({
    title,
    subtitle,
    actions,
    className,
    backAction,
    ...props
}) {
    const BackButton = () => {
        const buttonClasses =
            "inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900";

            return (
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className={buttonClasses}
                    aria-label="Kembali"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
            );        
    };

    return (
        <div
            className={cn(
                "mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center",
                className,
            )}
            {...props}
        >
            <div className="flex items-center gap-3">
                {backAction && <BackButton />}
                <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
            </div>
            {actions}
        </div>
    );
}
