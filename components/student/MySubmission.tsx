import React, { useState } from 'react';
import Pagination from '@/components/common/Pagination';
import { Submission, Assignment } from '@/interfaces/student';

interface MySubmissionsProps {
    submissions: Submission[];
    assignments: Assignment[];
    onOpenEditModal: (s: Submission) => void;
}

export default function MySubmissions({ submissions, assignments, onOpenEditModal }: MySubmissionsProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const start = (page - 1) * limit;
    const paginatedSubmissions = submissions.slice(start, start + limit);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">My Uploaded Submissions & Grades</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr>
                                <th className="p-4">Assignment</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Submitted At</th>
                                <th className="p-4">My File</th>
                                <th className="p-4">Grade Assigned</th>
                                <th className="p-4 text-slate-400 italic">Teacher Feedback</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedSubmissions.map((s) => {
                                const relatedAssignment = assignments.find(a => a.id === s.assignmentId);
                                let isPastDeadline = false;
                                if (relatedAssignment) {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const dueDateObj = new Date(relatedAssignment.dueDate);
                                    dueDateObj.setHours(0, 0, 0, 0);
                                    isPastDeadline = today > dueDateObj;
                                }

                                return (
                                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-4 font-medium text-slate-200">{s.assignmentTitle}</td>
                                        <td className="p-4 text-slate-400">{s.subjectName || 'N/A'}</td>
                                        <td className="p-4 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td>
                                        <td className="p-4">{s.filePath ? <a href={s.filePath} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">View File</a> : 'N/A'}</td>
                                        <td className="p-4">{s.markAssigned !== null ? <span className="text-emerald-400 font-bold text-sm">{s.markAssigned}</span> : <span className="text-amber-400 text-xs bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">Pending Review</span>}</td>
                                        <td className="p-4 text-slate-400 italic">{s.teacherFeedback ? `"${s.teacherFeedback}"` : 'No feedback yet'}</td>
                                        <td className="p-4 text-right">
                                            {s.markAssigned === null ? (
                                                isPastDeadline ? (
                                                    <span className="text-xs text-rose-500 italic px-3 py-1.5">Locked</span>
                                                ) : (
                                                    <button onClick={() => onOpenEditModal(s)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition cursor-pointer border border-slate-700">Edit Link</button>
                                                )
                                            ) : (
                                                <span className="text-xs text-slate-500 italic border border-transparent px-3 py-1.5">Graded</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {submissions.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500 text-sm">You haven&apos;t submitted any assignments yet.</td></tr>}
                        </tbody>
                    </table>
                    <Pagination totalItems={submissions.length} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
                </div>
            </div>
        </div>
    );
}