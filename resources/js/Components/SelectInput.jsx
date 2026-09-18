import { forwardRef, useEffect, useRef } from "react";
import Select, { components as selectComponents } from "react-select";
import { Label } from "./ui/label";

export default forwardRef(function SelectInput(
    { options = [], className = "", renderOption, components, ...props },
    ref
) {
    const input = ref ? ref : useRef();
    const customComponents = renderOption
        ? {
              ...components,
              Option: (optionProps) => (
                  <selectComponents.Option {...optionProps}>
                      {renderOption(optionProps.data, optionProps)}
                  </selectComponents.Option>
              ),
          }
        : components;

    return (
        <div className="space-y-1 z-50">
            {props.label && (
                <Label>
                    {props.label}{" "}
                    {props.label && props.required && (
                        <span className="text-red-500">*</span>
                    )}
                </Label>
            )}
            <Select
                {...props}
                components={customComponents}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        fontSize: "0.875rem",
                        minHeight: "40px",
                        borderRadius: "0.4rem",
                        borderColor: "#9ca3af",
                        zIndex: 9999,
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        fontSize: "0.875rem",
                    }),
                    menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                className={
                    "border-gray-400 focus:border-indigo-500 focus:ring-indigo-500 rounded-md !text-sm " +
                    className
                }
                options={options}
                ref={input}
                isClearable={props.required ? false : true}
            />
            {props.help && (
                <span className="text-xs text-gray-600">{props.help}</span>
            )}
        </div>
    );
});
