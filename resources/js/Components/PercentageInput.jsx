import { formatCurrency } from "@/Helper/helper";
import { Label } from "@/Components/ui/label";
import { cn } from "cn";

export default function PercentageInput({
    value,
    onChange,
    className = "",
    ...props
}) {
    return (
        <div className="space-y-1">
            {props.label && (
                <Label>
                    {props.label}{" "}
                    {props.label && props.required && (
                        <span className="text-red-500">*</span>
                    )}
                </Label>
            )}
            <input
                {...props}
                type="text"
                inputMode="numeric"
                min={0}
                max={100}
                step={0.01}
                pattern="[0-9]*"
                placeholder="0.00"
                value={value}
                onChange={(event) => {
                    const digits = event.target.value.replace(/[^0-9]/g, "");
                    onChange(Number(digits) || 0);
                }}
                className={cn(
                    "h-9 w-full min-w-0 rounded-md border border-grey-300 bg-white px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
                    className,
                )}
            />
        </div>
    );
}
