import { formatCurrency } from "@/Helper/helper";

export default function CurrencyInput({ value, onChange, className = "", ...props }) {
    const formattedValue = value ? formatCurrency(value) : "";

    return (
        <input
            {...props}
            type="text"
            inputMode="numeric"
            value={formattedValue}
            onChange={(event) => {
                const digits = event.target.value.replace(/[^0-9]/g, "");
                onChange(Number(digits) || 0);
            }}
            className={className}
        />
    );
}