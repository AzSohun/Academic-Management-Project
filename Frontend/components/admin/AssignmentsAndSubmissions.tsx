import { useState } from 'react';
import Pagination from '@/components/common/Pagination';
import { Assignment, Submission } from '@/interfaces/admin';

interface AssignmentsAndSubmissionsProps {
    assignments: Assignment[];
    submissions: Submission[];
}

export default function AssignmentsAndSubmissions({ assignments, submissions }: AssignmentsAndSubmissionsProps) {
    const [assignPage, setAssignPage] = useState(1);
    const [assignLimit, setAssignLimit] = useState(10);
    const [subPage, setSubPage] = useState(1);
    const [subLimit, setSubLimit] = useState(10);

    const paginatedAssignments = assignments.slice((assignPage - 1) * assignLimit, assignPage * assignLimit);
    const paginatedSubmissions = submissions.slice((subPage - 1) * subLimit, subPage * subLimit);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
                <div className="p-5 pb-0"><h3 className="text-sm font-semibold text-slate-200">All System Assignments</h3></div>
                <div className="overflow-x-auto border-t border-slate-800">
                    <table className="w-full text-left text-[13px] text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr><th className="p-3 pl-5">Title</th><th className="p-3">Class</th><th className="p-3">Subject</th><th className="p-3">Teacher</th><th className="p-3">Due Date</th><th className="p-3 pr-5">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedAssignments.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-3 pl-5 font-medium text-slate-200">{a.title}</td><td className="p-3 text-slate-400">{a.className || 'N/A'}</td><td className="p-3 text-slate-400">{a.subjectName || 'N/A'}</td><td className="p-3 text-slate-400">{a.teacherName || 'N/A'}</td><td className="p-3 text-slate-400">{a.dueDate}</td>
                                    <td className="p-3 pr-5"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${a.isDraft ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{a.isDraft ? 'Draft' : 'Published'}</span></td>
                                </tr>
                            ))}
                            {assignments.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No assignments found.</td></tr>}
                        </tbody>
                    </table>
                    <Pagination totalItems={assignments.length} page={assignPage} limit={assignLimit} onPageChange={setAssignPage} onLimitChange={(l) => { setAssignLimit(l); setAssignPage(1); }} />
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
                <div className="p-5 pb-0"><h3 className="text-sm font-semibold text-slate-200">System Submissions Monitor</h3></div>
                <div className="overflow-x-auto border-t border-slate-800">
                    <table className="w-full text-left text-[13px] text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr><th className="p-3 pl-5">Student</th><th className="p-3">Assignment</th><th className="p-3">Submitted At</th><th className="p-3">Marks</th><th className="p-3">Status</th><th className="p-3 pr-5">File Link</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedSubmissions.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-3 pl-5 font-medium text-slate-200">{s.studentName}</td><td className="p-3 text-slate-400">{s.assignmentTitle}</td><td className="p-3 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td><td className="p-3 text-slate-300">{s.markAssigned ?? 'Not Graded'}</td>
                                    <td className="p-3"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300">{s.status}</span></td>
                                    <td className="p-3 pr-5">{s.filePath ? <a href={s.filePath} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">View File</a> : 'N/A'}</td>
                                </tr>
                            ))}
                            {submissions.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No submissions found.</td></tr>}
                        </tbody>
                    </table>
                    <Pagination totalItems={submissions.length} page={subPage} limit={subLimit} onPageChange={setSubPage} onLimitChange={(l) => { setSubLimit(l); setSubPage(1); }} />
                </div>
            </div>
        </div>
    );
}