import { Link } from "@inertiajs/react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";

export default function DataTable({
    data = [],
    columns = [],
    topContent = null,
    search = null,
    filters = null,
    bulkAction = null,
    emptyMessage = "Tidak ada data.",
    total = 0,
    from = 0,
    to = 0,
    paginationLinks = [],
}) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const hasHeaderControls = Boolean(search || filters || bulkAction);

    return (
        <Card className="overflow-hidden">
            <CardHeader
                className={
                    hasHeaderControls ? "space-y-4 border-b" : "border-b"
                }
            >
                {hasHeaderControls && (
                    <div className="space-y-4">
                        {(search || filters) && (
                            <div
                                className={`grid gap-x-3 ${search && filters ? "md:grid-cols-2" : ""}`}
                            >
                                {search ? (
                                    <div className="col-span-1">
                                        <form
                                            onSubmit={
                                                search.onSubmit ||
                                                ((event) =>
                                                    event.preventDefault())
                                            }
                                        >
                                            <Input
                                                value={search.value ?? ""}
                                                onChange={search.onChange}
                                                placeholder={
                                                    search.placeholder ||
                                                    "Cari..."
                                                }
                                            />
                                        </form>
                                    </div>
                                ) : (
                                    <div />
                                )}

                                {filters ? <div>{filters}</div> : <div />}
                            </div>
                        )}

                        {bulkAction && bulkAction.selectedIds?.length > 0 && (
                            <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-3">
                                <p className="text-sm text-red-700">
                                    {bulkAction.selectedIds.length}{" "}
                                    {bulkAction.label || "item dipilih"}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={bulkAction.onDelete}
                                        className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                                    >
                                        {bulkAction.deleteLabel ||
                                            "Hapus yang Dipilih"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={bulkAction.onClearSelection}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        {bulkAction.clearLabel || "Batal"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {topContent}
            </CardHeader>

            <CardContent className="!p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`px-4 py-3 font-semibold text-gray-700 ${header.column.columnDef.headerClass || ""}`}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        <tbody className="divide-y divide-gray-200 bg-white">
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-gray-50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-4 py-3 text-gray-700"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-6 text-center text-gray-500"
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            {(total > 0 || paginationLinks.length > 0) && (
                <CardFooter className="flex flex-col gap-3 border-t bg-white pt-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-gray-600">
                        {total > 0
                            ? `Tampil ${from} - ${to} dari ${total} data`
                            : `Tampil ${data.length} data`}
                    </div>

                    {paginationLinks.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {paginationLinks.map((link, index) => {
                                const label = link.label
                                    .replace("Previous", "Sebelumnya")
                                    .replace("Next", "Berikutnya");

                                if (!link.url) {
                                    return (
                                        <span
                                            key={`page-${index}`}
                                            className="cursor-default rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-400"
                                            dangerouslySetInnerHTML={{
                                                __html: label,
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <Link
                                        key={`page-${index}`}
                                        href={link.url}
                                        preserveState
                                        className={[
                                            "rounded-md border px-3 py-1.5 text-sm",
                                            link.active
                                                ? "border-indigo-600 bg-indigo-600 text-white"
                                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
                                        ].join(" ")}
                                        dangerouslySetInnerHTML={{
                                            __html: label,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}
