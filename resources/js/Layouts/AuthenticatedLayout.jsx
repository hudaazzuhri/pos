import Dropdown from '@/Components/Dropdown';
import { Toaster, toast } from '@/Components/ui/toast';
import { usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash = {} } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
                <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} hidden shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-50 transition-[width] duration-200 md:flex`}>
                    <Sidebar collapsed={sidebarCollapsed} />
                </aside>

                {sidebarOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <button
                            type="button"
                            aria-label="Tutup menu navigasi"
                            className="absolute inset-0 bg-slate-950/50"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <aside className="relative z-10 h-full w-72 shadow-2xl">
                            <Sidebar onNavigate={() => setSidebarOpen(false)} />
                        </aside>
                    </div>
                )}

                <main className="flex-1">
                    <div className="border-b border-slate-200 bg-white">
                        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen((open) => !open)}
                                    aria-label={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
                                    className="inline-flex items-center rounded-md border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none md:hidden"
                                >
                                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
                                    aria-label={sidebarCollapsed ? 'Tampilkan sidebar' : 'Sembunyikan sidebar'}
                                    className="hidden rounded-md border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 md:inline-flex"
                                >
                                    {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
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
