import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "@inertiajs/react";
import {
    FaDownload,
    FaMoneyBill,
    FaPencil,
    FaPrint,
    FaRegEye,
} from "react-icons/fa6";
import { BiTrash } from "react-icons/bi";
import { DownloadFile } from "@/Helper/Helper";
import axios from "axios";
import { Button } from "./ui/button";
import { useState } from "react";

export const ViewButton = (props) => {
    const getButton = () => {
        const className =
            "h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center border border-indigo-500 text-xs sm:text-sm text-indigo-500 hover:bg-indigo-100/70 duration-200 cursor-pointer rounded-[0.25rem]";
        if (props.href) {
            return (
                <Link href={props.href}>
                    <button type="button" className={className}>
                        <FaRegEye />
                    </button>
                </Link>
            );
        } else {
            return (
                <button
                    type="button"
                    className={className}
                    onClick={props.onClick}
                >
                    <FaPencil />
                </button>
            );
        }
    };

    return (
        <TooltipProvider delayDuration={50}>
            <Tooltip>
                <TooltipTrigger asChild>{getButton()}</TooltipTrigger>
                <TooltipContent>
                    <p>Lihat</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export const PaymentButton = (props) => {
    const getButton = () => {
        const className =
            "h-8 w-8 flex items-center justify-center border border-green-500 text-sm text-green-500 hover:bg-green-100/70 duration-200 cursor-pointer rounded-[0.25rem]";
        if (props.href) {
            return (
                <Link href={props.href}>
                    <button type="button" className={className}>
                        <FaMoneyBill />
                    </button>
                </Link>
            );
        } else {
            return (
                <button
                    type="button"
                    className={className}
                    onClick={props.onClick}
                >
                    <FaMoneyBill />
                </button>
            );
        }
    };

    return (
        <TooltipProvider delayDuration={50}>
            <Tooltip>
                <TooltipTrigger asChild>{getButton()}</TooltipTrigger>
                <TooltipContent>
                    <p>Dibayar</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
export const EditButton = (props) => {
    const getButton = () => {
        const btnClass =
            `h-7 w-7 text-xs sm:h-8 sm:w-8 flex items-center justify-center border border-blue-500 sm:text-sm text-blue-500 hover:bg-blue-100/70 duration-200 cursor-pointer rounded-[0.25rem] ${props.className}`;
        if (props.href) {
            return (
                <Link href={props.href}>
                    <button type="button" className={btnClass}>
                        <FaPencil />
                    </button>
                </Link>
            );
        } else {
            return (
                <button
                    type="button"
                    className={btnClass}
                    onClick={props.onClick}
                >
                    <FaPencil />
                </button>
            );
        }
    };

    return (
        <TooltipProvider delayDuration={50}>
            <Tooltip>
                <TooltipTrigger asChild>{getButton()}</TooltipTrigger>
                <TooltipContent>
                    <p>Edit</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export const DeleteButton = (props) => {
    return (
        <TooltipProvider delayDuration={50}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        className={`h-7 w-7 text-xs sm:h-8 sm:w-8 flex items-center justify-center border border-red-500 sm:text-sm text-red-500 hover:bg-red-100/70 duration-200 rounded-[0.25rem] ${props.className} ${props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={props.onClick}
                        disabled={props.disabled}
                    >
                        <BiTrash />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Hapus</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
export const PrintButton = (props) => {
    const onHandleClick = async () => {
        const res = await axios.get(props.href);
        if (res.status === 200) {
            DownloadFile("/api/download?path=" + res.data.data);
        }
    };
    const getButton = () => {
        const className =
            "h-7 w-7 text-xs sm:h-8 sm:w-8 flex items-center justify-center border border-orange-500 sm:text-sm text-orange-500 hover:bg-orange-100/70 duration-200 cursor-pointer rounded-[0.25rem]";

        return (
            <button type="button" className={className} onClick={onHandleClick}>
                <FaPrint />
            </button>
        );
    };

    return (
        <TooltipProvider delayDuration={50}>
            <Tooltip>
                <TooltipTrigger asChild>{getButton()}</TooltipTrigger>
                <TooltipContent>
                    <p>Print</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export const ExportExcelSingleButton = (props) => {
    const [loading, setLoading] = useState(false);
    
    const onHandleClick = async () => {
        setLoading(true);
        if (props.onLoadingChange) {
            props.onLoadingChange(true);
        }
        try {
            const res = await axios.get(props.href);
            if (res.status === 200) {
                DownloadFile("/api/download?path=" + res.data.data);
            }
        } finally {
            setLoading(false);
            if (props.onLoadingChange) {
                props.onLoadingChange(false);
            }
        }
    };

    return (
        <Button
            className="flex item-center gap-2 h-8 w-8 sm:h-10 sm:w-10 p-2 sm:px-4 sm:w-fit rounded-[0.25rem]"
            size={props.size ?? "default"}
            variant={"outline"}
            onClick={onHandleClick}
            disabled={loading}
        >
            <FaDownload /> {loading ? "Processing..." : "Export Excel"}
        </Button>
    );
};

export const ExportExcelButton = (props) => {
    const [disabled, setDisabled] = useState(false);
    const onHandleClick = async () => {
        setDisabled(true);
        const res = await axios.get(props.href, { params: props.params });
        if (res.status === 200) {
            DownloadFile("/api/download?path=" + res.data.data);
        }
        setDisabled(false);
    };

    return (
        <Button
            className="flex item-center gap-2 h-8 w-8 sm:h-10 sm:w-10 p-2 sm:px-4 sm:w-fit rounded-[0.5rem]"
            size={props.size ?? "default"}
            variant={"green"}
            onClick={onHandleClick}
            disabled={disabled || props.disabled}
        >
            <FaDownload />{" "}
            <span className="hidden sm:inline-block">
                {disabled ? "Processing..." : "Export"}
            </span>
        </Button>
    );
};
