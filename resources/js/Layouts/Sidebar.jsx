import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { navigationMenu } from "@/Config/navigation";

export default function Sidebar() {
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
        <aside className="fixed bg-slate-900 text-slate-300 h-screen flex flex-col border-r border-slate-800 w-72">
            {/* Brand Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-white text-lg">MyPOS SaaS</span>
                <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded capitalize">
                    {userRole}
                </span>
            </div>

            {/* Navigation Body */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {filteredNav.map((group, groupIdx) => (
                    <div key={groupIdx}>
                        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            {group.group}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item, itemIdx) => {
                                const isActive = route().current(
                                    item.routeName,
                                );
                                return (
                                    <Link
                                        key={itemIdx}
                                        href={route(item.routeName)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? "bg-indigo-600 text-white"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span>{item.title}</span>
                                        </div>
                                        {item.badge && (
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
        </aside>
    );
}
