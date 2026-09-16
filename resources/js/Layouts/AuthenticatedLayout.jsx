import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Toaster, toast } from '@/Components/ui/toast';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash = {} } = usePage().props;
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    useEffect(() => {
        const message = flash.message ?? flash.success ?? flash.error ?? flash.warning;

        if (!message) {
            return;
        }

        const type = flash.error
            ? 'error'
            : flash.warning
                ? 'warning'
                : 'success';

        toast.add({
            type,
            title:
                type === 'success'
                    ? 'Berhasil'
                    : type === 'error'
                        ? 'Gagal'
                        : 'Informasi',
            description: message,
            bgColor: type === 'success' ? '!bg-green-600 !text-white' : type === 'error' ? '!bg-red-600 !text-white' : '!bg-blue-600 !text-white',
        });
    }, [flash]);

    return (
        <>
            <Toaster />
            <div className="min-h-screen bg-slate-100 text-slate-900">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-50 md:flex">
                    <div className="flex h-16 items-center border-b border-slate-800 px-6">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo className="h-9 w-auto fill-current text-white" />
                            <span className="text-lg font-semibold tracking-tight">
                                POS Admin
                            </span>
                        </Link>
                    </div>

                    <Sidebar />
                </aside>

                <main className="flex-1">
                    <div className="border-b border-slate-200 bg-white">
                        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState,
                                        )
                                    }
                                    className="inline-flex items-center rounded-md border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none md:hidden"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.8"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>

                                <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                    System Online
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <div className="hidden text-right sm:block cursor-pointer">
                                            <div className="text-sm font-medium text-slate-900">
                                                {user.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {user.email}
                                            </div>
                                        </div>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={"#"}>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>

                    {showingNavigationDropdown && (
                        <div className="border-b border-slate-200 bg-slate-950 text-slate-50 md:hidden">
                            <div className="space-y-1 p-4">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() =>
                                            setShowingNavigationDropdown(false)
                                        }
                                        className={[
                                            "block rounded-lg px-3 py-2 text-sm font-medium",
                                            item.active
                                                ? "bg-slate-800 text-white"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white",
                                        ].join(" ")}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {header && (
                        <header className="border-b border-slate-200 bg-white">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}

                    <div className="mx-auto max-w-7xl p-4 sm:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
        </>
    );
}
