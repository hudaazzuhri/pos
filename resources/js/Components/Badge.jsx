import React from "react";

export const BadgeStatus = ({ status, size, ...props }) => {
    const getColorStatus = (status) => {
        let className = "";
        switch (status) {
            case "Belum Diproses":
            case "Belum Dibayar":
            case "Diproses":
            case "Dikirim":
            case "Tidak Aktif":
                className = "bg-gray-100 border border-gray-300 text-gray-600";
                break;
            case "Dibayar Sebagian":
            case "Diproses Sebagian":
            case "Dikirim Sebagian":
            case "Diterima Sebagian":
            case "Ditutup Belum Dibayar":
            case "Panen Awal":
                className =
                    "bg-orange-100 border border-orange-300 text-orange-600";
                break;
            case "Lunas":
            case "Terproses":
            case "Diterima":
            case "Dibayar":
            case "Permintaan Ditutup Lunas":
            case "Aktif":
            case "Penambahan":
                className =
                    "bg-green-100 border border-green-300 text-green-600";
                break;
            case "Difaktur":
            case "Ditutup":
            case "Ditutup Lunas":
            case "Panen Uang":
                className =
                    "bg-indigo-50 border border-indigo-300 text-indigo-600";
                break;
            case "Pengurangan":
            case "Dibatalkan":
                className =
                    "bg-red-50 border border-red-300 text-red-600";
                break;
            default:
                className = "bg-gray-100 border border-gray-300 text-gray-600";
                break;
        }

        return className;
    };

    const getSize = (size) => {
        let className = "h-[22px] text-xs";
        switch (size) {
            case "xs":
                className = "h-[16px] text-[10px]";
                break;
            case "sm":
                className = "h-[22px] text-xs";
                break;
            case "md":
                className = "h-[28px] text-sm";
                break;
            default:
                break;
        }
        return className;
    };

    return (
        <div
            className={
                "rounded-full py-[2px] px-3 flex items-center w-fit whitespace-nowrap " +
                getColorStatus(status) +
                " " +
                getSize(size)
            }
            {...props}
        >
            {status}
        </div>
    );
};
