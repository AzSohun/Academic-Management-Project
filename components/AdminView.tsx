'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';

// --- Types ---
interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: number | string;
    gender?: number | string;
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

const getRoleName = (role: number | string) => {
    if (typeof role === 'string' && isNaN(Number(role))) return role;
    const roleMap: Record<number, string> = { 0: 'Admin', 1: 'Teacher', 2: 'Student' };
    return roleMap[Number(role)] ?? 'Unknown';
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

export default function AdminView() {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classes' | 'assignments'>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [users, setUsers] = useState<User[]>([]);
    const [studentsList, setStudentsList] = useState<StudentOption[]>([]);
    const [teachersList, setTeachersList] = useState<TeacherOption[]>([]);
    const [classList, setClassList] = useState<ClassOption[]>([]);
    const [subjectList, setSubjectList] = useState<SubjectOption[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [userSearch, setUserSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    const [className, setClassName] = useState('');
    const [roomNumber, setRoomNumber] = useState('');

    // --- Edit Class State ---
    const [editingClass, setEditingClass] = useState<ClassOption | null>(null);
    const [editClassName, setEditClassName] = useState('');
    const [editRoomNumber, setEditRoomNumber] = useState('');

    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [subjectDescription, setSubjectDescription] = useState('');

    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStudentClassId, setSelectedStudentClassId] = useState('');

    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [selectedTeacherClassId, setSelectedTeacherClassId] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [usersRes, studentsRes, teachersRes, classesRes, subjectsRes, assignmentsRes, submissionsRes] = await Promise.allSettled([
                api.get('/admin/users'),
                api.get('/admin/students'),
                api.get('/admin/teachers'),
                api.get('/admin/classes'),
                api.get('/admin/subjects'),
                api.get('/admin/assignments'),
                api.get('/admin/submissions'),
            ]);

            if (usersRes.status === 'fulfilled') setUsers(extractArrayData(usersRes.value));
            if (studentsRes.status === 'fulfilled') setStudentsList(extractArrayData(studentsRes.value));
            if (teachersRes.status === 'fulfilled') setTeachersList(extractArrayData(teachersRes.value));
            if (classesRes.status === 'fulfilled') setClassList(extractArrayData(classesRes.value));
            if (subjectsRes.status === 'fulfilled') setSubjectList(extractArrayData(subjectsRes.value));
            if (assignmentsRes.status === 'fulfilled') setAssignments(extractArrayData(assignmentsRes.value));
            if (submissionsRes.status === 'fulfilled') setSubmissions(extractArrayData(submissionsRes.value));
        } catch {
            showStatus('error', 'Failed to load system data');
        } finally {
            setLoading(false);
        }
    };

    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    const effectiveTeachers = useMemo(() => {
        if (teachersList.length > 0) return teachersList;
        return users
            .filter((u) => getRoleName(u.role).toLowerCase() === 'teacher')
            .map((u) => ({
                id: u.id,
                fullName: `${u.firstName} ${u.lastName}`.trim(),
                specialization: 'Teacher',
            }));
    }, [teachersList, users]);

    const effectiveStudents = useMemo(() => {
        if (studentsList.length > 0) return studentsList;
        return users
            .filter((u) => getRoleName(u.role).toLowerCase() === 'student')
            .map((u) => ({
                id: u.id,
                fullName: `${u.firstName} ${u.lastName}`.trim(),
                email: u.email,
            }));
    }, [studentsList, users]);

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(userSearch.toLowerCase());
            const roleName = getRoleName(u.role).toLowerCase();
            const matchesRole = roleFilter === 'all' || roleName === roleFilter.toLowerCase();

            return matchesSearch && matchesRole;
        });
    }, [users, userSearch, roleFilter]);

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/classes', { className, roomNumber });
            showStatus('success', `Class "${className}" created successfully!`);
            setClassName('');
            setRoomNumber('');
            fetchDashboardData();
        } catch {
            showStatus('error', 'Failed to create class.');
        }
    };

    const handleOpenEditClass = (c: ClassOption) => {
        setEditingClass(c);
        setEditClassName(c.className);
        setEditRoomNumber(c.roomNumber);
    };

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClass) return;
        try {
            await api.put(`/admin/classes/${editingClass.id}`, {
                className: editClassName,
                roomNumber: editRoomNumber,
            });
            showStatus('success', `Class "${editClassName}" updated successfully!`);
            setEditingClass(null);
            fetchDashboardData();
        } catch {
            showStatus('error', 'Failed to update class.');
        }
    };

    // --- SweetAlert2 Delete Handler ---
    const handleDeleteClass = async (classItem: ClassOption) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you really want to delete class "${classItem.className}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
            background: '#0f172a', // Slate 900
            color: '#f8fafc', // Slate 50
            confirmButtonColor: '#e11d48', // Rose 600
            cancelButtonColor: '#334155', // Slate 700
            customClass: {
                popup: 'border border-slate-800 rounded-xl shadow-2xl',
                title: 'text-sm font-bold text-white',
                htmlContainer: 'text-xs text-slate-400',
            }
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/classes/${classItem.id}`);
                Swal.fire({
                    title: 'Deleted!',
                    text: `Class "${classItem.className}" has been deleted.`,
                    icon: 'success',
                    background: '#0f172a',
                    color: '#f8fafc',
                    confirmButtonColor: '#4f46e5',
                    customClass: {
                        popup: 'border border-slate-800 rounded-xl',
                        title: 'text-sm font-bold text-white',
                        htmlContainer: 'text-xs text-slate-400',
                    }
                });
                fetchDashboardData();
            } catch {
                showStatus('error', 'Could not delete class.');
            }
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/subjects', { subjectName, subjectCode, subjectDescription });
            showStatus('success', `Subject "${subjectName}" created successfully!`);
            setSubjectName('');
            setSubjectCode('');
            setSubjectDescription('');
            fetchDashboardData();
        } catch {
            showStatus('error', 'Failed to create subject.');
        }
    };

    const handleAssignStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !selectedStudentClassId) {
            showStatus('error', 'Select both student and class.');
            return;
        }
        try {
            await api.post(`/admin/assign-student-class?studentId=${selectedStudentId}&classId=${selectedStudentClassId}`);
            showStatus('success', 'Student successfully assigned to class!');
            setSelectedStudentId('');
            setSelectedStudentClassId('');
        } catch {
            showStatus('error', 'Failed to assign student.');
        }
    };

    const handleAssignTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacherId || !selectedTeacherClassId) {
            showStatus('error', 'Select teacher and class.');
            return;
        }
        try {
            await api.post(`/admin/assign-teacher-class`, {
                teacherId: selectedTeacherId,
                classDetailsId: selectedTeacherClassId,
            });
            showStatus('success', 'Teacher assigned to class successfully!');
            setSelectedTeacherId('');
            setSelectedTeacherClassId('');
        } catch {
            showStatus('error', 'Failed to assign teacher.');
        }
    };

    const navItems = [
        {
            id: 'overview',
            label: 'Overview',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            id: 'users',
            label: 'Users & Roles',
            count: users.length,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
        },
        {
            id: 'classes',
            label: 'Classes & Subjects',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
        {
            id: 'assignments',
            label: 'Assignments',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="h-full w-full bg-slate-950 text-slate-100 flex font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
            {/* Toast Alert */}
            {statusMsg && (
                <div
                    className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border backdrop-blur-xl shadow-lg transition-all ${statusMsg.type === 'success'
                        ? 'bg-slate-900 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-rose-500/40 text-rose-300'
                        }`}
                >
                    <span className={`w-2 h-2 rounded-full ${statusMsg.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-xs font-medium">{statusMsg.text}</span>
                </div>
            )}

            {/* Sidebar Nav */}
            <aside
                className={`${isSidebarOpen ? 'w-60' : 'w-16'
                    } transition-all duration-200 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-full z-20`}
            >
                <div className="flex flex-col h-full">
                    {/* Header Branding */}
                    <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                A
                            </div>
                            {isSidebarOpen && <span className="font-semibold text-xs tracking-wide text-white">Academia Admin</span>}
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Toggle Sidebar"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-2 space-y-1">
                        {navItems.map((item) => {
                            const active = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                                    {isSidebarOpen && item.count !== undefined && (
                                        <span
                                            className={`ml-auto px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                                                }`}
                                        >
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Top Header */}
                <header className="h-14 px-6 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <h1 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">{activeTab.replace('-', ' ')}</h1>

                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-xs font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        title="Refresh Data"
                    >
                        <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </header>

                {/* Dashboard Workspace */}
                <main className="flex-1 p-6 space-y-6 w-full overflow-y-auto">
                    {/* TAB 1: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Total Users</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">{users.length}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">Admins, Teachers, Students</span>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Active Classes</p>
                                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">{classList.length}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">{subjectList.length} Subjects Registered</span>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Assignments</p>
                                    <h3 className="text-2xl font-bold text-amber-400 mt-1">{assignments.length}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">Drafts & Published</span>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Submissions</p>
                                    <h3 className="text-2xl font-bold text-purple-400 mt-1">{submissions.length}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">Completed Work</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => setActiveTab('users')}
                                    className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition"
                                >
                                    <h3 className="font-semibold text-xs text-indigo-300">User Allocations &rarr;</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">Assign students to classes or link teachers to courses.</p>
                                </div>

                                <div
                                    onClick={() => setActiveTab('classes')}
                                    className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition"
                                >
                                    <h3 className="font-semibold text-xs text-emerald-300">Classes & Subjects &rarr;</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">Add new academic sections, room numbers and subject codes.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: USER MANAGEMENT */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Student Allocation */}
                                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                    <h3 className="text-xs font-semibold text-slate-200">Assign Student to Class</h3>
                                    <form onSubmit={handleAssignStudent} className="space-y-3">
                                        <select
                                            value={selectedStudentId}
                                            onChange={(e) => setSelectedStudentId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                            required
                                        >
                                            <option value="">Select Student...</option>
                                            {effectiveStudents.map((st) => (
                                                <option key={st.id} value={st.id}>
                                                    {st.fullName} ({st.email})
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedStudentClassId}
                                            onChange={(e) => setSelectedStudentClassId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                            required
                                        >
                                            <option value="">Select Target Class...</option>
                                            {classList.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.className} ({c.roomNumber})
                                                </option>
                                            ))}
                                        </select>

                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-xs transition cursor-pointer">
                                            Assign Student
                                        </button>
                                    </form>
                                </div>

                                {/* Teacher Allocation */}
                                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                    <h3 className="text-xs font-semibold text-slate-200">Assign Teacher to Class</h3>
                                    <form onSubmit={handleAssignTeacher} className="space-y-3">
                                        <select
                                            value={selectedTeacherId}
                                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                            required
                                        >
                                            <option value="">Select Teacher...</option>
                                            {effectiveTeachers.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.fullName} ({t.specialization || 'Teacher'})
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedTeacherClassId}
                                            onChange={(e) => setSelectedTeacherClassId(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                            required
                                        >
                                            <option value="">Select Target Class...</option>
                                            {classList.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.className} ({c.roomNumber})
                                                </option>
                                            ))}
                                        </select>

                                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-xs transition cursor-pointer">
                                            Assign Teacher
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* User Filtering Table */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full sm:w-72 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                                    />

                                    <div className="flex gap-1">
                                        {['all', 'admin', 'teacher', 'student'].map((r) => (
                                            <button
                                                key={r}
                                                onClick={() => setRoleFilter(r)}
                                                className={`px-3 py-1 rounded-md text-xs font-medium capitalize border transition cursor-pointer ${roleFilter === r
                                                    ? 'bg-indigo-600 text-white border-indigo-500'
                                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                                    }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Email</th>
                                                <th className="p-3">Gender</th>
                                                <th className="p-3">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 font-medium text-slate-200">
                                                        {u.firstName} {u.lastName}
                                                    </td>
                                                    <td className="p-3 text-slate-400">{u.email}</td>
                                                    <td className="p-3 text-slate-400">{getGenderName(u.gender)}</td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-indigo-300 border border-slate-700/60">
                                                            {getRoleName(u.role)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-4 text-center text-slate-500">
                                                        No users match your filter criteria.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: CLASSES & SUBJECTS */}
                    {activeTab === 'classes' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Class Creator */}
                                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                    <h3 className="text-xs font-semibold text-slate-200">Create New Class</h3>
                                    <form onSubmit={handleCreateClass} className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-400 mb-1">Class Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Class 10 - Science"
                                                value={className}
                                                onChange={(e) => setClassName(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-400 mb-1">Room Number</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Room 402"
                                                value={roomNumber}
                                                onChange={(e) => setRoomNumber(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg text-xs transition cursor-pointer">
                                            Create Class
                                        </button>
                                    </form>
                                </div>

                                {/* Subject Creator */}
                                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                    <h3 className="text-xs font-semibold text-slate-200">Create New Subject</h3>
                                    <form onSubmit={handleCreateSubject} className="space-y-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-400 mb-1">Subject Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Higher Mathematics"
                                                value={subjectName}
                                                onChange={(e) => setSubjectName(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-400 mb-1">Subject Code</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. MATH-101"
                                                value={subjectCode}
                                                onChange={(e) => setSubjectCode(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-400 mb-1">Description</label>
                                            <input
                                                type="text"
                                                placeholder="Overview..."
                                                value={subjectDescription}
                                                onChange={(e) => setSubjectDescription(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-xs transition cursor-pointer">
                                            Create Subject
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Class Cards list with Edit and Delete */}
                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                <h3 className="text-xs font-semibold text-slate-200">Active Classes ({classList.length})</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {classList.map((c) => (
                                        <div key={c.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-xs text-slate-200">{c.className}</h4>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Room: {c.roomNumber}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleOpenEditClass(c)}
                                                    className="px-2 py-1 bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900 text-[10px] font-medium rounded border border-indigo-800/80 transition cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClass(c)}
                                                    className="px-2 py-1 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-[10px] font-medium rounded border border-rose-800/80 transition cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: ASSIGNMENTS & SUBMISSIONS */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-3">
                                <h3 className="text-xs font-semibold text-slate-200">All System Assignments</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Title</th>
                                                <th className="p-3">Class</th>
                                                <th className="p-3">Subject</th>
                                                <th className="p-3">Teacher</th>
                                                <th className="p-3">Due Date</th>
                                                <th className="p-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {assignments.map((a) => (
                                                <tr key={a.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 font-medium text-slate-200">{a.title}</td>
                                                    <td className="p-3 text-slate-400">{a.className || 'N/A'}</td>
                                                    <td className="p-3 text-slate-400">{a.subjectName || 'N/A'}</td>
                                                    <td className="p-3 text-slate-400">{a.teacherName || 'N/A'}</td>
                                                    <td className="p-3 text-slate-400">{a.dueDate}</td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${a.isDraft ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                                                }`}
                                                        >
                                                            {a.isDraft ? 'Draft' : 'Published'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-3">
                                <h3 className="text-xs font-semibold text-slate-200">Student Submissions Monitor</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Student</th>
                                                <th className="p-3">Assignment</th>
                                                <th className="p-3">Submitted At</th>
                                                <th className="p-3">Marks</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">File Link</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {submissions.map((s) => (
                                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 font-medium text-slate-200">{s.studentName}</td>
                                                    <td className="p-3 text-slate-400">{s.assignmentTitle}</td>
                                                    <td className="p-3 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td>
                                                    <td className="p-3 text-slate-300">{s.markAssigned ?? 'Not Graded'}</td>
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        {s.filePath ? (
                                                            <a href={s.filePath} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                                                                View File
                                                            </a>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* --- Edit Class Modal --- */}
            {editingClass && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h3 className="text-xs font-semibold text-slate-200">Edit Class</h3>
                            <button
                                onClick={() => setEditingClass(null)}
                                className="text-slate-400 hover:text-white text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleUpdateClass} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Class Name</label>
                                <input
                                    type="text"
                                    value={editClassName}
                                    onChange={(e) => setEditClassName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Room Number</label>
                                <input
                                    type="text"
                                    value={editRoomNumber}
                                    onChange={(e) => setEditRoomNumber(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingClass(null)}
                                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-md text-xs hover:bg-slate-700 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-500 transition cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}