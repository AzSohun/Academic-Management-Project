import React, { useState } from 'react';
import Pagination from '@/components/common/Pagination';
import EditStudent from '@/components/modals/Admin/EditStudent';
import { StudentDetailed, ClassOption } from '@/interfaces/admin';

interface StudentManagementProps {
    detailedStudents: StudentDetailed[];
    classList: ClassOption[];
    fetchDashboardData: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function StudentManagement({ detailedStudents, classList, fetchDashboardData, showStatus }: StudentManagementProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [editingStudent, setEditingStudent] = useState<StudentDetailed | null>(null);

    const start = (page - 1) * limit;
    const paginatedStudents = detailedStudents.slice(start, start + limit);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Students Directory & Enrollments</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-[13px] text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr><th className="p-3">Name</th><th className="p-3">Roll No</th><th className="p-3">Group</th><th className="p-3">Section</th><th className="p-3">Class</th><th className="p-3 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedStudents.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-3 font-medium text-slate-200">{s.firstName} {s.lastName}</td>
                                    <td className="p-3 font-mono text-indigo-400">{s.rollNo || 'N/A'}</td>
                                    <td className="p-3 text-slate-400">{s.group || 'N/A'}</td>
                                    <td className="p-3 text-slate-400">{s.section || 'N/A'}</td>
                                    <td className="p-3 font-medium text-emerald-400">{s.className || <span className="text-amber-500/70 font-normal">Unassigned</span>}</td>
                                    <td className="p-3 text-right"><button onClick={() => setEditingStudent(s)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 cursor-pointer">Edit Info</button></td>
                                </tr>
                            ))}
                            {detailedStudents.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No students found.</td></tr>}
                        </tbody>
                    </table>
                    <Pagination totalItems={detailedStudents.length} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
                </div>
            </div>
            {editingStudent && <EditStudent student={editingStudent} classList={classList} onClose={() => setEditingStudent(null)} onSuccess={() => { setEditingStudent(null); fetchDashboardData(); }} showStatus={showStatus} />}
        </div>
    );
}