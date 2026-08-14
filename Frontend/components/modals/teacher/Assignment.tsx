'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Pagination from '@/components/common/Pagination';
import { Assignment, Submission, extractArrayData } from '@/interfaces/teacher';

interface AssignmentModalProps {
    assignment: Assignment;
    onClose: () => void;
    onOpenGrading: (sub: Submission) => void;
    refreshTrigger: number;
}

export default function AssignmentModal({ assignment, onClose, onOpenGrading, refreshTrigger }: AssignmentModalProps) {
    const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null); // 🎯 Error State Added

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        fetchSubmissions();
    }, [assignment.id, refreshTrigger]);

    const fetchSubmissions = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const res = await api.get(`/teacher/assignments/${assignment.id}/submissions`);
            setSubmissionsList(extractArrayData(res));
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to load submissions for this assignment. Please try again.';
            setErrorMsg(message);
        } finally {
            setIsLoading(false);
        }
    };

    const start = (page - 1) * limit;
    const paginatedSubmissions = submissionsList.slice(start, start + limit);

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/50 shrink-0">
                    <div>
                        <h3 className="text-base font-semibold text-slate-200">Submissions for: {assignment.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">Class: {assignment.className} • Subject: {assignment.subjectName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </div>
                    ) : errorMsg ? (
                        <div className="flex flex-col justify-center items-center py-16">
                            <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-lg flex items-center gap-3 max-w-lg w-full">
                                <svg className="w-6 h-6 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <div>
                                    <h4 className="text-sm font-semibold text-rose-400">Error Loading Data</h4>
                                    <p className="text-xs text-rose-300 mt-1">{errorMsg}</p>
                                </div>
                            </div>
                            <button onClick={fetchSubmissions} className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition cursor-pointer">
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-slate-800">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                    <tr>
                                        <th className="p-4 font-semibold">Student Name</th>
                                        <th className="p-4 font-semibold">Submitted At</th>
                                        <th className="p-4 font-semibold">Status/Marks</th>
                                        <th className="p-4 font-semibold">File</th>
                                        <th className="p-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                    {paginatedSubmissions.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-800/40 transition">
                                            <td className="p-4 font-medium text-slate-200">{s.studentName}</td>
                                            <td className="p-4 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                {s.markAssigned !== null ? (
                                                    <span className="text-emerald-400 font-semibold">{s.markAssigned} / {assignment.marks}</span>
                                                ) : (
                                                    <span className="text-amber-400 text-xs bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">Pending</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {s.filePath ? <a href={s.filePath} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">View File</a> : <span className="text-slate-500">N/A</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => onOpenGrading(s)} className="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 text-xs font-medium rounded-md border border-emerald-800/80 transition cursor-pointer">
                                                    {s.markAssigned !== null ? 'Edit Grade' : 'Grade Task'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && submissionsList.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-500">
                                                    <span className="text-sm">No submissions received yet for this assignment.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {!isLoading && submissionsList.length > 0 && (
                                <Pagination totalItems={submissionsList.length} page={page} limit={limit} onPageChange={setPage} onLimitChange={l => { setLimit(l); setPage(1); }} />
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition cursor-pointer">
                        Close Window
                    </button>
                </div>
            </div>
        </div>
    );
}