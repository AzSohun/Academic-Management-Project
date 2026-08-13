import React, { useState } from 'react';
import Pagination from '@/components/common/Pagination';
import EditTeacher from '@/components/modals/Admin/EditTeacher';
import { TeacherDetailed, ClassOption, SubjectOption } from '@/interfaces/admin';

interface TeacherManagementProps {
    detailedTeachers: TeacherDetailed[];
    classList: ClassOption[];
    subjectList: SubjectOption[];
    fetchDashboardData: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function TeacherManagement({ detailedTeachers, classList, subjectList, fetchDashboardData, showStatus }: TeacherManagementProps) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [editingTeacher, setEditingTeacher] = useState<TeacherDetailed | null>(null);

    const start = (page - 1) * limit;
    const paginatedTeachers = detailedTeachers.slice(start, start + limit);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Teachers Directory & Allocations</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-[13px] text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr><th className="p-3">Name</th><th className="p-3">Code</th><th className="p-3">Specialization</th><th className="p-3">Assigned Classes</th><th className="p-3">Assigned Subjects</th><th className="p-3 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedTeachers.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-3 font-medium text-slate-200">{t.firstName} {t.lastName}</td>
                                    <td className="p-3 font-mono text-emerald-400">{t.teacherCode || 'N/A'}</td>
                                    <td className="p-3 text-slate-300">{t.specialization || 'General'}</td>
                                    <td className="p-3 text-emerald-300/90">{t.assignedClasses?.length > 0 ? t.assignedClasses.join(', ') : 'None'}</td>
                                    <td className="p-3 text-violet-300/90">{t.assignedSubjects?.length > 0 ? t.assignedSubjects.join(', ') : 'None'}</td>
                                    <td className="p-3 text-right"><button onClick={() => setEditingTeacher(t)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 cursor-pointer">Edit Info</button></td>
                                </tr>
                            ))}
                            {detailedTeachers.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No teachers found.</td></tr>}
                        </tbody>
                    </table>
                    <Pagination totalItems={detailedTeachers.length} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
                </div>
            </div>
            {editingTeacher && <EditTeacher teacher={editingTeacher} classList={classList} subjectList={subjectList} onClose={() => setEditingTeacher(null)} onSuccess={() => { setEditingTeacher(null); fetchDashboardData(); }} showStatus={showStatus} />}
        </div>
    );
}