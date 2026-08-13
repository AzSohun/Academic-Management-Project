import React, { useState } from 'react';
import Pagination from '@/components/common/Pagination';
import { Assignment, Submission } from '@/interfaces/student';

interface ActiveAssignmentsProps {
    assignments: Assignment[];
    submissions: Submission[];
    onOpenSubmitModal: (a: Assignment) => void;
}

export default function ActiveAssignments({ assignments, submissions, onOpenSubmitModal }: ActiveAssignmentsProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const isSubmitted = (assignmentId: string) => submissions.some((s) => s.assignmentId === assignmentId);

    const start = (page - 1) * limit;
    const paginatedAssignments = assignments.slice(start, start + limit);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Class Assignments</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Teacher</th>
                                <th className="p-4">Total Marks</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4 text-right">Status / Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedAssignments.map((a) => {
                                const done = isSubmitted(a.id);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const dueDateObj = new Date(a.dueDate);
                                dueDateObj.setHours(0, 0, 0, 0);
                                const isPastDeadline = today > dueDateObj;

                                return (
                                    <tr key={a.id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-4 font-medium text-slate-200">
                                            <div className="mb-0.5">{a.title}</div>
                                            <p className="text-xs text-slate-500 font-normal line-clamp-1">{a.description}</p>
                                        </td>
                                        <td className="p-4 text-slate-400">{a.subjectName || 'General'}</td>
                                        <td className="p-4 text-slate-400">{a.teacherName || 'Faculty'}</td>
                                        <td className="p-4 text-slate-300 font-semibold">{a.marks}</td>
                                        <td className="p-4 text-slate-400">{a.dueDate}</td>
                                        <td className="p-4 text-right">
                                            {done ? (
                                                <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">Submitted</span>
                                            ) : isPastDeadline ? (
                                                <span className="px-3 py-1.5 rounded-md text-xs font-medium bg-rose-950/60 text-rose-400 border border-rose-800/80">Deadline Passed</span>
                                            ) : (
                                                <button onClick={() => onOpenSubmitModal(a)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-md transition cursor-pointer shadow-md shadow-violet-600/20">Submit Task</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {assignments.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-sm">No active assignments for your class right now.</td></tr>}
                        </tbody>
                    </table>
                    <Pagination totalItems={assignments.length} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
                </div>
            </div>
        </div>
    );
}