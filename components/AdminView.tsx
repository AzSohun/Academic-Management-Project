'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Swal from 'sweetalert2';

// --- Types ---
interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: number | string;
    gender?: number | string;
    allocatedClass?: string;
    teacherClasses?: string[];
    teacherSubjects?: string[];
}

interface QueryResultDto<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

interface StudentOption {
    id: string;
    fullName: string;
    email: string;
}

interface TeacherOption {
    id: string;
    fullName: string;
    specialization: string;
}

interface ClassOption {
    id: string;
    className: string;
    roomNumber: string;
}

interface SubjectOption {
    id: string;
    subjectName: string;
    subjectCode: string;
}

interface Assignment {
    id: string;
    title: string;
    description: string;
    marks: number;
    dueDate: string;
    isDraft: boolean;
    subjectName: string;
    className: string;
    teacherName: string;
}

interface Submission {
    id: string;
    filePath: string;
    submissionDate: string;
    markAssigned: number | null;
    teacherFeedback: string;
    status: string;
    studentName: string;
    assignmentTitle: string;
}

interface TeacherDetailed {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    teacherCode: string;
    specialization: string;
    qualification: string;
    phoneNumber: string;
    assignedClasses: string[];
    assignedSubjects: string[];
}

interface StudentDetailed {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    rollNo: string;
    group: string;
    section: string;
    className: string;
    parentContact: string;
}

const getRoleNumeric = (role: number | string): number => {
    if (typeof role === 'number') return role;
    if (role === 'Admin') return 0;
    if (role === 'Teacher') return 1;
    if (role === 'Student') return 2;
    return isNaN(Number(role)) ? 2 : Number(role);
};

const getGenderName = (gender?: number | string) => {
    if (gender === undefined || gender === null) return 'N/A';
    if (typeof gender === 'string' && isNaN(Number(gender))) return gender;
    const genderMap: Record<number, string> = { 0: 'Male', 1: 'Female' };
    return genderMap[Number(gender)] ?? 'N/A';
};

const extractArrayData = (res: any) => {
    if (!res) return [];
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
};

// 🟢 NEW: Reusable Pagination Component
const Pagination = ({ totalItems, page, limit, onPageChange, onLimitChange }: { totalItems: number, page: number, limit: number, onPageChange: (p: number) => void, onLimitChange: (l: number) => void }) => {
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
};

export default function AdminView() {
    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'teachers' | 'students' | 'classes' | 'assignments'>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [usersResult, setUsersResult] = useState<QueryResultDto<User>>({
        items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false,
    });

    const [userSearch, setUserSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [studentsList, setStudentsList] = useState<StudentOption[]>([]);
    const [teachersList, setTeachersList] = useState<TeacherOption[]>([]);
    const [classList, setClassList] = useState<ClassOption[]>([]);
    const [subjectList, setSubjectList] = useState<SubjectOption[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const [detailedTeachers, setDetailedTeachers] = useState<TeacherDetailed[]>([]);
    const [detailedStudents, setDetailedStudents] = useState<StudentDetailed[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form States
    const [className, setClassName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [editingClass, setEditingClass] = useState<ClassOption | null>(null);
    const [editClassName, setEditClassName] = useState('');
    const [editRoomNumber, setEditRoomNumber] = useState('');

    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [subjectDescription, setSubjectDescription] = useState('');
    const [editingSubject, setEditingSubject] = useState<SubjectOption | null>(null);
    const [editSubjectName, setEditSubjectName] = useState('');
    const [editSubjectCode, setEditSubjectCode] = useState('');
    const [editSubjectDescription, setEditSubjectDescription] = useState('');

    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStudentClassId, setSelectedStudentClassId] = useState('');

    const [unifiedMode, setUnifiedMode] = useState<'assign' | 'remove'>('assign');
    const [unifiedTeacherId, setUnifiedTeacherId] = useState('');
    const [unifiedClassId, setUnifiedClassId] = useState('');
    const [unifiedSubjectId, setUnifiedSubjectId] = useState('');

    const [classSubjectMode, setClassSubjectMode] = useState<'assign' | 'remove'>('assign');
    const [assignClassId, setAssignClassId] = useState('');
    const [assignSubjectIdToClass, setAssignSubjectIdToClass] = useState('');

    // --- Edit Teacher States ---
    const [editingTeacher, setEditingTeacher] = useState<TeacherDetailed | null>(null);
    const [editTeacherCodeNumber, setEditTeacherCodeNumber] = useState('');
    const [editTeacherSpec, setEditTeacherSpec] = useState('');
    const [editTeacherClassIds, setEditTeacherClassIds] = useState<string[]>([]);
    const [editTeacherSubjectIds, setEditTeacherSubjectIds] = useState<string[]>([]);
    const [teacherFormError, setTeacherFormError] = useState('');

    // --- Edit Student States ---
    const [editingStudent, setEditingStudent] = useState<StudentDetailed | null>(null);
    const [editStudentRoll, setEditStudentRoll] = useState('');
    const [editStudentGroup, setEditStudentGroup] = useState('');
    const [editStudentSection, setEditStudentSection] = useState('');
    const [editStudentClassId, setEditStudentClassId] = useState('');
    const [studentFormError, setStudentFormError] = useState('');

    // 🟢 NEW: Pagination States for Client-Side Tables
    const [pageState, setPageState] = useState({
        teachers: { page: 1, limit: 10 },
        students: { page: 1, limit: 10 },
        classes: { page: 1, limit: 5 },
        subjects: { page: 1, limit: 5 },
        assignments: { page: 1, limit: 10 },
        submissions: { page: 1, limit: 10 }
    });

    const handlePageChange = (key: keyof typeof pageState, page: number) => {
        setPageState(prev => ({ ...prev, [key]: { ...prev[key], page } }));
    };

    const handleLimitChange = (key: keyof typeof pageState, limit: number) => {
        setPageState(prev => ({ ...prev, [key]: { page: 1, limit } }));
    };

    const paginateData = (data: any[], key: keyof typeof pageState) => {
        const { page, limit } = pageState[key];
        const start = (page - 1) * limit;
        return data.slice(start, start + limit);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPaginatedUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearch, roleFilter, pageNumber, pageSize]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [
                studentsRes, teachersRes, classesRes, subjectsRes, assignmentsRes, submissionsRes,
                detailedTeachersRes, detailedStudentsRes
            ] = await Promise.allSettled([
                api.get('/admin/students'),
                api.get('/admin/teachers'),
                api.get('/admin/classes'),
                api.get('/admin/subjects'),
                api.get('/admin/assignments'),
                api.get('/admin/submissions'),
                api.get('/admin/teachers-detailed'),
                api.get('/admin/students-detailed')
            ]);

            if (studentsRes.status === 'fulfilled') setStudentsList(extractArrayData(studentsRes.value));
            if (teachersRes.status === 'fulfilled') setTeachersList(extractArrayData(teachersRes.value));
            if (classesRes.status === 'fulfilled') setClassList(extractArrayData(classesRes.value));
            if (subjectsRes.status === 'fulfilled') setSubjectList(extractArrayData(subjectsRes.value));
            if (assignmentsRes.status === 'fulfilled') setAssignments(extractArrayData(assignmentsRes.value));
            if (submissionsRes.status === 'fulfilled') setSubmissions(extractArrayData(submissionsRes.value));
            if (detailedTeachersRes.status === 'fulfilled') setDetailedTeachers(extractArrayData(detailedTeachersRes.value));
            if (detailedStudentsRes.status === 'fulfilled') setDetailedStudents(extractArrayData(detailedStudentsRes.value));

            await fetchPaginatedUsers();
        } catch {
            showStatus('error', 'Failed to load system data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPaginatedUsers = async () => {
        setLoadingUsers(true);
        try {
            const params: Record<string, any> = { pageNumber, pageSize };
            if (userSearch.trim()) params.search = userSearch.trim();
            if (roleFilter !== 'all') params.role = Number(roleFilter);

            const res = await api.get('/admin/users', { params });
            const data = res.data;

            setUsersResult({
                items: data.items || data.$values?.items || [],
                totalCount: data.totalCount ?? 0,
                pageNumber: data.pageNumber ?? 1,
                pageSize: data.pageSize ?? 10,
                totalPages: data.totalPages ?? 0,
                hasPreviousPage: data.hasPreviousPage ?? false,
                hasNextPage: data.hasNextPage ?? false,
            });
        } catch {
            showStatus('error', 'Failed to load paginated users');
        } finally {
            setLoadingUsers(false);
        }
    };

    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserSearch(e.target.value);
        setPageNumber(1);
    };

    const handleRoleFilterChange = (role: string) => {
        setRoleFilter(role);
        setPageNumber(1);
    };

    const handleOpenEditTeacher = (t: TeacherDetailed) => {
        setTeacherFormError('');
        setEditingTeacher(t);
        let code = t.teacherCode || '';
        if (code.startsWith('TIC-')) code = code.substring(4);
        setEditTeacherCodeNumber(code);
        setEditTeacherSpec(t.specialization || '');

        const currentClassIds = t.assignedClasses.map(name => classList.find(c => c.className === name)?.id).filter(Boolean) as string[];
        setEditTeacherClassIds(currentClassIds);

        const currentSubjectIds = t.assignedSubjects.map(name => subjectList.find(s => s.subjectName === name)?.id).filter(Boolean) as string[];
        setEditTeacherSubjectIds(currentSubjectIds);
    };

    const handleUpdateTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTeacher) return;
        setTeacherFormError('');
        try {
            const finalTeacherCode = editTeacherCodeNumber ? `TIC-${editTeacherCodeNumber}` : '';
            await api.put(`/admin/teachers/${editingTeacher.id}`, {
                teacherCode: finalTeacherCode,
                specialization: editTeacherSpec,
                classIds: editTeacherClassIds,
                subjectIds: editTeacherSubjectIds
            });
            showStatus('success', 'Teacher details updated successfully!');
            setEditingTeacher(null);
            fetchDashboardData();
        } catch (err: any) {
            setTeacherFormError(err.response?.data?.message || 'Failed to update teacher. Please check the code.');
        }
    };

    const handleOpenEditStudent = (s: StudentDetailed) => {
        setStudentFormError('');
        setEditingStudent(s);
        setEditStudentRoll(s.rollNo || '');
        setEditStudentGroup(s.group || '');
        setEditStudentSection(s.section || '');
        const currentClassId = classList.find(c => c.className === s.className)?.id || '';
        setEditStudentClassId(currentClassId);
    };

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent) return;
        setStudentFormError('');
        try {
            await api.put(`/admin/students/${editingStudent.id}`, {
                rollNo: editStudentRoll,
                group: editStudentGroup,
                section: editStudentSection,
                classDetailsId: editStudentClassId || null
            });
            showStatus('success', 'Student details updated successfully!');
            setEditingStudent(null);
            fetchDashboardData();
        } catch (err: any) {
            setStudentFormError(err.response?.data?.message || 'Failed to update student. Check if roll number is duplicate.');
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/classes', { className, roomNumber });
            showStatus('success', `Class "${className}" created successfully!`);
            setClassName(''); setRoomNumber('');
            fetchDashboardData();
        } catch { showStatus('error', 'Failed to create class.'); }
    };

    const handleOpenEditClass = (c: ClassOption) => {
        setEditingClass(c); setEditClassName(c.className); setEditRoomNumber(c.roomNumber);
    };

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClass) return;
        try {
            await api.put(`/admin/classes/${editingClass.id}`, { className: editClassName, roomNumber: editRoomNumber });
            showStatus('success', `Class updated successfully!`);
            setEditingClass(null); fetchDashboardData();
        } catch { showStatus('error', 'Failed to update class.'); }
    };

    const handleDeleteClass = async (classItem: ClassOption) => {
        const result = await Swal.fire({ title: 'Are you sure?', text: `Delete class "${classItem.className}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#e11d48', cancelButtonColor: '#334155' });
        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/classes/${classItem.id}`);
                Swal.fire({ title: 'Deleted!', icon: 'success', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#4f46e5' });
                fetchDashboardData();
            } catch { showStatus('error', 'Could not delete class.'); }
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/subjects', { subjectName, subjectCode, subjectDescription });
            showStatus('success', `Subject created successfully!`);
            setSubjectName(''); setSubjectCode(''); setSubjectDescription('');
            fetchDashboardData();
        } catch { showStatus('error', 'Failed to create subject.'); }
    };

    const handleOpenEditSubject = (s: SubjectOption) => {
        setEditingSubject(s); setEditSubjectName(s.subjectName); setEditSubjectCode(s.subjectCode); setEditSubjectDescription('');
    };

    const handleUpdateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubject) return;
        try {
            await api.put(`/admin/subjects/${editingSubject.id}`, { subjectName: editSubjectName, subjectCode: editSubjectCode, subjectDescription: editSubjectDescription });
            showStatus('success', `Subject updated successfully!`);
            setEditingSubject(null); fetchDashboardData();
        } catch { showStatus('error', 'Failed to update subject.'); }
    };

    const handleDeleteSubject = async (subjectItem: SubjectOption) => {
        const result = await Swal.fire({ title: 'Are you sure?', text: `Delete subject "${subjectItem.subjectName}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#e11d48', cancelButtonColor: '#334155' });
        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/subjects/${subjectItem.id}`);
                Swal.fire({ title: 'Deleted!', icon: 'success', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#4f46e5' });
                fetchDashboardData();
            } catch { showStatus('error', 'Could not delete subject.'); }
        }
    };

    const handleAssignStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !selectedStudentClassId) return showStatus('error', 'Select both student and class.');
        try {
            await api.post(`/admin/assign-student-to-class?studentId=${selectedStudentId}&classId=${selectedStudentClassId}`);
            showStatus('success', 'Student successfully assigned to class!');
            setStudentsList((prev) => prev.filter((s) => s.id !== selectedStudentId));
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
        } catch (err: any) {
            showStatus('error', err.response?.data?.message || `Failed to ${unifiedMode} allocation.`);
        }
    };

    const handleClassSubjectAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignClassId || !assignSubjectIdToClass) return showStatus('error', 'Please select both class and subject.');
        try {
            const endpoint = classSubjectMode === 'assign' ? '/admin/assign-subject-class' : '/admin/remove-subject-class';
            await api.post(`${endpoint}?classId=${assignClassId}&subjectId=${assignSubjectIdToClass}`);
            showStatus('success', `Subject ${classSubjectMode === 'assign' ? 'assigned to' : 'removed from'} class successfully!`);
            setAssignClassId(''); setAssignSubjectIdToClass('');
            fetchDashboardData();
        } catch (err: any) {
            showStatus('error', err.response?.data?.message || `Failed to ${classSubjectMode} subject.`);
        }
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

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { id: 'users', label: 'Users & Roles', count: usersResult.totalCount, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
        { id: 'teachers', label: 'Teachers', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
        { id: 'students', label: 'Students', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg> },
        { id: 'classes', label: 'Classes & Subjects', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { id: 'assignments', label: 'Assignments', count: assignments.length, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    ];

    return (
        <div className="h-full w-full bg-slate-950 text-slate-100 flex font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
            {statusMsg && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border backdrop-blur-xl shadow-lg transition-all ${statusMsg.type === 'success' ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-rose-500/40 text-rose-300'}`}>
                    <span className={`w-2 h-2 rounded-full ${statusMsg.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-sm font-medium">{statusMsg.text}</span>
                </div>
            )}

            <aside className={`${isSidebarOpen ? 'w-60' : 'w-16'} transition-all duration-200 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-full z-20`}>
                <div className="flex flex-col h-full">
                    <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">A</div>
                            {isSidebarOpen && <span className="font-semibold text-sm tracking-wide text-white">Academia Admin</span>}
                        </div>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} /></svg>
                        </button>
                    </div>

                    <nav className="p-2 space-y-1">
                        {navItems.map((item) => {
                            const active = activeTab === item.id;
                            return (
                                <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                                    <span>{item.icon}</span>
                                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                                    {isSidebarOpen && item.count !== undefined && <span className={`ml-auto px-1.5 py-0.5 rounded text-xs ${active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{item.count}</span>}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="h-14 px-6 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <h1 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{activeTab.replace('-', ' ')}</h1>
                    <button onClick={fetchDashboardData} disabled={loading} className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-sm font-medium transition flex items-center gap-2 cursor-pointer">
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </header>

                <main className="flex-1 p-6 space-y-6 w-full overflow-y-auto">
                    {/* TAB 1: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-xs font-medium text-slate-400">Total System Users</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">{usersResult.totalCount}</h3>
                                    <span className="text-[11px] text-slate-500 block mt-2">Admins, Teachers, Students</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-xs font-medium text-slate-400">Active Classes</p>
                                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">{classList.length}</h3>
                                    <span className="text-[11px] text-slate-500 block mt-2">{subjectList.length} Subjects Registered</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-xs font-medium text-slate-400">Assignments</p>
                                    <h3 className="text-2xl font-bold text-amber-400 mt-1">{assignments.length}</h3>
                                    <span className="text-[11px] text-slate-500 block mt-2">Drafts & Published</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-xs font-medium text-slate-400">Submissions</p>
                                    <h3 className="text-2xl font-bold text-purple-400 mt-1">{submissions.length}</h3>
                                    <span className="text-[11px] text-slate-500 block mt-2">Completed Work</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div onClick={() => setActiveTab('users')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition">
                                    <h3 className="font-semibold text-sm text-indigo-300">User Allocations &rarr;</h3>
                                    <p className="text-xs text-slate-400 mt-1">Assign students to classes or link teachers to courses.</p>
                                </div>
                                <div onClick={() => setActiveTab('classes')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition">
                                    <h3 className="font-semibold text-sm text-emerald-300">Classes & Subjects &rarr;</h3>
                                    <p className="text-xs text-slate-400 mt-1">Add new academic sections, room numbers and subject codes.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: USER MANAGEMENT */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-200">Assign Student to Class</h3>
                                    <form onSubmit={handleAssignStudent} className="space-y-3">
                                        <div className="relative">
                                            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required>
                                                <option value="" className="bg-slate-900 text-slate-400">Select Student...</option>
                                                {studentsList.map((st) => <option key={st.id} value={st.id} className="bg-slate-900">{st.fullName}</option>)}
                                            </select>
                                        </div>
                                        <div className="relative">
                                            <select value={selectedStudentClassId} onChange={(e) => setSelectedStudentClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required>
                                                <option value="" className="bg-slate-900 text-slate-400">Select Target Class...</option>
                                                {classList.map((c) => <option key={c.id} value={c.id} className="bg-slate-900">{c.className} ({c.roomNumber})</option>)}
                                            </select>
                                        </div>
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
                                            <option value="" className="bg-slate-900 text-slate-400">Select Teacher...</option>
                                            {teachersList.map((t) => <option key={t.id} value={t.id} className="bg-slate-900">{t.fullName}</option>)}
                                        </select>
                                        <select value={unifiedClassId} onChange={(e) => setUnifiedClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required>
                                            <option value="" className="bg-slate-900 text-slate-400">Select Class...</option>
                                            {classList.map((c) => <option key={c.id} value={c.id} className="bg-slate-900">{c.className}</option>)}
                                        </select>
                                        <select value={unifiedSubjectId} onChange={(e) => setUnifiedSubjectId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required>
                                            <option value="" className="bg-slate-900 text-slate-400">Select Subject...</option>
                                            {subjectList.map((s) => <option key={s.id} value={s.id} className="bg-slate-900">{s.subjectName}</option>)}
                                        </select>
                                        <button type="submit" className={`md:col-span-3 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer ${unifiedMode === 'assign' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                                            {unifiedMode === 'assign' ? 'Confirm Allocation' : 'Remove Allocation'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="relative w-full sm:w-72">
                                        <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={handleSearchChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="flex gap-1">
                                        {[{ label: 'All', value: 'all' }, { label: 'Admin', value: '0' }, { label: 'Teacher', value: '1' }, { label: 'Student', value: '2' }].map((r) => (
                                            <button key={r.value} onClick={() => handleRoleFilterChange(r.value)} className={`px-4 py-1.5 rounded-md text-sm font-medium border transition cursor-pointer ${roleFilter === r.value ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'}`}>
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-[13px] text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Email</th>
                                                <th className="p-3">Gender</th>
                                                <th className="p-3">Role</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {usersResult.items.map((u) => {
                                                const isSelf = u.email === currentUser?.email;
                                                return (
                                                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                                                        <td className="p-3 font-medium text-slate-200">{u.firstName} {u.lastName}</td>
                                                        <td className="p-3 text-slate-400">{u.email}</td>
                                                        <td className="p-3 text-slate-400">{getGenderName(u.gender)}</td>
                                                        <td className="p-3">
                                                            <select value={getRoleNumeric(u.role)} onChange={(e) => handleRoleChange(u.id, Number(e.target.value))} disabled={isSelf} className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                                                                <option value={0} className="bg-slate-900">Admin</option>
                                                                <option value={1} className="bg-slate-900">Teacher</option>
                                                                <option value={2} className="bg-slate-900">Student</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            {isSelf ? (
                                                                <span className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-950 border border-slate-800 rounded italic select-none">You (Current)</span>
                                                            ) : (
                                                                <button onClick={() => handleDeleteUser(u)} className="px-3 py-1.5 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-medium rounded border border-rose-800/80 transition cursor-pointer">Delete</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {/* Backend Paginated Table uses inline logic to retain specific server logic */}
                                    <Pagination
                                        totalItems={usersResult.totalCount}
                                        page={pageNumber}
                                        limit={pageSize}
                                        onPageChange={(p) => setPageNumber(p)}
                                        onLimitChange={(l) => { setPageSize(l); setPageNumber(1); }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🟢 TEACHERS TAB */}
                    {activeTab === 'teachers' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                                <h3 className="text-sm font-semibold text-slate-200">Teachers Directory & Allocations</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-[13px] text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                            <tr>
                                                <th className="p-3 min-w-37.5">Name</th>
                                                <th className="p-3">Teacher Code</th>
                                                <th className="p-3">Specialization</th>
                                                <th className="p-3">Qualification</th>
                                                <th className="p-3 min-w-45">Email</th>
                                                <th className="p-3">Phone</th>
                                                <th className="p-3 min-w-50">Assigned Classes</th>
                                                <th className="p-3 min-w-62.5">Assigned Subjects</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {paginateData(detailedTeachers, 'teachers').map((t) => (
                                                <tr key={t.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 font-medium text-slate-200">{t.firstName} {t.lastName}</td>
                                                    <td className="p-3 font-mono text-emerald-400 font-semibold">{t.teacherCode || 'N/A'}</td>
                                                    <td className="p-3 text-slate-300">{t.specialization || 'General'}</td>
                                                    <td className="p-3 text-slate-400">{t.qualification || 'N/A'}</td>
                                                    <td className="p-3 text-slate-300">{t.email}</td>
                                                    <td className="p-3 text-slate-400">{t.phoneNumber || 'N/A'}</td>
                                                    <td className="p-3 max-w-50 whitespace-normal wrap-break-word leading-relaxed text-emerald-300/90">
                                                        {t.assignedClasses?.length > 0 ? t.assignedClasses.join(', ') : <span className="text-sm text-slate-500">None</span>}
                                                    </td>
                                                    <td className="p-3 max-w-62.5 whitespace-normal wrap-break-word leading-relaxed text-violet-300/90">
                                                        {t.assignedSubjects?.length > 0 ? t.assignedSubjects.join(', ') : <span className="text-sm text-slate-500">None</span>}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button onClick={() => handleOpenEditTeacher(t)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 transition cursor-pointer">
                                                            Edit Info
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {detailedTeachers.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-slate-500">No teachers found.</td></tr>}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        totalItems={detailedTeachers.length}
                                        page={pageState.teachers.page}
                                        limit={pageState.teachers.limit}
                                        onPageChange={(p) => handlePageChange('teachers', p)}
                                        onLimitChange={(l) => handleLimitChange('teachers', l)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🟢 STUDENTS TAB */}
                    {activeTab === 'students' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                                <h3 className="text-sm font-semibold text-slate-200">Students Directory & Enrollments</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-[13px] text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Roll No</th>
                                                <th className="p-3">Group</th>
                                                <th className="p-3">Section</th>
                                                <th className="p-3">Class</th>
                                                <th className="p-3">Email</th>
                                                <th className="p-3">Parent Contact</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {paginateData(detailedStudents, 'students').map((s) => (
                                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 font-medium text-slate-200">{s.firstName} {s.lastName}</td>
                                                    <td className="p-3 font-mono text-indigo-400 font-semibold">{s.rollNo || 'N/A'}</td>
                                                    <td className="p-3 text-slate-400">{s.group || 'N/A'}</td>
                                                    <td className="p-3 text-slate-400">{s.section || 'N/A'}</td>
                                                    <td className="p-3 font-medium text-emerald-400">
                                                        {s.className ? s.className : <span className="text-amber-500/70 font-normal">Unassigned</span>}
                                                    </td>
                                                    <td className="p-3 text-slate-300">{s.email}</td>
                                                    <td className="p-3 text-slate-400">{s.parentContact || 'N/A'}</td>
                                                    <td className="p-3 text-right">
                                                        <button onClick={() => handleOpenEditStudent(s)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 transition cursor-pointer">
                                                            Edit Info
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {detailedStudents.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-slate-500">No students found.</td></tr>}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        totalItems={detailedStudents.length}
                                        page={pageState.students.page}
                                        limit={pageState.students.limit}
                                        onPageChange={(p) => handlePageChange('students', p)}
                                        onLimitChange={(l) => handleLimitChange('students', l)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: CLASSES & SUBJECTS */}
                    {activeTab === 'classes' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-200">Create New Class</h3>
                                    <form onSubmit={handleCreateClass} className="space-y-3">
                                        <div><label className="block text-xs font-medium text-slate-400 mb-1">Class Name</label><input type="text" value={className} onChange={(e) => setClassName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                                        <div><label className="block text-xs font-medium text-slate-400 mb-1">Room Number</label><input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer">Create Class</button>
                                    </form>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-200">Create New Subject</h3>
                                    <form onSubmit={handleCreateSubject} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="block text-xs font-medium text-slate-400 mb-1">Subject Name</label><input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required /></div>
                                            <div><label className="block text-xs font-medium text-slate-400 mb-1">Subject Code</label><input type="text" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required /></div>
                                        </div>
                                        <div><label className="block text-xs font-medium text-slate-400 mb-1">Description</label><input type="text" value={subjectDescription} onChange={(e) => setSubjectDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" /></div>
                                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer">Create Subject</button>
                                    </form>
                                </div>

                                {/* Map Subject & Class Box */}
                                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4 md:col-span-2">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <h3 className="text-sm font-semibold text-slate-200">Map Subject to Class</h3>
                                        <div className="flex bg-slate-950 rounded p-0.5 border border-slate-700">
                                            <button type="button" onClick={() => setClassSubjectMode('assign')} className={`px-3 py-1 text-xs font-medium rounded-sm transition cursor-pointer ${classSubjectMode === 'assign' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Assign</button>
                                            <button type="button" onClick={() => setClassSubjectMode('remove')} className={`px-3 py-1 text-xs font-medium rounded-sm transition cursor-pointer ${classSubjectMode === 'remove' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}>Remove</button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleClassSubjectAction} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <select value={assignClassId} onChange={(e) => setAssignClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none" required>
                                            <option value="" className="bg-slate-900 text-slate-400">Select Target Class...</option>
                                            {classList.map((c) => <option key={c.id} value={c.id} className="bg-slate-900">{c.className} ({c.roomNumber})</option>)}
                                        </select>
                                        <select value={assignSubjectIdToClass} onChange={(e) => setAssignSubjectIdToClass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none" required>
                                            <option value="" className="bg-slate-900 text-slate-400">Select Subject...</option>
                                            {subjectList.map((s) => <option key={s.id} value={s.id} className="bg-slate-900">{s.subjectName} ({s.subjectCode})</option>)}
                                        </select>
                                        <button type="submit" className={`w-full text-white font-medium py-2.5 rounded-lg text-sm transition cursor-pointer ${classSubjectMode === 'assign' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                                            {classSubjectMode === 'assign' ? 'Confirm Mapping' : 'Remove Mapping'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl space-y-4 flex flex-col">
                                    <div className="p-5 pb-0">
                                        <h3 className="text-sm font-semibold text-slate-200">Active Classes ({classList.length})</h3>
                                    </div>
                                    <div className="flex-1 overflow-x-auto border-t border-slate-800">
                                        <table className="w-full text-left text-[13px] text-slate-300">
                                            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                                <tr><th className="p-3 pl-5">Class Details</th><th className="p-3 text-right pr-5">Action</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                                {paginateData(classList, 'classes').map((c) => (
                                                    <tr key={c.id} className="hover:bg-slate-800/30 transition">
                                                        <td className="p-3 pl-5">
                                                            <div className="font-semibold text-sm text-slate-200">{c.className}</div>
                                                            <div className="text-xs text-slate-400 mt-0.5">Room: {c.roomNumber}</div>
                                                        </td>
                                                        <td className="p-3 pr-5 text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <button onClick={() => handleOpenEditClass(c)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 transition cursor-pointer">Edit</button>
                                                                <button onClick={() => handleDeleteClass(c)} className="px-3 py-1.5 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-medium rounded border border-rose-800/80 transition cursor-pointer">Delete</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <Pagination
                                            totalItems={classList.length}
                                            page={pageState.classes.page}
                                            limit={pageState.classes.limit}
                                            onPageChange={(p) => handlePageChange('classes', p)}
                                            onLimitChange={(l) => handleLimitChange('classes', l)}
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl space-y-4 flex flex-col">
                                    <div className="p-5 pb-0">
                                        <h3 className="text-sm font-semibold text-slate-200">Created Subjects ({subjectList.length})</h3>
                                    </div>
                                    <div className="flex-1 overflow-x-auto border-t border-slate-800">
                                        <table className="w-full text-left text-[13px] text-slate-300">
                                            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                                <tr><th className="p-3 pl-5">Subject Details</th><th className="p-3 text-right pr-5">Action</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                                {paginateData(subjectList, 'subjects').map((s) => (
                                                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                                        <td className="p-3 pl-5">
                                                            <div className="font-semibold text-sm text-emerald-300">{s.subjectName}</div>
                                                            <div className="text-xs text-slate-400 mt-0.5">Code: <span className="text-slate-200 font-mono">{s.subjectCode}</span></div>
                                                        </td>
                                                        <td className="p-3 pr-5 text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <button onClick={() => handleOpenEditSubject(s)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 transition cursor-pointer">Edit</button>
                                                                <button onClick={() => handleDeleteSubject(s)} className="px-3 py-1.5 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-medium rounded border border-rose-800/80 transition cursor-pointer">Delete</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <Pagination
                                            totalItems={subjectList.length}
                                            page={pageState.subjects.page}
                                            limit={pageState.subjects.limit}
                                            onPageChange={(p) => handlePageChange('subjects', p)}
                                            onLimitChange={(l) => handleLimitChange('subjects', l)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: ASSIGNMENTS & SUBMISSIONS */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
                                <div className="p-5 pb-0"><h3 className="text-sm font-semibold text-slate-200">All System Assignments</h3></div>
                                <div className="overflow-x-auto border-t border-slate-800">
                                    <table className="w-full text-left text-[13px] text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                            <tr><th className="p-3 pl-5">Title</th><th className="p-3">Class</th><th className="p-3">Subject</th><th className="p-3">Teacher</th><th className="p-3">Due Date</th><th className="p-3 pr-5">Status</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {paginateData(assignments, 'assignments').map((a) => (
                                                <tr key={a.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 pl-5 font-medium text-slate-200">{a.title}</td><td className="p-3 text-slate-400">{a.className || 'N/A'}</td><td className="p-3 text-slate-400">{a.subjectName || 'N/A'}</td><td className="p-3 text-slate-400">{a.teacherName || 'N/A'}</td><td className="p-3 text-slate-400">{a.dueDate}</td>
                                                    <td className="p-3 pr-5"><span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${a.isDraft ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{a.isDraft ? 'Draft' : 'Published'}</span></td>
                                                </tr>
                                            ))}
                                            {assignments.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No assignments found.</td></tr>}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        totalItems={assignments.length}
                                        page={pageState.assignments.page}
                                        limit={pageState.assignments.limit}
                                        onPageChange={(p) => handlePageChange('assignments', p)}
                                        onLimitChange={(l) => handleLimitChange('assignments', l)}
                                    />
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
                                            {paginateData(submissions, 'submissions').map((s) => (
                                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 pl-5 font-medium text-slate-200">{s.studentName}</td><td className="p-3 text-slate-400">{s.assignmentTitle}</td><td className="p-3 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td><td className="p-3 text-slate-300">{s.markAssigned ?? 'Not Graded'}</td>
                                                    <td className="p-3"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300">{s.status}</span></td>
                                                    <td className="p-3 pr-5">{s.filePath ? <a href={s.filePath} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">View File</a> : 'N/A'}</td>
                                                </tr>
                                            ))}
                                            {submissions.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No submissions found.</td></tr>}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        totalItems={submissions.length}
                                        page={pageState.submissions.page}
                                        limit={pageState.submissions.limit}
                                        onPageChange={(p) => handlePageChange('submissions', p)}
                                        onLimitChange={(l) => handleLimitChange('submissions', l)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* --- Modals for Editing Class/Subject --- */}
            {editingClass && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-semibold text-slate-200">Edit Class</h3>
                            <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleUpdateClass} className="space-y-3">
                            <div><label className="block text-xs font-medium text-slate-400 mb-1">Class Name</label><input type="text" value={editClassName} onChange={(e) => setEditClassName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                            <div><label className="block text-xs font-medium text-slate-400 mb-1">Room Number</label><input type="text" value={editRoomNumber} onChange={(e) => setEditRoomNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setEditingClass(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition cursor-pointer">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingSubject && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-sm font-semibold text-slate-200">Edit Subject</h3>
                            <button onClick={() => setEditingSubject(null)} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleUpdateSubject} className="space-y-3">
                            <div><label className="block text-xs font-medium text-slate-400 mb-1">Subject Name</label><input type="text" value={editSubjectName} onChange={(e) => setEditSubjectName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                            <div><label className="block text-xs font-medium text-slate-400 mb-1">Subject Code</label><input type="text" value={editSubjectCode} onChange={(e) => setEditSubjectCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                            <div><label className="block text-xs font-medium text-slate-400 mb-1">Description</label><input type="text" placeholder="Overview..." value={editSubjectDescription} onChange={(e) => setEditSubjectDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" /></div>
                            <div className="flex justify-end gap-2 pt-3">
                                <button type="button" onClick={() => setEditingSubject(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition cursor-pointer">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🟢 Teacher Edit Form Modal */}
            {editingTeacher && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-lg shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Edit Teacher Identity</h3>
                                <p className="text-xs text-slate-400">{editingTeacher.firstName} {editingTeacher.lastName}</p>
                            </div>
                            <button onClick={() => setEditingTeacher(null)} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleUpdateTeacher} className="space-y-4">
                            {teacherFormError && <p className="text-xs text-rose-500 bg-rose-950/40 border border-rose-800 p-2 rounded">{teacherFormError}</p>}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Teacher Code / ID</label>
                                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden focus-within:border-indigo-500">
                                        <span className="px-3 py-2.5 text-sm text-slate-400 bg-slate-900 border-r border-slate-800 font-mono">TIC-</span>
                                        <input type="text" value={editTeacherCodeNumber} onChange={(e) => setEditTeacherCodeNumber(e.target.value)} placeholder="001" className="w-full bg-transparent p-2.5 text-sm text-slate-200 focus:outline-none font-mono" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Specialization</label>
                                    <input type="text" value={editTeacherSpec} onChange={(e) => setEditTeacherSpec(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                                </div>

                                {/* Checkbox List for Classes */}
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Classes</label>
                                    <div className="max-h-32 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1">
                                        {classList.map(c => (
                                            <label key={c.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:bg-slate-900 p-1.5 rounded transition">
                                                <input
                                                    type="checkbox"
                                                    checked={editTeacherClassIds.includes(c.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setEditTeacherClassIds([...editTeacherClassIds, c.id]);
                                                        else setEditTeacherClassIds(editTeacherClassIds.filter(id => id !== c.id));
                                                    }}
                                                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                                                />
                                                {c.className}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Checkbox List for Subjects */}
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Assigned Subjects</label>
                                    <div className="max-h-32 overflow-y-auto bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1">
                                        {subjectList.map(s => (
                                            <label key={s.id} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:bg-slate-900 p-1.5 rounded transition">
                                                <input
                                                    type="checkbox"
                                                    checked={editTeacherSubjectIds.includes(s.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setEditTeacherSubjectIds([...editTeacherSubjectIds, s.id]);
                                                        else setEditTeacherSubjectIds(editTeacherSubjectIds.filter(id => id !== s.id));
                                                    }}
                                                    className="w-4 h-4 accent-indigo-500 cursor-pointer"
                                                />
                                                {s.subjectName}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
                                <button type="button" onClick={() => setEditingTeacher(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition cursor-pointer">Save Details</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🟢 Student Edit Form Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-sm shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Edit Student Identity</h3>
                                <p className="text-xs text-slate-400">{editingStudent.firstName} {editingStudent.lastName}</p>
                            </div>
                            <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleUpdateStudent} className="space-y-4">
                            {studentFormError && <p className="text-xs text-rose-500 bg-rose-950/40 border border-rose-800 p-2 rounded">{studentFormError}</p>}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Roll No</label>
                                <input type="text" value={editStudentRoll} onChange={(e) => setEditStudentRoll(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Class</label>
                                <select value={editStudentClassId} onChange={(e) => setEditStudentClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer">
                                    <option value="">Unassigned</option>
                                    {classList.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Group</label>
                                    <select value={editStudentGroup} onChange={(e) => setEditStudentGroup(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer">
                                        <option value="">Select Group...</option>
                                        <option value="Science">Science</option>
                                        <option value="Commerce">Commerce</option>
                                        <option value="Arts">Arts</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Section</label>
                                    <input type="text" value={editStudentSection} onChange={(e) => setEditStudentSection(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
                                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition cursor-pointer">Save Details</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}