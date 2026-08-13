import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';
import Pagination from '@/components/common/Pagination';
import { User, QueryResultDto, StudentOption, TeacherOption, ClassOption, SubjectOption, getRoleNumeric, getGenderName } from '@/interfaces/admin';

interface AcademicManagementProps {
    currentUser: any;
    studentsList: StudentOption[];
    teachersList: TeacherOption[];
    classList: ClassOption[];
    subjectList: SubjectOption[];
    fetchDashboardData: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function AcademicManagement({ currentUser, studentsList, teachersList, classList, subjectList, fetchDashboardData, showStatus }: AcademicManagementProps) {
    const [usersResult, setUsersResult] = useState<QueryResultDto<User>>({
        items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false,
    });
    const [userSearch, setUserSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStudentClassId, setSelectedStudentClassId] = useState('');
    const [unifiedMode, setUnifiedMode] = useState<'assign' | 'remove'>('assign');
    const [unifiedTeacherId, setUnifiedTeacherId] = useState('');
    const [unifiedClassId, setUnifiedClassId] = useState('');
    const [unifiedSubjectId, setUnifiedSubjectId] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => { fetchPaginatedUsers(); }, 300);
        return () => clearTimeout(timer);
    }, [userSearch, roleFilter, pageNumber, pageSize]);

    const fetchPaginatedUsers = async () => {
        try {
            const params: Record<string, any> = { pageNumber, pageSize };
            if (userSearch.trim()) params.search = userSearch.trim();
            if (roleFilter !== 'all') params.role = Number(roleFilter);
            const res = await api.get('/admin/users', { params });
            const data = res.data;
            setUsersResult({
                items: data.items || data.$values?.items || [], totalCount: data.totalCount ?? 0,
                pageNumber: data.pageNumber ?? 1, pageSize: data.pageSize ?? 10, totalPages: data.totalPages ?? 0,
                hasPreviousPage: data.hasPreviousPage ?? false, hasNextPage: data.hasNextPage ?? false,
            });
        } catch { showStatus('error', 'Failed to load users'); }
    };

    const handleAssignStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !selectedStudentClassId) return showStatus('error', 'Select both student and class.');
        try {
            await api.post(`/admin/assign-student-to-class?studentId=${selectedStudentId}&classId=${selectedStudentClassId}`);
            showStatus('success', 'Student successfully assigned to class!');
            setSelectedStudentId(''); setSelectedStudentClassId('');
            fetchDashboardData();
        } catch { showStatus('error', 'Failed to assign student.'); }
    };

    const handleUnifiedTeacherAllocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unifiedTeacherId || !unifiedClassId || !unifiedSubjectId) return showStatus('error', 'Please select Teacher, Class, and Subject.');
        try {
            const endpoint = unifiedMode === 'assign' ? '/admin/assign-teacher-allocation' : '/admin/remove-teacher-allocation';
            await api.post(endpoint, { teacherId: unifiedTeacherId, classId: unifiedClassId, subjectId: unifiedSubjectId });
            showStatus('success', `Allocation ${unifiedMode === 'assign' ? 'assigned' : 'removed'} successfully!`);
            setUnifiedTeacherId(''); setUnifiedClassId(''); setUnifiedSubjectId('');
            fetchDashboardData();
        } catch (err: any) { showStatus('error', err.response?.data?.message || `Failed to ${unifiedMode} allocation.`); }
    };

    const handleRoleChange = async (userId: string, newRoleValue: number) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRoleValue });
            showStatus('success', 'User role updated successfully!');
            fetchPaginatedUsers();
        } catch { showStatus('error', 'Failed to update user role.'); }
    };

    const handleDeleteUser = async (userItem: User) => {
        const currentUserId = (currentUser as any)?.id || (currentUser as any)?.userId;
        if (userItem.email === currentUser?.email || (currentUserId && userItem.id === currentUserId)) {
            return Swal.fire({ title: 'Action Denied!', text: 'You cannot delete your own account.', icon: 'error', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#e11d48' });
        }
        const result = await Swal.fire({ title: 'Are you sure?', text: `Delete user "${userItem.firstName}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#e11d48', cancelButtonColor: '#334155' });
        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/users/${userItem.id}`);
                Swal.fire({ title: 'Deleted!', icon: 'success', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#4f46e5' });
                fetchPaginatedUsers();
            } catch { showStatus('error', 'Could not delete user.'); }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="text-sm font-semibold text-slate-200">Assign Student to Class</h3>
                    <form onSubmit={handleAssignStudent} className="space-y-3">
                        <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required>
                            <option value="">Select Student...</option>
                            {studentsList.map((st) => <option key={st.id} value={st.id}>{st.fullName}</option>)}
                        </select>
                        <select value={selectedStudentClassId} onChange={(e) => setSelectedStudentClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required>
                            <option value="">Select Target Class...</option>
                            {classList.map((c) => <option key={c.id} value={c.id}>{c.className} ({c.roomNumber})</option>)}
                        </select>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer">Assign Student</button>
                    </form>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-semibold text-slate-200">Assign Teacher Allocation</h3>
                        <div className="flex bg-slate-950 rounded p-0.5 border border-slate-700">
                            <button type="button" onClick={() => setUnifiedMode('assign')} className={`px-3 py-1 text-xs font-medium rounded-sm transition cursor-pointer ${unifiedMode === 'assign' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Assign</button>
                            <button type="button" onClick={() => setUnifiedMode('remove')} className={`px-3 py-1 text-xs font-medium rounded-sm transition cursor-pointer ${unifiedMode === 'remove' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}>Remove</button>
                        </div>
                    </div>
                    <form onSubmit={handleUnifiedTeacherAllocation} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select value={unifiedTeacherId} onChange={(e) => setUnifiedTeacherId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required>
                            <option value="">Select Teacher...</option>
                            {teachersList.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                        </select>
                        <select value={unifiedClassId} onChange={(e) => setUnifiedClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required>
                            <option value="">Select Class...</option>
                            {classList.map((c) => <option key={c.id} value={c.id}>{c.className}</option>)}
                        </select>
                        <select value={unifiedSubjectId} onChange={(e) => setUnifiedSubjectId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required>
                            <option value="">Select Subject...</option>
                            {subjectList.map((s) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                        </select>
                        <button type="submit" className={`md:col-span-3 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer ${unifiedMode === 'assign' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                            {unifiedMode === 'assign' ? 'Confirm Allocation' : 'Remove Allocation'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setPageNumber(1); }} className="w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                    <div className="flex gap-1">
                        {[{ label: 'All', value: 'all' }, { label: 'Admin', value: '0' }, { label: 'Teacher', value: '1' }, { label: 'Student', value: '2' }].map((r) => (
                            <button key={r.value} onClick={() => { setRoleFilter(r.value); setPageNumber(1); }} className={`px-4 py-1.5 rounded-md text-sm font-medium border transition cursor-pointer ${roleFilter === r.value ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'}`}>
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-[13px] text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Gender</th><th className="p-3">Role</th><th className="p-3 text-right">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {usersResult.items.map((u) => {
                                const isSelf = u.email === currentUser?.email;
                                return (
                                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-3 font-medium text-slate-200">{u.firstName} {u.lastName}</td><td className="p-3 text-slate-400">{u.email}</td><td className="p-3 text-slate-400">{getGenderName(u.gender)}</td>
                                        <td className="p-3">
                                            <select value={getRoleNumeric(u.role)} onChange={(e) => handleRoleChange(u.id, Number(e.target.value))} disabled={isSelf} className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-60">
                                                <option value={0}>Admin</option><option value={1}>Teacher</option><option value={2}>Student</option>
                                            </select>
                                        </td>
                                        <td className="p-3 text-right">
                                            {isSelf ? <span className="px-3 py-1.5 text-xs text-slate-500 bg-slate-950 border border-slate-800 rounded italic">You</span> : <button onClick={() => handleDeleteUser(u)} className="px-3 py-1.5 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-medium rounded border border-rose-800/80 cursor-pointer">Delete</button>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <Pagination totalItems={usersResult.totalCount} page={pageNumber} limit={pageSize} onPageChange={(p) => setPageNumber(p)} onLimitChange={(l) => { setPageSize(l); setPageNumber(1); }} />
                </div>
            </div>
        </div>
    );
}