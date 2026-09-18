import { forwardRef, useRef, useState, useEffect } from "react";
import Select, { components } from "react-select";
import { Label } from "./ui/label";

export default forwardRef(function LazyLoadSelect(
    {
        fetchData, // async (page, search) => { data:[{value,label,...}], hasMore:boolean }
        className = "",
        debounceTime = 500,
        clearSearchOnSelect = true,
        reRender = false,
        setReRender,
        renderOption, // <-- custom renderer
        ...props
    },
    ref
) {
    const input = ref ? ref : useRef();

    const [options, setOptions] = useState([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const requestIdRef = useRef(0);

    // Debounce
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
        }, debounceTime);
        return () => clearTimeout(t);
    }, [search, debounceTime]);

    // Reset ketika query berubah
    useEffect(() => {
        setPage(1);
        setOptions([]);
        setHasMore(true);
        if (debouncedSearch !== null) {
            loadOptions(1, debouncedSearch);
        }
    }, [debouncedSearch]);

    const loadOptions = async (pageNum, query = "") => {
        if (loading) return;
        setLoading(true);
        const rid = ++requestIdRef.current;

        try {
            const result = await fetchData(pageNum, query);
            if (rid !== requestIdRef.current) return;

            if (pageNum === 1) {
                setOptions(result.data || []);
            } else {
                setOptions((prev) => [...prev, ...(result.data || [])]);
            }
            setHasMore(!!result.hasMore);
        } finally {
            if (rid === requestIdRef.current) setLoading(false);
        }

        setReRender(false);
    };

    useEffect(() => {
        if (reRender) {
            loadOptions(1, debouncedSearch);
        }
    }, [reRender]);

    const handleScrollBottom = () => {
        if (hasMore && !loading) {
            const next = page + 1;
            setPage(next);
            loadOptions(next, debouncedSearch);
        }
    };

    const handleInputChange = (val, meta) => {
        if (meta.action === "input-change") {
            setInputValue(val);
            setSearch(val);
        }
        if (clearSearchOnSelect && meta.action === "set-value") {
            setInputValue("");
            setSearch("");
        }
        return val;
    };

    const handleMenuOpen = () => {
        if (options.length === 0 && !loading) {
            setPage(1);
            loadOptions(1, debouncedSearch);
        }
    };

    // --- Custom Option component
    const CustomOption = (propsOption) => {
        const { data } = propsOption;
        return (
            <components.Option {...propsOption}>
                {renderOption ? (
                    renderOption(data)
                ) : (
                    <span className="font-medium">{data.label}</span>
                )}
            </components.Option>
        );
    };

    console.log("options", props.value);

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

            <Select
                {...props}
                ref={input}
                className={
                    "border-gray-400 focus:border-indigo-500 focus:ring-indigo-500 rounded-md !text-sm " +
                    className
                }
                styles={{
                    control: (base) => ({
                        ...base,
                        fontSize: "0.875rem",
                        minHeight: "40px",
                        borderRadius: "6px",
                        borderColor: "#9ca3af",
                    }),
                    option: (base) => ({
                        ...base,
                        fontSize: "0.875rem",
                        minHeight: "40px",
                        borderRadius: "4px",
                        borderColor: "#9ca3af",
                    }),
                    menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                options={options}
                isLoading={loading && page === 1}
                onMenuOpen={handleMenuOpen}
                onMenuScrollToBottom={handleScrollBottom}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                filterOption={null}
                noOptionsMessage={() =>
                    loading
                        ? "Memuat..."
                        : inputValue
                          ? "Tidak ada data"
                          : "Data kosong"
                }
                value={
                    props.isMulti
                        ? props.value
                        : props.value && typeof props.value === 'object'
                          ? props.value
                          : options?.find(
                              (option) => option.value === props.value,
                          ) || props.value
                }
                isClearable={props.required ? false : true}
                components={{ Option: CustomOption }}
            />
        </div>
    );
});
