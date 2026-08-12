'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';

// --- Types ---
interface AssignedSubject {
    id: string;
    subjectName: string;
    subjectCode: string;
}

interface EnrolledStudent {
    id: string;
    fullName: string;
    rollNo: string;
    email: string;
    section: string;
}

interface MyClass {
    id: string;
    className: string;
    roomNumber: string;
    studentCount: number;
    subjects: AssignedSubject[];
    students: EnrolledStudent[];
}

interface Subject {
    id: string;
    subjectName: string;
    subjectCode: string;
    subjectDescription?: string;
}

interface Assignment {
    id: string;
    title: string;
    description: string;
    marks: number;
    dueDate: string;
    isDraft: boolean;
    subjectId?: string;
    subjectName?: string;
    classDetailsId?: string;
    className?: string;
}

interface Submission {
    id: string;
    filePath: string;
    submissionDate: string;
    markAssigned: number | null;
    teacherFeedback: string;
    status?: string;
    studentName: string;
    assignmentId: string;
    assignmentTitle: string;
}

interface TeacherProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string | null;
    qualification: string;
    experience: string;
    teacherCode: string;
    specialization: string;
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

export default function TeacherView() {
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'submissions' | 'classes' | 'profile'>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [myClasses, setMyClasses] = useState<MyClass[]>([]);
    const [subjectList, setSubjectList] = useState<Subject[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        firstName: '', lastName: '', phoneNumber: '', address: '', dateOfBirth: '', qualification: '', experience: '',
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // --- Create Assignment Form State ---
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newMarks, setNewMarks] = useState<number>(100);
    const [newDueDate, setNewDueDate] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [isDraft, setIsDraft] = useState(false);

    // --- Edit Assignment Modal State ---
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editMarks, setEditMarks] = useState<number>(100);
    const [editDueDate, setEditDueDate] = useState('');
    const [editClassId, setEditClassId] = useState('');
    const [editSubjectId, setEditSubjectId] = useState('');
    const [editIsDraft, setEditIsDraft] = useState(false);

    // --- Grading Modal State ---
    const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
    const [givenMark, setGivenMark] = useState<number>(0);
    const [givenFeedback, setGivenFeedback] = useState<string>('');

    const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'graded'>('all');

    // --- Specific Assignment Submissions State ---
    const [viewingAssignmentSubmissions, setViewingAssignmentSubmissions] = useState<Assignment | null>(null);
    const [assignmentSubmissionsList, setAssignmentSubmissionsList] = useState<Submission[]>([]);
    const [isLoadingSpecificSubmissions, setIsLoadingSpecificSubmissions] = useState(false);

    const [viewingStudentsClass, setViewingStudentsClass] = useState<MyClass | null>(null);

    const [pageState, setPageState] = useState({
        assignments: { page: 1, limit: 10 },
        submissions: { page: 1, limit: 10 },
        specificSubmissions: { page: 1, limit: 10 } // For the new modal
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
        fetchTeacherData();
    }, []);

    const fetchTeacherData = async () => {
        setLoading(true);
        try {
            const [classesRes, subjectsRes, assignmentsRes, submissionsRes, profileRes] = await Promise.allSettled([
                api.get('/teacher/classes'),
                api.get('/teacher/subjects'),
                api.get('/teacher/assignments'),
                api.get('/teacher/submissions'),
                api.get('/teacher/profile'),
            ]);

            if (classesRes.status === 'fulfilled') setMyClasses(extractArrayData(classesRes.value));
            if (subjectsRes.status === 'fulfilled') setSubjectList(extractArrayData(subjectsRes.value));
            if (assignmentsRes.status === 'fulfilled') setAssignments(extractArrayData(assignmentsRes.value));
            if (submissionsRes.status === 'fulfilled') setSubmissions(extractArrayData(submissionsRes.value));
            if (profileRes.status === 'fulfilled') {
                const profileData = profileRes.value.data?.data || profileRes.value.data;
                setTeacherProfile(profileData);
            }
        } catch {
            showStatus('error', 'Failed to load teacher workspace data');
        } finally {
            setLoading(false);
        }
    };

    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    const pendingSubmissionsCount = useMemo(() => {
        return submissions.filter((s) => {
            const statusStr = s.status ? s.status.toLowerCase() : '';
            return s.markAssigned === null || statusStr === 'submitted' || statusStr === '';
        }).length;
    }, [submissions]);

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

    const handleOpenEditProfile = () => {
        if (!teacherProfile) return;
        setProfileFormData({
            firstName: teacherProfile.firstName || '', lastName: teacherProfile.lastName || '', phoneNumber: teacherProfile.phoneNumber || '', address: teacherProfile.address || '', dateOfBirth: teacherProfile.dateOfBirth ? teacherProfile.dateOfBirth.split('T')[0] : '', qualification: teacherProfile.qualification || '', experience: teacherProfile.experience || '',
        });
        setIsEditingProfile(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/teacher/profile', profileFormData);
            showStatus('success', 'Profile updated successfully!');
            setIsEditingProfile(false);
            fetchTeacherData();
        } catch {
            showStatus('error', 'Failed to update profile.');
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClassId || !selectedSubjectId) {
            showStatus('error', 'Please select both class and subject.');
            return;
        }

        try {
            await api.post('/teacher/assignments', {
                title: newTitle, description: newDescription, marks: Number(newMarks), dueDate: newDueDate, isDraft, classDetailsId: selectedClassId, subjectId: selectedSubjectId,
            });

            showStatus('success', `Assignment "${newTitle}" created successfully!`);
            setNewTitle(''); setNewDescription(''); setNewMarks(100); setNewDueDate(''); setSelectedClassId(''); setSelectedSubjectId(''); setIsDraft(false);
            fetchTeacherData();
        } catch {
            showStatus('error', 'Failed to create assignment.');
        }
    };

    const handleOpenEditAssignment = (assignment: Assignment) => {
        setEditingAssignment(assignment);
        setEditTitle(assignment.title); setEditDescription(assignment.description); setEditMarks(assignment.marks); setEditDueDate(assignment.dueDate.split('T')[0]); setEditIsDraft(assignment.isDraft); setEditClassId(assignment.classDetailsId || ''); setEditSubjectId(assignment.subjectId || '');
    };

    const handleUpdateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAssignment || !editClassId || !editSubjectId) {
            showStatus('error', 'Please fill all required fields including Class and Subject.');
            return;
        }

        try {
            await api.put(`/teacher/assignments/${editingAssignment.id}`, {
                title: editTitle, description: editDescription, marks: Number(editMarks), dueDate: editDueDate, isDraft: editIsDraft, classDetailsId: editClassId, subjectId: editSubjectId,
            });

            showStatus('success', 'Assignment updated successfully!');
            setEditingAssignment(null);
            fetchTeacherData();
        } catch {
            showStatus('error', 'Failed to update assignment.');
        }
    };

    const handlePublishAssignment = async (assignment: Assignment) => {
        const result = await Swal.fire({
            title: 'Publish Assignment?', text: `Are you sure you want to publish "${assignment.title}"? Once published, students can see it.`, icon: 'question', showCancelButton: true, confirmButtonText: 'Yes, Publish', cancelButtonText: 'Keep as Draft', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#10b981', cancelButtonColor: '#334155', customClass: { popup: 'border border-slate-800 rounded-xl shadow-2xl', title: 'text-sm font-bold text-white', htmlContainer: 'text-sm text-slate-400' }
        });

        if (result.isConfirmed) {
            try {
                await api.patch(`/teacher/assignments/${assignment.id}/publish?isDraft=false`);
                showStatus('success', 'Assignment published successfully!');
                fetchTeacherData();
            } catch {
                showStatus('error', 'Failed to publish assignment.');
            }
        }
    };

    const handleDeleteAssignment = async (assignment: Assignment) => {
        const result = await Swal.fire({
            title: 'Are you sure?', text: `Do you really want to delete "${assignment.title}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete', cancelButtonText: 'Cancel', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#e11d48', cancelButtonColor: '#334155', customClass: { popup: 'border border-slate-800 rounded-xl shadow-2xl', title: 'text-sm font-bold text-white', htmlContainer: 'text-sm text-slate-400' }
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/teacher/assignments/${assignment.id}`);
                Swal.fire({ title: 'Deleted!', text: 'Assignment has been deleted.', icon: 'success', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#10b981', customClass: { popup: 'border border-slate-800 rounded-xl', title: 'text-sm font-bold text-white', htmlContainer: 'text-sm text-slate-400' } });
                fetchTeacherData();
            } catch {
                showStatus('error', 'Could not delete assignment.');
            }
        }
    };

    // Fetch Submissions specific to an assignment
    const handleViewAssignmentSubmissions = async (assignment: Assignment) => {
        setViewingAssignmentSubmissions(assignment);
        setIsLoadingSpecificSubmissions(true);
        try {
            const res = await api.get(`/teacher/assignments/${assignment.id}/submissions`);
            setAssignmentSubmissionsList(extractArrayData(res));
            handlePageChange('specificSubmissions', 1);
        } catch {
            showStatus('error', 'Failed to load submissions for this assignment.');
        } finally {
            setIsLoadingSpecificSubmissions(false);
        }
    };

    const handleOpenGrading = (sub: Submission) => {
        setGradingSubmission(sub);
        setGivenMark(sub.markAssigned ?? 0);
        setGivenFeedback(sub.teacherFeedback ?? '');
    };

    const handleSubmitGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingSubmission) return;

        try {
            await api.post(`/teacher/submissions/${gradingSubmission.id}/grade`, { marksAssigned: Number(givenMark), feedback: givenFeedback });
            showStatus('success', 'Grade & Feedback updated successfully!');
            setGradingSubmission(null);

            // Refresh global data
            fetchTeacherData();

            // 🟢 NEW: If grading from the specific assignment modal, refresh that modal's data too
            if (viewingAssignmentSubmissions) {
                const res = await api.get(`/teacher/assignments/${viewingAssignmentSubmissions.id}/submissions`);
                setAssignmentSubmissionsList(extractArrayData(res));
            }
        } catch {
            showStatus('error', 'Failed to submit grade.');
        }
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { id: 'assignments', label: 'Assignments', count: assignments.length, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: 'submissions', label: 'Submissions & Grading', count: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : undefined, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        { id: 'classes', label: 'My Classes', count: myClasses.length, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { id: 'profile', label: 'My Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    ];

    return (
        <div className="h-full w-full bg-slate-950 text-slate-100 flex font-sans antialiased overflow-hidden selection:bg-emerald-500 selection:text-white">
            {statusMsg && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border backdrop-blur-xl shadow-lg transition-all ${statusMsg.type === 'success' ? 'bg-slate-900 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-rose-500/40 text-rose-300'}`}>
                    <span className={`w-2 h-2 rounded-full ${statusMsg.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className="text-sm font-medium">{statusMsg.text}</span>
                </div>
            )}

            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-200 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-full z-20`}>
                <div className="flex flex-col h-full">
                    <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">T</div>
                            {isSidebarOpen && <span className="font-semibold text-sm tracking-wide text-white">Faculty Portal</span>}
                        </div>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer" title="Toggle Sidebar">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'} /></svg>
                        </button>
                    </div>

                    <nav className="p-3 space-y-2">
                        {navItems.map((item) => {
                            const active = activeTab === item.id;
                            return (
                                <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                                    <span>{item.icon}</span>
                                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                                    {isSidebarOpen && item.count !== undefined && <span className={`ml-auto px-2 py-0.5 rounded text-xs ${active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{item.count}</span>}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="h-16 px-8 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <h1 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{activeTab.replace('-', ' ')}</h1>

                    <button onClick={fetchTeacherData} disabled={loading} className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer" title="Refresh Data">
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </header>

                <main className="flex-1 p-8 space-y-8 w-full overflow-y-auto">
                    {/* TAB 1: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <p className="text-sm font-medium text-slate-400">Assigned Classes</p>
                                    <h3 className="text-3xl font-bold text-emerald-400 mt-2">{myClasses.length}</h3>
                                    <span className="text-xs text-slate-500 block mt-2">Active Classrooms</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <p className="text-sm font-medium text-slate-400">Total Assignments</p>
                                    <h3 className="text-3xl font-bold text-indigo-400 mt-2">{assignments.length}</h3>
                                    <span className="text-xs text-slate-500 block mt-2">Created Coursework</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <p className="text-sm font-medium text-slate-400">Pending Submissions</p>
                                    <h3 className="text-3xl font-bold text-amber-400 mt-2">{pendingSubmissionsCount}</h3>
                                    <span className="text-xs text-slate-500 block mt-2">Requires Grading</span>
                                </div>
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                                    <p className="text-sm font-medium text-slate-400">Graded Answers</p>
                                    <h3 className="text-3xl font-bold text-purple-400 mt-2">{submissions.length - pendingSubmissionsCount}</h3>
                                    <span className="text-xs text-slate-500 block mt-2">Completed Reviews</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div onClick={() => setActiveTab('assignments')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-6 rounded-xl transition">
                                    <h3 className="font-semibold text-sm text-emerald-300">Create & Manage Assignments &rarr;</h3>
                                    <p className="text-sm text-slate-400 mt-2">Publish new assignments or edit deadlines for your classes.</p>
                                </div>
                                <div onClick={() => setActiveTab('submissions')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-6 rounded-xl transition">
                                    <h3 className="font-semibold text-sm text-amber-300">Grade Student Submissions &rarr;</h3>
                                    <p className="text-sm text-slate-400 mt-2">Evaluate uploaded homework, assign marks and provide direct feedback.</p>
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
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">First Name</label><input type="text" value={profileFormData.firstName} onChange={(e) => setProfileFormData({ ...profileFormData, firstName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required /></div>
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Last Name</label><input type="text" value={profileFormData.lastName} onChange={(e) => setProfileFormData({ ...profileFormData, lastName: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required /></div>
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Phone Number</label><input type="text" value={profileFormData.phoneNumber} onChange={(e) => setProfileFormData({ ...profileFormData, phoneNumber: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" /></div>
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Date of Birth</label><input type="date" value={profileFormData.dateOfBirth} onChange={(e) => setProfileFormData({ ...profileFormData, dateOfBirth: e.target.value })} onClick={(e) => { if ('showPicker' in e.currentTarget) e.currentTarget.showPicker(); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer scheme-dark" /></div>
                                            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-400 mb-1.5">Address</label><textarea value={profileFormData.address} onChange={(e) => setProfileFormData({ ...profileFormData, address: e.target.value })} rows={2} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" /></div>
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Highest Qualification</label><input type="text" value={profileFormData.qualification} onChange={(e) => setProfileFormData({ ...profileFormData, qualification: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" /></div>
                                            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Experience / Bio</label><input type="text" value={profileFormData.experience} onChange={(e) => setProfileFormData({ ...profileFormData, experience: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" /></div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                            <button type="button" onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-sm font-medium transition cursor-pointer">Cancel</button>
                                            <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition cursor-pointer shadow-md shadow-emerald-600/20">Save Profile</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Full Name</p><p className="text-sm text-slate-200 font-medium">{teacherProfile?.firstName} {teacherProfile?.lastName}</p></div>
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p><p className="text-sm text-slate-200 font-medium">{teacherProfile?.email}</p></div>
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone Number</p><p className="text-sm text-slate-200 font-medium">{teacherProfile?.phoneNumber || 'Not Provided'}</p></div>
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Date of Birth</p><p className="text-sm text-slate-200 font-medium">{teacherProfile?.dateOfBirth ? new Date(teacherProfile.dateOfBirth).toLocaleDateString() : 'Not Provided'}</p></div>
                                            <div className="md:col-span-2 p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Address</p><p className="text-sm text-slate-200 font-medium">{teacherProfile?.address || 'Not Provided'}</p></div>
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Highest Qualification</p><p className="text-sm text-slate-200 font-medium">{teacherProfile?.qualification || 'Not Provided'}</p></div>
                                            <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Experience / Bio</p><p className="text-sm text-slate-200 font-medium">{teacherProfile?.experience || 'Not Provided'}</p></div>
                                        </div>
                                        <div className="mt-8 border-t border-slate-800 pt-6">
                                            <h4 className="text-sm font-semibold text-emerald-400 mb-4">Academic Details <span className="text-xs font-normal text-slate-500 ml-2">(Managed by Admin)</span></h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-4 bg-emerald-950/20 rounded-lg border border-emerald-900/30"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Teacher Code</p><p className="text-sm text-emerald-300 font-mono font-medium">{teacherProfile?.teacherCode || 'N/A'}</p></div>
                                                <div className="p-4 bg-emerald-950/20 rounded-lg border border-emerald-900/30"><p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Specialization</p><p className="text-sm text-emerald-300 font-medium">{teacherProfile?.specialization || 'General'}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ASSIGNMENTS */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-8">
                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-5">
                                <h3 className="text-sm font-semibold text-slate-200">Create New Assignment</h3>
                                <form onSubmit={handleCreateAssignment} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label><input type="text" placeholder="e.g. Midterm Homework 01" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required /></div>
                                        <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Target Class</label><select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer" required><option value="" className="bg-slate-900 text-slate-400">Select Class...</option>{myClasses.map((c) => (<option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">{c.className} (Room: {c.roomNumber})</option>))}</select></div>
                                        <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label><select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer" required><option value="" className="bg-slate-900 text-slate-400">Select Subject...</option>{subjectList.map((s) => (<option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">{s.subjectName} ({s.subjectCode})</option>))}</select></div>
                                    </div>
                                    <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Description / Instructions</label><textarea placeholder="Write task details or submission requirements..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required /></div>
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-2">
                                        <div className="flex flex-wrap items-center gap-5 w-full sm:w-auto">
                                            <div className="w-32"><label className="block text-xs font-medium text-slate-400 mb-1.5">Total Marks</label><input type="number" value={newMarks} onChange={(e) => setNewMarks(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required /></div>
                                            <div className="w-48"><label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label><input type="date" value={newDueDate} min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]} onChange={(e) => setNewDueDate(e.target.value)} onClick={(e) => { if ('showPicker' in e.currentTarget) e.currentTarget.showPicker(); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer scheme-dark" required /></div>
                                            <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="draftCheck" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" /><label htmlFor="draftCheck" className="text-sm text-slate-300 cursor-pointer select-none">Save as Draft</label></div>
                                        </div>
                                        <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition cursor-pointer shadow-md shadow-emerald-600/20 shrink-0 self-end">{isDraft ? 'Save Draft' : 'Publish Assignment'}</button>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-4">
                                <h3 className="text-sm font-semibold text-slate-200">Your Assignments ({assignments.length})</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-sm text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                            <tr><th className="p-4">Title</th><th className="p-4">Class</th><th className="p-4">Marks</th><th className="p-4">Due Date</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {paginateData(assignments, 'assignments').map((a) => (
                                                <tr key={a.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-4 font-medium text-slate-200">{a.title}</td><td className="p-4 text-slate-400">{a.className || 'N/A'}</td><td className="p-4 text-slate-300">{a.marks}</td><td className="p-4 text-slate-400">{a.dueDate}</td>
                                                    <td className="p-4"><span className={`px-3 py-1 rounded-md text-xs font-medium ${a.isDraft ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>{a.isDraft ? 'Draft' : 'Published'}</span></td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            {/* 🟢 NEW: View Submissions Button */}
                                                            <button onClick={() => handleViewAssignmentSubmissions(a)} className="px-3 py-1.5 bg-violet-950/60 text-violet-400 hover:bg-violet-900 text-xs font-medium rounded-md border border-violet-800/80 transition cursor-pointer">
                                                                Submissions
                                                            </button>
                                                            <button onClick={() => handleOpenEditAssignment(a)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded-md border border-indigo-800/80 transition cursor-pointer">Edit</button>
                                                            {a.isDraft && <button onClick={() => handlePublishAssignment(a)} className="px-3 py-1.5 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 text-xs font-medium rounded-md border border-emerald-800/80 transition cursor-pointer">Publish</button>}
                                                            <button onClick={() => handleDeleteAssignment(a)} className="px-3 py-1.5 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-medium rounded-md border border-rose-800/80 transition cursor-pointer">Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {assignments.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500 text-sm">No assignments created yet.</td></tr>}
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

                    {/* TAB 3: SUBMISSIONS & GRADING */}
                    {activeTab === 'submissions' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-5">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <h3 className="text-sm font-semibold text-slate-200">Student Submissions & Evaluation</h3>
                                    <div className="flex gap-2">
                                        {(['all', 'pending', 'graded'] as const).map((filter) => (
                                            <button key={filter} onClick={() => setSubmissionFilter(filter)} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize border transition cursor-pointer ${submissionFilter === filter ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'}`}>{filter}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-sm text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                            <tr><th className="p-4">Student</th><th className="p-4">Assignment</th><th className="p-4">Submitted At</th><th className="p-4">Marks</th><th className="p-4">File</th><th className="p-4 text-right">Action</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {paginateData(filteredSubmissions, 'submissions').map((s) => (
                                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-4 font-medium text-slate-200">{s.studentName}</td><td className="p-4 text-slate-400">{s.assignmentTitle}</td><td className="p-4 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td>
                                                    <td className="p-4">{s.markAssigned !== null ? <span className="text-emerald-400 font-semibold">{s.markAssigned}</span> : <span className="text-amber-400 text-xs bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">Pending</span>}</td>
                                                    <td className="p-4">{s.filePath ? <a href={s.filePath} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">View File</a> : <span className="text-slate-500">N/A</span>}</td>
                                                    <td className="p-4 text-right"><button onClick={() => handleOpenGrading(s)} className="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 text-xs font-medium rounded-md border border-emerald-800/80 transition cursor-pointer">{s.markAssigned !== null ? 'Edit Grade' : 'Grade Task'}</button></td>
                                                </tr>
                                            ))}
                                            {filteredSubmissions.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500 text-sm">No submissions match your filter criteria.</td></tr>}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        totalItems={filteredSubmissions.length}
                                        page={pageState.submissions.page}
                                        limit={pageState.submissions.limit}
                                        onPageChange={(p) => handlePageChange('submissions', p)}
                                        onLimitChange={(l) => handleLimitChange('submissions', l)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: MY CLASSES */}
                    {activeTab === 'classes' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-5">
                                <h3 className="text-sm font-semibold text-slate-200">Your Assigned Classes ({myClasses.length})</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
                                    {myClasses.map((c) => (
                                        <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-900/10 transition duration-200 overflow-hidden h-fit">
                                            <div className="p-5 border-b border-slate-800/60 bg-slate-900/20">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-base text-slate-200">{c.className}</h4>
                                                        <p className="text-xs text-slate-400 mt-1">Room: {c.roomNumber}</p>
                                                    </div>
                                                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-500/20 whitespace-nowrap">
                                                        {c.studentCount} {c.studentCount === 1 ? 'Student' : 'Students'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-5 flex-1">
                                                <p className="text-[10px] font-semibold text-slate-500 mb-3 uppercase tracking-wider">Assigned Subjects</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {c.subjects && c.subjects.length > 0 ? (
                                                        c.subjects.map(sub => (
                                                            <span key={sub.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                                                                {sub.subjectName} <span className="opacity-50 text-[10px] ml-1.5 font-mono">({sub.subjectCode})</span>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-500 italic">No subjects assigned</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 border-t border-slate-800/60 bg-slate-900/10">
                                                <button
                                                    onClick={() => setViewingStudentsClass(c)}
                                                    className="w-full py-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-800/50 transition cursor-pointer flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                    View Enrolled Students
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {myClasses.length === 0 && (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
                                            <svg className="w-10 h-10 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                            <p className="text-sm text-slate-400 font-medium">No Classes Assigned</p>
                                            <p className="text-xs text-slate-500 mt-1">You haven&apos;t been assigned to any classes yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Specific Assignment Submissions Modal */}
            {viewingAssignmentSubmissions && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/50 shrink-0">
                            <div>
                                <h3 className="text-base font-semibold text-slate-200">Submissions for: {viewingAssignmentSubmissions.title}</h3>
                                <p className="text-xs text-slate-400 mt-1">Class: {viewingAssignmentSubmissions.className} • Subject: {viewingAssignmentSubmissions.subjectName}</p>
                            </div>
                            <button onClick={() => setViewingAssignmentSubmissions(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoadingSpecificSubmissions ? (
                                <div className="flex justify-center items-center py-20">
                                    <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-sm text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                            <tr>
                                                <th className="p-4 font-semibold">Student Name</th>
                                                <th className="p-4 font-semibold">Submitted At</th>
                                                <th className="p-4 font-semibold">Status/Marks</th>
                                                <th className="p-4 font-semibold">File</th>
                                                <th className="p-4 font-semibold text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {paginateData(assignmentSubmissionsList, 'specificSubmissions').map(s => (
                                                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                                                    <td className="p-4 font-medium text-slate-200">{s.studentName}</td>
                                                    <td className="p-4 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        {s.markAssigned !== null ? (
                                                            <span className="text-emerald-400 font-semibold">{s.markAssigned} / {viewingAssignmentSubmissions.marks}</span>
                                                        ) : (
                                                            <span className="text-amber-400 text-xs bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        {s.filePath ? <a href={s.filePath} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">View File</a> : <span className="text-slate-500">N/A</span>}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleOpenGrading(s)} className="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 text-xs font-medium rounded-md border border-emerald-800/80 transition cursor-pointer">
                                                            {s.markAssigned !== null ? 'Edit Grade' : 'Grade Task'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {assignmentSubmissionsList.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center">
                                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                                            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            <span className="text-sm">No submissions received yet for this assignment.</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    <Pagination
                                        totalItems={assignmentSubmissionsList.length}
                                        page={pageState.specificSubmissions.page}
                                        limit={pageState.specificSubmissions.limit}
                                        onPageChange={(p) => handlePageChange('specificSubmissions', p)}
                                        onLimitChange={(l) => handleLimitChange('specificSubmissions', l)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end shrink-0">
                            <button onClick={() => setViewingAssignmentSubmissions(null)} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition cursor-pointer">
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- View Class Students Modal --- */}
            {viewingStudentsClass && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/50 shrink-0">
                            <div>
                                <h3 className="text-base font-semibold text-slate-200">Enrolled Students: {viewingStudentsClass.className}</h3>
                                <p className="text-xs text-slate-400 mt-1">Room {viewingStudentsClass.roomNumber} • {viewingStudentsClass.studentCount} Students Total</p>
                            </div>
                            <button onClick={() => setViewingStudentsClass(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="overflow-x-auto rounded-lg border border-slate-800">
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                        <tr>
                                            <th className="p-4 font-semibold">Name</th>
                                            <th className="p-4 font-semibold">Roll No</th>
                                            <th className="p-4 font-semibold">Section</th>
                                            <th className="p-4 font-semibold">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                        {viewingStudentsClass.students && viewingStudentsClass.students.length > 0 ? (
                                            viewingStudentsClass.students.map(s => (
                                                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                                                    <td className="p-4 font-medium text-slate-200">{s.fullName}</td>
                                                    <td className="p-4 font-mono text-indigo-400">{s.rollNo || 'N/A'}</td>
                                                    <td className="p-4 text-slate-400">{s.section || 'N/A'}</td>
                                                    <td className="p-4 text-slate-400">{s.email || 'N/A'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                                        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                        <span className="text-sm">No students enrolled in this class yet.</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end shrink-0">
                            <button onClick={() => setViewingStudentsClass(null)} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition cursor-pointer">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Edit Assignment Modal --- */}
            {editingAssignment && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-2xl shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Edit Assignment</h3>
                                <p className="text-xs text-slate-400 mt-1">Update details for &quot;{editingAssignment.title}&quot;</p>
                            </div>
                            <button onClick={() => setEditingAssignment(null)} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleUpdateAssignment} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                                <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Target Class</label><select value={editClassId} onChange={(e) => setEditClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer" required><option value="" className="bg-slate-900 text-slate-400">Re-Select Class...</option>{myClasses.map((c) => (<option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">{c.className} (Room: {c.roomNumber})</option>))}</select></div>
                                <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label><select value={editSubjectId} onChange={(e) => setEditSubjectId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer" required><option value="" className="bg-slate-900 text-slate-400">Re-Select Subject...</option>{subjectList.map((s) => (<option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">{s.subjectName} ({s.subjectCode})</option>))}</select></div>
                            </div>
                            <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Description / Instructions</label><textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-2">
                                <div className="flex flex-wrap items-center gap-5 w-full sm:w-auto">
                                    <div className="w-32"><label className="block text-xs font-medium text-slate-400 mb-1.5">Total Marks</label><input type="number" value={editMarks} onChange={(e) => setEditMarks(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                                    <div className="w-48"><label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label><input type="date" value={editDueDate} min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]} onChange={(e) => setEditDueDate(e.target.value)} onClick={(e) => { if ('showPicker' in e.currentTarget) e.currentTarget.showPicker(); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer scheme-dark" required /></div>
                                    <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="editDraftCheck" checked={editIsDraft} onChange={(e) => setEditIsDraft(e.target.checked)} className="w-4 h-4 accent-indigo-600 rounded cursor-pointer" /><label htmlFor="editDraftCheck" className="text-sm text-slate-300 cursor-pointer select-none">Save as Draft</label></div>
                                </div>
                                <div className="flex justify-end gap-3 self-end">
                                    <button type="button" onClick={() => setEditingAssignment(null)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition cursor-pointer font-medium">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition cursor-pointer shadow-md shadow-indigo-600/20">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Grade Submission Modal --- */}
            {gradingSubmission && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Evaluate Submission</h3>
                                <p className="text-xs text-slate-400 mt-1">{gradingSubmission.studentName} - {gradingSubmission.assignmentTitle}</p>
                            </div>
                            <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                        </div>
                        <form onSubmit={handleSubmitGrade} className="space-y-4">
                            <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Marks Assigned</label><input type="number" value={givenMark} onChange={(e) => setGivenMark(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required /></div>
                            <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Teacher Feedback / Notes</label><textarea value={givenFeedback} onChange={(e) => setGivenFeedback(e.target.value)} placeholder="Provide constructive feedback for the student..." rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" /></div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setGradingSubmission(null)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-500 transition cursor-pointer">Save Grade</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}