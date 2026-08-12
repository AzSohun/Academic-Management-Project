'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';

// --- Types ---
interface Classmate {
    id: string;
    fullName: string;
    rollNo: string;
    email: string;
    section: string;
}

interface EnrolledSubject {
    id: string;
    subjectName: string;
    subjectCode: string;
    activeAssignments: number;
}

interface MyEnrolledClass {
    id: string;
    className: string;
    roomNumber: string;
    classmates: Classmate[];
    subjects: EnrolledSubject[];
}

interface Assignment {
    id: string;
    title: string;
    description: string;
    marks: number;
    dueDate: string;
    subjectName?: string;
    className?: string;
    teacherName?: string;
}

interface Submission {
    id: string;
    filePath: string;
    submissionDate: string;
    markAssigned: number | null;
    teacherFeedback: string;
    status: string;
    assignmentId: string;
    assignmentTitle: string;
    subjectName?: string;
}

interface StudentProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string | null;
    address: string;
    parentContact: string;
    rollNo: string;
    group: string;
    section: string;
}

const extractArrayData = (res: any) => {
    if (!res) return [];
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
};

// --- Reusable Pagination Component ---
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

export default function StudentView() {
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'submissions' | 'my-class' | 'profile'>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [enrolledClass, setEnrolledClass] = useState<MyEnrolledClass | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        firstName: '', lastName: '', address: '', dateOfBirth: '', parentContact: '',
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // --- Modal States ---
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
    const [filePathInput, setFilePathInput] = useState('');
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);

    // Pagination States
    const [pageState, setPageState] = useState({
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
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            const [classRes, assignmentsRes, submissionsRes, profileRes] = await Promise.allSettled([
                api.get('/student/my-class'),
                api.get('/student/assignments'),
                api.get('/student/my-submissions'),
                api.get('/student/profile'),
            ]);

            if (classRes.status === 'fulfilled') {
                const classData = classRes.value.data?.data || classRes.value.data;
                setEnrolledClass(classData);
            }
            if (assignmentsRes.status === 'fulfilled') setAssignments(extractArrayData(assignmentsRes.value));
            if (submissionsRes.status === 'fulfilled') setSubmissions(extractArrayData(submissionsRes.value));
            if (profileRes.status === 'fulfilled') {
                const profileData = profileRes.value.data?.data || profileRes.value.data;
                setStudentProfile(profileData);
            }
        } catch {
            showStatus('error', 'Failed to load student workspace data');
        } finally {
            setLoading(false);
        }
    };

    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    const isSubmitted = (assignmentId: string) => submissions.some((s) => s.assignmentId === assignmentId);

    const pendingAssignmentsCount = useMemo(() => {
        return assignments.filter((a) => !isSubmitted(a.id)).length;
    }, [assignments, submissions]);

    const handleOpenEditProfile = () => {
        if (!studentProfile) return;
        setProfileFormData({
            firstName: studentProfile.firstName || '',
            lastName: studentProfile.lastName || '',
            address: studentProfile.address || '',
            dateOfBirth: studentProfile.dateOfBirth ? studentProfile.dateOfBirth.split('T')[0] : '',
            parentContact: studentProfile.parentContact || '',
        });
        setIsEditingProfile(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/student/profile', profileFormData);
            showStatus('success', 'Profile updated successfully!');
            setIsEditingProfile(false);
            fetchStudentData();
        } catch {
            showStatus('error', 'Failed to update profile.');
        }
    };

    const handleOpenSubmitModal = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setFilePathInput('');
    };

    const handleOpenEditModal = (submission: Submission) => {
        setEditingSubmission(submission);
        setFilePathInput(submission.filePath);
    };

    const handleTaskSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignment || !filePathInput) return;

        setIsSubmittingTask(true);
        try {
            await api.post('/student/submissions', {
                assignmentId: selectedAssignment.id,
                filePath: filePathInput,
            });

            Swal.fire({
                title: 'Submitted!',
                text: `Your response for "${selectedAssignment.title}" was uploaded successfully.`,
                icon: 'success',
                background: '#0f172a',
                color: '#f8fafc',
                confirmButtonColor: '#7c3aed',
                customClass: { popup: 'border border-slate-800 rounded-xl', title: 'text-sm font-bold text-white', htmlContainer: 'text-xs text-slate-400' }
            });

            setSelectedAssignment(null);
            setFilePathInput('');
            fetchStudentData();
        } catch (err: any) {
            showStatus('error', err.response?.data?.message || 'Failed to submit assignment. Try again.');
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const handleUpdateSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubmission || !filePathInput) return;

        setIsSubmittingTask(true);
        try {
            // 🟢 FIXED: Backend expects newFilePath as a [FromQuery] parameter
            await api.put(`/student/submissions/${editingSubmission.id}?newFilePath=${encodeURIComponent(filePathInput)}`);

            showStatus('success', 'Submission link updated successfully!');
            setEditingSubmission(null);
            setFilePathInput('');
            fetchStudentData();
        } catch (err: any) {
            showStatus('error', err.response?.data?.message || 'Failed to update submission. Try again.');
        } finally {
            setIsSubmittingTask(false);
        }
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { id: 'assignments', label: 'Active Tasks', count: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : undefined, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: 'submissions', label: 'My Submissions & Grades', count: submissions.length, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        { id: 'my-class', label: 'My Enrolled Class', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2-2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { id: 'profile', label: 'My Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    ];

    return (
        <div className="h-full w-full bg-slate-950 text-slate-100 flex font-sans antialiased overflow-hidden selection:bg-violet-500 selection:text-white">
            {/* Toast Alert */}
            {statusMsg && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border backdrop-blur-xl shadow-lg transition-all ${statusMsg.type === 'success' ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-rose-500/40 text-rose-300'}`}>
                    <span className={`w-2 h-2 rounded-full ${statusMsg.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-sm font-medium">{statusMsg.text}</span>
                </div>
            )}

            {/* Sidebar Nav */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-200 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-full z-20`}>
                <div className="flex flex-col h-full">
                    <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">S</div>
                            {isSidebarOpen && <span className="font-semibold text-sm tracking-wide text-white">Student Portal</span>}
                        </div>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer" title="Toggle Sidebar">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} /></svg>
                        </button>
                    </div>

                    <nav className="p-3 space-y-2">
                        {navItems.map((item) => {
                            const active = activeTab === item.id;
                            return (
                                <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${active ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                                    <span>{item.icon}</span>
                                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                                    {isSidebarOpen && item.count !== undefined && <span className={`ml-auto px-2 py-0.5 rounded text-xs ${active ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{item.count}</span>}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="h-16 px-8 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <h1 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{activeTab.replace('-', ' ')}</h1>
                    <button onClick={fetchStudentData} disabled={loading} className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer" title="Refresh Data">
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin text-violet-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </header>

                <main className="flex-1 p-8 space-y-8 w-full overflow-y-auto">
                    {/* --- TAB 1: OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <p className="text-sm font-medium text-slate-400">Class Enrolled</p>
                                    <h3 className="text-2xl font-bold text-violet-400 mt-2 truncate">{enrolledClass ? enrolledClass.className : 'Not Assigned'}</h3>
                                    <span className="text-xs text-slate-500 block mt-2">{enrolledClass ? `Room: ${enrolledClass.roomNumber}` : 'Contact Administrator'}</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <p className="text-sm font-medium text-slate-400">Active Tasks</p>
                                    <h3 className="text-3xl font-bold text-indigo-400 mt-2">{assignments.length}</h3>
                                    <span className="text-xs text-slate-500 block mt-2">Class Coursework</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <p className="text-sm font-medium text-slate-400">Pending Tasks</p>
                                    <h3 className="text-3xl font-bold text-amber-400 mt-2">{pendingAssignmentsCount}</h3>
                                    <span className="text-xs text-slate-500 block mt-2">To Be Submitted</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <p className="text-sm font-medium text-slate-400">Completed Works</p>
                                    <h3 className="text-3xl font-bold text-emerald-400 mt-2">{submissions.length}</h3>
                                    <span className="text-xs text-slate-500 block mt-2">Submitted Homeworks</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div onClick={() => setActiveTab('assignments')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-6 rounded-xl transition">
                                    <h3 className="font-semibold text-sm text-violet-300">View Active Assignments &rarr;</h3>
                                    <p className="text-sm text-slate-400 mt-2">Check pending homework due dates and submit your solutions.</p>
                                </div>
                                <div onClick={() => setActiveTab('submissions')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-6 rounded-xl transition">
                                    <h3 className="font-semibold text-sm text-emerald-300">Check Marks & Feedback &rarr;</h3>
                                    <p className="text-sm text-slate-400 mt-2">Review assigned grades and comments left by your teachers.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 5: MY PROFILE */}
                    {activeTab === 'profile' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                                    <h3 className="text-lg font-semibold text-slate-200">My Profile</h3>
                                    {!isEditingProfile && (
                                        <button onClick={handleOpenEditProfile} className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg text-sm font-medium transition cursor-pointer">
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                {isEditingProfile ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">First Name</label><input type="text" value={profileFormData.firstName} onChange={(e) => setProfileFormData({ ...profileFormData, firstName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500" required /></div>
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Last Name</label><input type="text" value={profileFormData.lastName} onChange={(e) => setProfileFormData({ ...profileFormData, lastName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500" required /></div>
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Date of Birth</label><input type="date" value={profileFormData.dateOfBirth} onChange={(e) => setProfileFormData({ ...profileFormData, dateOfBirth: e.target.value })} onClick={(e) => { if ('showPicker' in e.currentTarget) e.currentTarget.showPicker(); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer scheme-dark" /></div>
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Parent Contact</label><input type="text" value={profileFormData.parentContact} onChange={(e) => setProfileFormData({ ...profileFormData, parentContact: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500" /></div>
                                            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-400 mb-1.5">Address</label><textarea value={profileFormData.address} onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })} rows={2} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-violet-500" /></div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                            <button type="button" onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-sm font-medium transition cursor-pointer">Cancel</button>
                                            <button type="submit" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-md shadow-violet-600/20">Save Profile</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Full Name</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.firstName} {studentProfile?.lastName}</p></div>
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.email}</p></div>
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date of Birth</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.dateOfBirth ? new Date(studentProfile.dateOfBirth).toLocaleDateString() : 'Not Provided'}</p></div>
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Parent Contact</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.parentContact || 'Not Provided'}</p></div>
                                            <div className="md:col-span-2 p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Address</p><p className="text-sm text-slate-200 font-medium">{studentProfile?.address || 'Not Provided'}</p></div>
                                        </div>
                                        <div className="mt-8 border-t border-slate-800 pt-6">
                                            <h4 className="text-sm font-semibold text-violet-400 mb-4">Academic Details <span className="text-xs font-normal text-slate-500 ml-2">(Managed by Admin)</span></h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="p-4 bg-violet-950/20 rounded-lg border border-violet-900/30"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Roll No</p><p className="text-sm text-violet-300 font-mono font-medium">{studentProfile?.rollNo || 'N/A'}</p></div>
                                                <div className="p-4 bg-violet-950/20 rounded-lg border border-violet-900/30"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Group</p><p className="text-sm text-violet-300 font-medium">{studentProfile?.group || 'N/A'}</p></div>
                                                <div className="p-4 bg-violet-950/20 rounded-lg border border-violet-900/30"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Section</p><p className="text-sm text-violet-300 font-medium">{studentProfile?.section || 'N/A'}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: ACTIVE ASSIGNMENTS --- */}
                    {activeTab === 'assignments' && (
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
                                            {paginateData(assignments, 'assignments').map((a) => {
                                                const done = isSubmitted(a.id);

                                                // 🟢 NEW: Frontend deadline check logic
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
                                                                <button onClick={() => handleOpenSubmitModal(a)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-md transition cursor-pointer shadow-md shadow-violet-600/20">Submit Task</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {assignments.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-sm">No active assignments for your class right now.</td></tr>}
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
                        </div>
                    )}

                    {/* --- TAB 3: SUBMISSIONS & GRADES --- */}
                    {activeTab === 'submissions' && (
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
                                            {paginateData(submissions, 'submissions').map((s) => {
                                                // 🟢 Disable editing if past deadline
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
                                                                    <button onClick={() => handleOpenEditModal(s)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition cursor-pointer border border-slate-700">Edit Link</button>
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

                    {/* --- TAB 4: MY CLASS (FULL PAGE REDESIGN) --- */}
                    {activeTab === 'my-class' && (
                        <div className="space-y-6">
                            {enrolledClass ? (
                                <>
                                    {/* Header Section */}
                                    <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600"></div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-violet-400 tracking-tight">{enrolledClass.className}</h2>
                                            <p className="text-sm text-slate-400 mt-1.5">Room Number: <span className="text-slate-300 font-medium">{enrolledClass.roomNumber}</span></p>
                                        </div>
                                        <div className="shrink-0">
                                            <div className="bg-violet-950/40 border border-violet-800/50 px-5 py-2.5 rounded-xl shadow-inner text-center">
                                                <p className="text-[10px] text-violet-300/80 uppercase font-semibold tracking-wider mb-0.5">Total Classmates</p>
                                                <p className="text-2xl font-bold text-violet-300">{enrolledClass.classmates?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                        {/* Left Column: Subjects & Tasks */}
                                        <div className="xl:col-span-1 space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-200">Enrolled Subjects</h3>
                                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                                                <ul className="divide-y divide-slate-800/60">
                                                    {enrolledClass.subjects?.length > 0 ? (
                                                        enrolledClass.subjects.map(sub => (
                                                            <li key={sub.id} className="p-5 flex justify-between items-center hover:bg-slate-800/30 transition">
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-200">{sub.subjectName}</p>
                                                                    <p className="text-xs text-slate-500 font-mono mt-1">{sub.subjectCode}</p>
                                                                </div>
                                                                {sub.activeAssignments > 0 ? (
                                                                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap shadow-sm shadow-amber-900/20">
                                                                        {sub.activeAssignments} Due
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-400 whitespace-nowrap border border-slate-700/50">
                                                                        0 Due
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="p-6 text-center text-sm text-slate-500 italic">No subjects assigned to this class yet.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Right Column: Classmates Table */}
                                        <div className="xl:col-span-2 space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-200">Classmates Directory</h3>
                                            <div className="overflow-x-auto bg-slate-900/50 rounded-xl border border-slate-800 shadow-sm">
                                                <table className="w-full text-left text-sm text-slate-300">
                                                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                                        <tr>
                                                            <th className="p-4 font-semibold">Name</th>
                                                            <th className="p-4 font-semibold">Roll No</th>
                                                            <th className="p-4 font-semibold">Section</th>
                                                            <th className="p-4 font-semibold">Email</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800/60">
                                                        {enrolledClass.classmates?.length > 0 ? (
                                                            enrolledClass.classmates.map((student) => (
                                                                <tr key={student.id} className="hover:bg-slate-800/30 transition">
                                                                    <td className="p-4 font-medium text-slate-200 whitespace-nowrap">{student.fullName}</td>
                                                                    <td className="p-4 font-mono text-violet-400">{student.rollNo || 'N/A'}</td>
                                                                    <td className="p-4 text-slate-400">{student.section || 'N/A'}</td>
                                                                    <td className="p-4 text-slate-400">{student.email}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={4} className="p-10 text-center">
                                                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                                                        <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                                        <span className="text-sm">No other students enrolled in this class yet.</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                    <svg className="w-16 h-16 text-slate-700 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    <p className="text-lg text-slate-300 font-semibold tracking-tight">No Class Assigned</p>
                                    <p className="text-sm text-slate-500 mt-2 max-w-sm text-center">You are currently not assigned to any academic class. Please contact the system administrator to update your enrollment.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* --- Submit Task Modal --- */}
            {selectedAssignment && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Submit Assignment</h3>
                                <p className="text-xs text-slate-400 mt-1">{selectedAssignment.title}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAssignment(null)}
                                className="text-slate-400 hover:text-white text-base cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleTaskSubmission} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">File Link / Path / Drive URL</label>
                                <input
                                    type="text"
                                    value={filePathInput}
                                    onChange={(e) => setFilePathInput(e.target.value)}
                                    placeholder="e.g. https://drive.google.com/file/... or github link"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAssignment(null)}
                                    className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition cursor-pointer font-medium mt-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingTask}
                                    className="px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 transition cursor-pointer disabled:opacity-50 mt-3 shadow-md shadow-violet-600/20"
                                >
                                    {isSubmittingTask ? 'Uploading...' : 'Confirm Submission'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Edit Submission Modal --- */}
            {editingSubmission && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Update Submission</h3>
                                <p className="text-xs text-slate-400 mt-1">{editingSubmission.assignmentTitle}</p>
                            </div>
                            <button
                                onClick={() => setEditingSubmission(null)}
                                className="text-slate-400 hover:text-white text-base cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSubmission} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">New File Link / Path</label>
                                <input
                                    type="text"
                                    value={filePathInput}
                                    onChange={(e) => setFilePathInput(e.target.value)}
                                    placeholder="Paste your updated link here..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingSubmission(null)}
                                    className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition cursor-pointer font-medium mt-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingTask}
                                    className="px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 transition cursor-pointer disabled:opacity-50 mt-3 shadow-md shadow-violet-600/20"
                                >
                                    {isSubmittingTask ? 'Updating...' : 'Update Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}