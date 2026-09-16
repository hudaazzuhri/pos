/**
 * Konfigurasi Menu Navigasi POS SaaS
 *
 * Target Roles:
 * - 'owner'   : Akses penuh (Laporan, Keuangan, Pengaturan Toko, Cabang)
 * - 'manager' : Manajemen Stok, Produk, Shift Kasir, Diskon
 * - 'cashier' : Terminal Kasir & Transaksi Shift Berjalan
 */

export const navigationMenu = [
    {
        group: "Utama",
        items: [
            {
                title: "Dashboard",
                icon: "LayoutDashboardIcon", // Komponen Icon (misal Lucide React)
                routeName: "dashboard",
                roles: ["owner", "manager"],
                badge: null,
            },
            {
                title: "Terminal Kasir (POS)",
                icon: "ShoppingCartIcon",
                routeName: "pos.terminal",
                roles: ["owner", "manager", "cashier"],
                badge: "PWA", // Penanda Mode Kasir Fast Checkout
            },
        ],
    },
    {
        group: "Katalog & Inventori",
        items: [
            {
                title: "Daftar Produk",
                icon: "PackageIcon",
                routeName: "products.index",
                roles: ["owner", "manager"],
                badge: null,
            },
            {
                title: "Kategori Produk",
                icon: "FolderIcon",
                routeName: "categories.index",
                roles: ["owner", "manager"],
                badge: null,
            },
            {
                title: "Diskon & Promo",
                icon: "PercentIcon",
                routeName: "discounts.index",
                roles: ["owner", "manager"],
                badge: null,
            },
        ],
    },
    {
        group: "Management Stok",
        items: [
            {
                title: "Penyesuaian Stok",
                icon: "BoxesIcon",
                routeName: "stock.index",
                roles: ["owner", "manager"],
                badge: null,
            },
            {
                title: "Stock Opname",
                icon: "FolderIcon",
                routeName: "stock-opname.index",
                roles: ["owner", "manager"],
                badge: null,
            },
        ],
    },
    {
        group: "Operasional Kasir",
        items: [
            {
                title: "Shift Kasir (Open/Close)",
                icon: "ClockIcon",
                routeName: "pos.shift.index",
                roles: ["owner", "manager", "cashier"],
                badge: null,
            },
            {
                title: "Riwayat Transaksi",
                icon: "ReceiptIcon",
                routeName: "transactions.index",
                roles: ["owner", "manager", "cashier"],
                badge: null,
            },
            {
                title: "Pelanggan (CRM)",
                icon: "UsersIcon",
                routeName: "customers.index",
                roles: ["owner", "manager", "cashier"],
                badge: null,
            },
        ],
    },
    {
        group: "Laporan & Bisnis",
        items: [
            {
                title: "Laporan Penjualan",
                icon: "TrendingUpIcon",
                routeName: "reports.sales",
                roles: ["owner", "manager"],
                badge: null,
            },
            {
                title: "Laporan Laba Kotor (HPP)",
                icon: "DollarSignIcon",
                routeName: "reports.gross-profit",
                roles: ["owner"],
                badge: null,
            },
            {
                title: "Audit Log (Aktivitas Staff)",
                icon: "ShieldAlertIcon",
                routeName: "reports.audit-logs",
                roles: ["owner"],
                badge: null,
            },
        ],
    },
    {
        group: "Pengaturan & SaaS",
        items: [
            {
                title: "Manajemen Cabang",
                icon: "StoreIcon",
                routeName: "outlets.index",
                roles: ["owner"],
                badge: null,
            },
            {
                title: "Kelola Karyawan",
                icon: "UserCheckIcon",
                routeName: "employees.index",
                roles: ["owner", "manager"],
                badge: null,
            },
            {
                title: "Paket Langganan SaaS",
                icon: "CreditCardIcon",
                routeName: "subscriptions.index",
                roles: ["owner"],
                badge: "Billing",
            },
            {
                title: "Pengaturan Toko & Struk",
                icon: "SettingsIcon",
                routeName: "settings.index",
                roles: ["owner"],
                badge: null,
            },
        ],
    },
];
