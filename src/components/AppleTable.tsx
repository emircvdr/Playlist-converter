"use client";

import React from "react";
import { Spinner } from "@heroui/react";
import {
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/table";

const columns = [
    { name: "Apple Playlist", uid: "name" },
];

export type AppleTableItem = {
    name: string;
    images: { url: string }[];
};

export default function AppleTable({
    data = [],
    isLoading,
}: {
    data: AppleTableItem[] | undefined;
    isLoading: boolean;
}) {
    const [page, setPage] = React.useState(1);
    const rowsPerPage = 5;

    const pages = Math.ceil((data?.length || 0) / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return data?.slice(start, end) || [];
    }, [page, data]);

    const renderCell = React.useCallback(
        (item: AppleTableItem, columnKey: React.Key) => {
            switch (columnKey) {
                case "name":
                    return (
                        <div className="flex items-center gap-3 py-1">
                            <div className="relative">
                                <img
                                    src={item.images[0]?.url}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-lg object-cover shadow-lg ring-2 ring-white/10 hover:ring-white/30 transition-all duration-300 hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">
                                    {item.name}
                                </span>
                            </div>
                        </div>
                    );
                default:
                    return "—";
            }
        },
        [],
    );

    return (
        <div className="w-1/2 h-1/2 min-w-[300px] min-h-[300px]">
            <Table
                aria-label="Apple playlists table"
                classNames={{
                    wrapper: "bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-0",
                    th: "bg-white/5 backdrop-blur-sm text-white/80 font-semibold text-xs uppercase tracking-wider first:rounded-tl-2xl last:rounded-tr-2xl border-b border-white/10 py-3",
                    td: "text-white/90 border-b border-white/5 group-hover:bg-white/5 transition-colors duration-200 py-2",
                    tr: "hover:bg-white/5 transition-all duration-200 cursor-pointer",
                }}
                removeWrapper={false}
                bottomContent={
                    pages > 1 ? (
                        <div className="flex w-full justify-center py-4 px-2">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 text-sm font-medium transition-all duration-200 border border-white/10"
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${page === p
                                                ? "bg-purple-500/30 text-white border border-purple-400/50"
                                                : "bg-white/5 hover:bg-white/10 text-white/60 border border-white/10"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === pages}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/80 text-sm font-medium transition-all duration-200 border border-white/10"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    ) : null
                }
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} className="">
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    items={items}
                    isLoading={isLoading}
                    loadingContent={
                        <div className="flex items-center justify-center">
                            <Spinner
                                size="lg"
                                label="Loading your Apple playlists..."
                                classNames={{
                                    label: "text-white/70 font-medium"
                                }}
                            />
                        </div>
                    }
                    emptyContent={
                        <div className="flex flex-col items-center justify-center py-20 text-white/50">
                            <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <p className="text-lg font-medium">No playlists found</p>
                            <p className="text-sm mt-1">Connect your account to see your playlists</p>
                        </div>
                    }
                >
                    {(item) => (
                        <TableRow
                            key={item.name}
                            className="group"
                        >
                            {(columnKey) => (
                                <TableCell className="">
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}