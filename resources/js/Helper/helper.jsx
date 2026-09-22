// helper.jsx

/**
 * Formats a date string, timestamp, or Date object into "DD MMM YYYY" (e.g., "26 Jun 2026").
 * @param {Date | string | number} date - The date to format.
 * @returns {string} Formatted date string or an empty string if invalid.
 */
export const formatShortDate = (date) => {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(d);
};

/**
 * Formats a date string, timestamp, or Date object into "DD MMM YYYY HH:mm" (e.g., "26 Jun 2026 10:30").
 * @param {Date | string | number} date - The datetime to format.
 * @returns {string} Formatted datetime string or an empty string if invalid.
 */
export const formatShortDateTime = (date) => {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Ensures 24-hour format (e.g., 10:30 or 22:30)
    }).format(d);
};

export const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("id-ID");
};

export const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
