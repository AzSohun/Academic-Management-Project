import React from 'react';

interface PaginationProps {
    totalItems: number;
    page: number;
    limit: number;
    onPageChange: (p: number) => void;
    onLimitChange: (l: number) => void;
}

export default function Pagination({ totalItems, page, limit, onPageChange, onLimitChange }: PaginationProps) {
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-950 border-t border-slate-800 text-sm text-slate-400">
            <div>
                {totalItems > 0 ? (
                    <span>Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of <span className="text-slate-200 font-semibold">{totalItems}</span> entries</span>
                ) : <span>Showing 0 entries</span>}
            </div>
            <div className="flex items-center gap-3">
                <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer">
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={15}>15 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                </select>
                <div className="flex items-center gap-1">
                    <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">Prev</button>
                    <span className="px-3 font-medium text-slate-300">{page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">Next</button>
                </div>
            </div>
        </div>
    );
}