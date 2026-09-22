import { Link, usePage } from "@inertiajs/react";
import { navigationMenu } from "@/Config/navigation";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Sidebar({ collapsed = false, onNavigate }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role; // 'owner', 'manager', atau 'cashier'

    // Filter menu berdasarkan role user yang aktif
    const filteredNav = navigationMenu
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.roles.includes(userRole)),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <div className="flex h-full min-h-0 flex-col bg-slate-900 text-slate-300">
            {/* Brand Header */}
            <div className={`flex h-16 items-center border-b border-slate-800 ${collapsed ? "justify-center px-3" : "justify-between px-4"}`}>
                <div className="flex items-center gap-3">
                    <ApplicationLogo className="h-8 w-auto fill-current text-white" />
                    {!collapsed && <span className="text-lg font-bold text-white">POS</span>}
                </div>
                {!collapsed && (
                    <span className="rounded bg-indigo-600 px-2 py-0.5 text-xs capitalize text-white">
                        {userRole}
                    </span>
                )}
            </div>

            {/* Navigation Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
                {filteredNav.map((group, groupIdx) => (
                    <div key={groupIdx}>
                        {!collapsed && (
                            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {group.group}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item, itemIdx) => {
                                const isActive = route().current(
                                    item.routeName,
                                );
                                return (
                                    <Link
                                        key={itemIdx}
                                        href={route(item.routeName)}
                                        onClick={onNavigate}
                                        title={collapsed ? item.title : undefined}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? "bg-indigo-600 text-white"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                        }`}
                                    >
                                        <div className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"}`}>
                                            {!collapsed && <span>{item.title}</span>}
                                        </div>
                                        {!collapsed && item.badge && (
                                            <span className="text-[10px] bg-slate-800 text-indigo-400 px-1.5 py-0.5 rounded font-mono border border-indigo-500/30">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
