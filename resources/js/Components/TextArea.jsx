import { forwardRef, useEffect, useRef } from 'react';
import { Label } from './ui/label';

export default forwardRef(function TextArea({ type = 'text', className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <div className="space-y-1">
            <Label>
                {props.label}{" "}
                {props.required && <span className="text-red-500">*</span>}
            </Label>
            <textarea
                ref={input}
                style={{marginBottom: -8}}
                className={
                    "w-full border border-gray-400 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 rounded-[0.5rem] " +
                    className
                }
                {...props}
            />
        </div>
    );
});
