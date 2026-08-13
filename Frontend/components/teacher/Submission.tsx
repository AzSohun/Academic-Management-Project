import React, { useState, useMemo } from 'react';
import Pagination from '@/components/common/Pagination';
import { Submission as ISubmission } from '@/interfaces/teacher';

interface SubmissionProps {
    submissions: ISubmission[];
    onOpenGrading: (s: ISubmission) => void;
}

export default function SubmissionTab({ submissions, onOpenGrading }: SubmissionProps) {
    const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'graded'>('all');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const filteredSubmissions = useMemo(() => {
        return submissions.filter((s) => {
            const statusStr = s.status ? s.status.toLowerCase() : '';
            if (submissionFilter === 'pending') {
                return s.markAssigned === null || statusStr === 'submitted' || statusStr === '';
            }
            if (submissionFilter === 'graded') {
                return s.markAssigned !== null || statusStr === 'graded';
            }
            return true;
        });
    }, [submissions, submissionFilter]);

    const start = (page - 1) * limit;
    const paginatedSubmissions = filteredSubmissions.slice(start, start + limit);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-sm font-semibold text-slate-200">Student Submissions & Evaluation</h3>
                    <div className="flex gap-2">
                        {(['all', 'pending', 'graded'] as const).map((filter) => (
                            <button key={filter} onClick={() => { setSubmissionFilter(filter); setPage(1); }} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize border transition cursor-pointer ${submissionFilter === filter ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'}`}>{filter}</button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr><th className="p-4">Student</th><th className="p-4">Assignment</th><th className="p-4">Submitted At</th><th className="p-4">Marks</th><th className="p-4">File</th><th className="p-4 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedSubmissions.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-4 font-medium text-slate-200">{s.studentName}</td><td className="p-4 text-slate-400">{s.assignmentTitle}</td><td className="p-4 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td>
                                    <td className="p-4">{s.markAssigned !== null ? <span className="text-emerald-400 font-semibold">{s.markAssigned}</span> : <span className="text-amber-400 text-xs bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">Pending</span>}</td>
                                    <td className="p-4">{s.filePath ? <a href={s.filePath} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">View File</a> : <span className="text-slate-500">N/A</span>}</td>
                                    <td className="p-4 text-right"><button onClick={() => onOpenGrading(s)} className="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 text-xs font-medium rounded-md border border-emerald-800/80 transition cursor-pointer">{s.markAssigned !== null ? 'Edit Grade' : 'Grade Task'}</button></td>
                                </tr>
                            ))}
                            {filteredSubmissions.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500 text-sm">No submissions match your filter criteria.</td></tr>}
                        </tbody>
                    </table>
                    <Pagination totalItems={filteredSubmissions.length} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
                </div>
            </div>
        </div>
    );
}