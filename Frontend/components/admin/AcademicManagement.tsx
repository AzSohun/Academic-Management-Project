'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Pagination from '@/components/common/Pagination';
import { User, QueryResultDto, StudentOption, TeacherOption, ClassOption, SubjectOption, getRoleNumeric, getGenderName } from '@/interfaces/admin';

interface AcademicManagementProps {
    currentUser: any;
    studentsList: StudentOption[];
    teachersList: TeacherOption[];
    classList: ClassOption[];
    subjectList: SubjectOption[];
    fetchDashboardData: () => void;
}

export default function AcademicManagement({ currentUser, studentsList, teachersList, classList, subjectList, fetchDashboardData }: AcademicManagementProps) {
    const [usersResult, setUsersResult] = useState<QueryResultDto<User>>({
        items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false,
    });
    const [userSearch, setUserSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Form States
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStudentClassId, setSelectedStudentClassId] = useState('');

    const [unifiedMode, setUnifiedMode] = useState<'assign' | 'remove'>('assign');
    const [unifiedTeacherId, setUnifiedTeacherId] = useState('');
    const [unifiedClassId, setUnifiedClassId] = useState('');
    const [unifiedSubjectId, setUnifiedSubjectId] = useState('');

    // Inline Message States
    const [studentMsg, setStudentMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [teacherMsg, setTeacherMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [tableMsg, setTableMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
        } catch (err: any) {
            console.error("Failed to load users", err);
        }
    };

    const handleAssignStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setStudentMsg(null);

        if (!selectedStudentId || !selectedStudentClassId) {
            return setStudentMsg({ text: 'Please select both student and class.', type: 'error' });
        }

        try {
            await api.post(`/admin/assign-student-to-class?studentId=${selectedStudentId}&classId=${selectedStudentClassId}`);
            setStudentMsg({ text: 'Student successfully assigned to class!', type: 'success' });
            setSelectedStudentId(''); setSelectedStudentClassId('');
            fetchDashboardData();

            setTimeout(() => setStudentMsg(null), 3000);
        } catch (err: any) {
            setStudentMsg({ text: err.response?.data?.message || 'Failed to assign student.', type: 'error' });
        }
    };

    const handleUnifiedTeacherAllocation = async (e: React.FormEvent) => {
        e.preventDefault();
        setTeacherMsg(null);

        if (!unifiedTeacherId || !unifiedClassId || !unifiedSubjectId) {
            return setTeacherMsg({ text: 'Please select Teacher, Class, and Subject.', type: 'error' });
        }

        try {
            const endpoint = unifiedMode === 'assign' ? '/admin/assign-teacher-allocation' : '/admin/remove-teacher-allocation';
            await api.post(endpoint, { teacherId: unifiedTeacherId, classId: unifiedClassId, subjectId: unifiedSubjectId });
            setTeacherMsg({ text: `Allocation ${unifiedMode === 'assign' ? 'assigned' : 'removed'} successfully!`, type: 'success' });
            setUnifiedTeacherId(''); setUnifiedClassId(''); setUnifiedSubjectId('');
            fetchDashboardData();

            setTimeout(() => setTeacherMsg(null), 3000);
        } catch (err: any) {
            setTeacherMsg({ text: err.response?.data?.message || `Failed to ${unifiedMode} allocation.`, type: 'error' });
        }
    };

    const handleRoleChange = async (userId: string, newRoleValue: number) => {
        setTableMsg(null);
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRoleValue });
            setTableMsg({ text: 'User role updated successfully!', type: 'success' });
            fetchPaginatedUsers();
            setTimeout(() => setTableMsg(null), 3000);
        } catch (err: any) {
            setTableMsg({ text: err.response?.data?.message || 'Failed to update user role.', type: 'error' });
        }
    };

    const handleDeleteUser = async (userItem: User) => {
        const currentUserId = (currentUser as any)?.id || (currentUser as any)?.userId;

        if (userItem.email === currentUser?.email || (currentUserId && userItem.id === currentUserId)) {
            setTableMsg({ text: 'You cannot delete your own account.', type: 'error' });
            return;
        }

        const isConfirmed = window.confirm(`Are you sure you want to delete user "${userItem.firstName}"?`);

        if (isConfirmed) {
            try {
                await api.delete(`/admin/users/${userItem.id}`);
                setTableMsg({ text: 'User deleted successfully.', type: 'success' });
                fetchPaginatedUsers();
                setTimeout(() => setTableMsg(null), 3000);
            } catch (err: any) {
                setTableMsg({ text: err.response?.data?.message || 'Could not delete user.', type: 'error' });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assign Student Section */}
                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="text-sm font-semibold text-slate-200">Assign Student to Class</h3>
                    <form onSubmit={handleAssignStudent} className="space-y-3">
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                            style={{ colorScheme: 'dark' }}
                            required
                        >
                            <option value="">Select Student...</option>
                            {studentsList.map((st: any) => <option key={st.id} value={st.id}>{st.firstName} {st.lastName}</option>)}
                        </select>
                        <select
                            value={selectedStudentClassId}
                            onChange={(e) => setSelectedStudentClassId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                            style={{ colorScheme: 'dark' }}
                            required
                        >
                            <option value="">Select Target Class...</option>
                            {classList.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.className} {c.section ? `(${c.section})` : ''} - Rm: {c.roomNumber}
                                </option>
                            ))}
                        </select>

                        {studentMsg && (
                            <div className={`p-2.5 rounded-lg text-xs font-medium border ${studentMsg.type === 'error' ? 'bg-rose-950/40 text-rose-400 border-rose-800/60' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'}`}>
                                ⚠ {studentMsg.text}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer">Assign Student</button>
                    </form>
                </div>

                {/* Assign Teacher Section */}
                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-semibold text-slate-200">Assign Teacher Allocation</h3>
                        <div className="flex bg-slate-950 rounded p-0.5 border border-slate-700">
                            <button type="button" onClick={() => { setUnifiedMode('assign'); setTeacherMsg(null); }} className={`px-3 py-1 text-xs font-medium rounded-sm transition cursor-pointer ${unifiedMode === 'assign' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>Assign</button>
                            <button type="button" onClick={() => { setUnifiedMode('remove'); setTeacherMsg(null); }} className={`px-3 py-1 text-xs font-medium rounded-sm transition cursor-pointer ${unifiedMode === 'remove' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}>Remove</button>
                        </div>
                    </div>
                    <form onSubmit={handleUnifiedTeacherAllocation} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select
                            value={unifiedTeacherId}
                            onChange={(e) => setUnifiedTeacherId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                            style={{ colorScheme: 'dark' }}
                            required
                        >
                            <option value="">Select Teacher...</option>
                            {teachersList.map((t: any) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                        </select>
                        <select
                            value={unifiedClassId}
                            onChange={(e) => setUnifiedClassId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                            style={{ colorScheme: 'dark' }}
                            required
                        >
                            <option value="">Select Class...</option>
                            {classList.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.className} {c.section ? `(${c.section})` : ''}
                                </option>
                            ))}
                        </select>
                        <select
                            value={unifiedSubjectId}
                            onChange={(e) => setUnifiedSubjectId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                            style={{ colorScheme: 'dark' }}
                            required
                        >
                            <option value="">Select Subject...</option>
                            {subjectList.map((s: any) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                        </select>

                        {teacherMsg && (
                            <div className={`md:col-span-3 p-2.5 rounded-lg text-xs font-medium border ${teacherMsg.type === 'error' ? 'bg-rose-950/40 text-rose-400 border-rose-800/60' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'}`}>
                                ⚠ {teacherMsg.text}
                            </div>
                        )}

                        <button type="submit" className={`md:col-span-3 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer ${unifiedMode === 'assign' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                            {unifiedMode === 'assign' ? 'Confirm Allocation' : 'Remove Allocation'}
                        </button>
                    </form>
                </div>
            </div>

            {/* User List Table Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">

                {/* Table Top Actions & Inline Message */}
                <div className="flex flex-col space-y-3">
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

                    {tableMsg && (
                        <div className={`p-2.5 rounded-lg text-xs font-medium border w-full ${tableMsg.type === 'error' ? 'bg-rose-950/40 text-rose-400 border-rose-800/60' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'}`}>
                            {tableMsg.text}
                        </div>
                    )}
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
                                            <select
                                                value={getRoleNumeric(u.role)}
                                                onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                                                disabled={isSelf}
                                                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-60"
                                                style={{ colorScheme: 'dark' }}
                                            >
                                                <option value={0}>Admin</option>
                                                <option value={1}>Teacher</option>
                                                <option value={2}>Student</option>
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