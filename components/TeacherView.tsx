'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';

// --- Types ---
interface MyClass {
    id: string;
    className: string;
    roomNumber: string;
    subjectName?: string;
    subjectCode?: string;
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
    status: string; // 'Submitted' | 'Graded' | 'Late'
    studentName: string;
    assignmentId: string;
    assignmentTitle: string;
}

const extractArrayData = (res: any) => {
    if (!res) return [];
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.$values)) return data.$values;
    return [];
};

export default function TeacherView() {
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'submissions' | 'classes'>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [myClasses, setMyClasses] = useState<MyClass[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // --- Create Assignment Form State ---
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newMarks, setNewMarks] = useState<number>(100);
    const [newDueDate, setNewDueDate] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [isDraft, setIsDraft] = useState(false);

    // --- Grading Modal State ---
    const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
    const [givenMark, setGivenMark] = useState<number>(0);
    const [givenFeedback, setGivenFeedback] = useState<string>('');

    // --- Filter Submissions ---
    const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'graded'>('all');

    useEffect(() => {
        fetchTeacherData();
    }, []);

    const fetchTeacherData = async () => {
        setLoading(true);
        try {
            const [classesRes, assignmentsRes, submissionsRes] = await Promise.allSettled([
                api.get('/teacher/classes'),
                api.get('/teacher/assignments'),
                api.get('/teacher/submissions'),
            ]);

            if (classesRes.status === 'fulfilled') setMyClasses(extractArrayData(classesRes.value));
            if (assignmentsRes.status === 'fulfilled') setAssignments(extractArrayData(assignmentsRes.value));
            if (submissionsRes.status === 'fulfilled') setSubmissions(extractArrayData(submissionsRes.value));
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

    // Pending Submissions Counter
    const pendingSubmissionsCount = useMemo(() => {
        return submissions.filter((s) => s.markAssigned === null || s.status.toLowerCase() === 'submitted').length;
    }, [submissions]);

    // Filtered Submissions List
    const filteredSubmissions = useMemo(() => {
        return submissions.filter((s) => {
            if (submissionFilter === 'pending') return s.markAssigned === null || s.status.toLowerCase() === 'submitted';
            if (submissionFilter === 'graded') return s.markAssigned !== null || s.status.toLowerCase() === 'graded';
            return true;
        });
    }, [submissions, submissionFilter]);

    // --- Create Assignment Handler ---
    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClassId) {
            showStatus('error', 'Please select a class for the assignment.');
            return;
        }

        try {
            await api.post('/teacher/assignments', {
                title: newTitle,
                description: newDescription,
                marks: Number(newMarks),
                dueDate: newDueDate,
                isDraft,
                classDetailsId: selectedClassId,
            });

            showStatus('success', `Assignment "${newTitle}" created successfully!`);
            setNewTitle('');
            setNewDescription('');
            setNewMarks(100);
            setNewDueDate('');
            setSelectedClassId('');
            setIsDraft(false);
            fetchTeacherData();
        } catch {
            showStatus('error', 'Failed to create assignment.');
        }
    };

    // --- SweetAlert2 Delete Assignment Handler ---
    const handleDeleteAssignment = async (assignment: Assignment) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you really want to delete "${assignment.title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel',
            background: '#0f172a',
            color: '#f8fafc',
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#334155',
            customClass: {
                popup: 'border border-slate-800 rounded-xl shadow-2xl',
                title: 'text-sm font-bold text-white',
                htmlContainer: 'text-xs text-slate-400',
            }
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/teacher/assignments/${assignment.id}`);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Assignment has been deleted.',
                    icon: 'success',
                    background: '#0f172a',
                    color: '#f8fafc',
                    confirmButtonColor: '#10b981',
                    customClass: {
                        popup: 'border border-slate-800 rounded-xl',
                        title: 'text-sm font-bold text-white',
                        htmlContainer: 'text-xs text-slate-400',
                    }
                });
                fetchTeacherData();
            } catch {
                showStatus('error', 'Could not delete assignment.');
            }
        }
    };

    // --- Open Grade Modal ---
    const handleOpenGrading = (sub: Submission) => {
        setGradingSubmission(sub);
        setGivenMark(sub.markAssigned ?? 0);
        setGivenFeedback(sub.teacherFeedback ?? '');
    };

    // --- Submit Grade Handler ---
    const handleSubmitGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gradingSubmission) return;

        try {
            await api.post(`/teacher/submissions/${gradingSubmission.id}/grade`, {
                markAssigned: Number(givenMark),
                teacherFeedback: givenFeedback,
            });

            showStatus('success', 'Grade & Feedback updated successfully!');
            setGradingSubmission(null);
            fetchTeacherData();
        } catch {
            showStatus('error', 'Failed to submit grade.');
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
            id: 'assignments',
            label: 'Assignments',
            count: assignments.length,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            id: 'submissions',
            label: 'Submissions & Grading',
            count: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : undefined,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
        {
            id: 'classes',
            label: 'My Classes',
            count: myClasses.length,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
    ];

    return (
        <div className="h-full w-full bg-slate-950 text-slate-100 flex font-sans antialiased overflow-hidden selection:bg-emerald-500 selection:text-white">
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
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                T
                            </div>
                            {isSidebarOpen && <span className="font-semibold text-xs tracking-wide text-white">Faculty Portal</span>}
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
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                                    {isSidebarOpen && item.count !== undefined && (
                                        <span
                                            className={`ml-auto px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
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
                        onClick={fetchTeacherData}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-xs font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        title="Refresh Data"
                    >
                        <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </header>

                {/* Workspace Content */}
                <main className="flex-1 p-6 space-y-6 w-full overflow-y-auto">
                    {/* --- TAB 1: OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Assigned Classes</p>
                                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">{myClasses.length}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">Active Classrooms</span>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Total Assignments</p>
                                    <h3 className="text-2xl font-bold text-indigo-400 mt-1">{assignments.length}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">Created Coursework</span>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Pending Submissions</p>
                                    <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingSubmissionsCount}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">Requires Grading</span>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Graded Answers</p>
                                    <h3 className="text-2xl font-bold text-purple-400 mt-1">{submissions.length - pendingSubmissionsCount}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">Completed Reviews</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => setActiveTab('assignments')}
                                    className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition"
                                >
                                    <h3 className="font-semibold text-xs text-emerald-300">Create & Manage Assignments &rarr;</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">Publish new assignments or edit deadlines for your classes.</p>
                                </div>

                                <div
                                    onClick={() => setActiveTab('submissions')}
                                    className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition"
                                >
                                    <h3 className="font-semibold text-xs text-amber-300">Grade Student Submissions &rarr;</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">Evaluate uploaded homework, assign marks and provide direct feedback.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: ASSIGNMENTS (CREATE & LIST) --- */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-6">
                            {/* Create Assignment Form */}
                            {/* Create Assignment Form */}
                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                <h3 className="text-xs font-semibold text-slate-200">Create New Assignment</h3>
                                <form onSubmit={handleCreateAssignment} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-400 mb-1">Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Midterm Homework 01"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Class</label>
                                            <select
                                                value={selectedClassId}
                                                onChange={(e) => setSelectedClassId(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                                required
                                            >
                                                <option value="">Select Class...</option>
                                                {myClasses.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.className} (Room: {c.roomNumber})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Description / Instructions</label>
                                        <textarea
                                            placeholder="Write task details or submission requirements..."
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            rows={2}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                            required
                                        />
                                    </div>

                                    {/* Dynamic Compact Bottom Bar */}
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                                        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                                            <div className="w-28">
                                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Total Marks</label>
                                                <input
                                                    type="number"
                                                    value={newMarks}
                                                    onChange={(e) => setNewMarks(Number(e.target.value))}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                                    required
                                                />
                                            </div>

                                            <div className="w-40">
                                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Due Date</label>
                                                <input
                                                    type="date"
                                                    value={newDueDate}
                                                    onChange={(e) => setNewDueDate(e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                                    required
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 pt-5">
                                                <input
                                                    type="checkbox"
                                                    id="draftCheck"
                                                    checked={isDraft}
                                                    onChange={(e) => setIsDraft(e.target.checked)}
                                                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                                                />
                                                <label htmlFor="draftCheck" className="text-xs text-slate-300 cursor-pointer select-none">
                                                    Save as Draft
                                                </label>
                                            </div>
                                        </div>

                                        {/* Compact Clean Action Button */}
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition cursor-pointer shadow-md shadow-emerald-600/20 shrink-0 self-end"
                                        >
                                            {isDraft ? 'Save Draft' : 'Publish Assignment'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Created Assignments List */}
                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-3">
                                <h3 className="text-xs font-semibold text-slate-200">Your Assignments ({assignments.length})</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Title</th>
                                                <th className="p-3">Class</th>
                                                <th className="p-3">Marks</th>
                                                <th className="p-3">Due Date</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {assignments.map((a) => (
                                                <tr key={a.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 font-medium text-slate-200">{a.title}</td>
                                                    <td className="p-3 text-slate-400">{a.className || 'N/A'}</td>
                                                    <td className="p-3 text-slate-300">{a.marks}</td>
                                                    <td className="p-3 text-slate-400">{a.dueDate}</td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${a.isDraft
                                                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                                                }`}
                                                        >
                                                            {a.isDraft ? 'Draft' : 'Published'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={() => handleDeleteAssignment(a)}
                                                            className="px-2 py-1 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-[10px] font-medium rounded border border-rose-800/80 transition cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {assignments.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-slate-500">
                                                        No assignments created yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 3: SUBMISSIONS & GRADING --- */}
                    {activeTab === 'submissions' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <h3 className="text-xs font-semibold text-slate-200">Student Submissions & Evaluation</h3>
                                    <div className="flex gap-1">
                                        {(['all', 'pending', 'graded'] as const).map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => setSubmissionFilter(filter)}
                                                className={`px-3 py-1 rounded-md text-xs font-medium capitalize border transition cursor-pointer ${submissionFilter === filter
                                                    ? 'bg-emerald-600 text-white border-emerald-500'
                                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                                                    }`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Student</th>
                                                <th className="p-3">Assignment</th>
                                                <th className="p-3">Submitted At</th>
                                                <th className="p-3">Marks</th>
                                                <th className="p-3">File</th>
                                                <th className="p-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {filteredSubmissions.map((s) => (
                                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 font-medium text-slate-200">{s.studentName}</td>
                                                    <td className="p-3 text-slate-400">{s.assignmentTitle}</td>
                                                    <td className="p-3 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td>
                                                    <td className="p-3">
                                                        {s.markAssigned !== null ? (
                                                            <span className="text-emerald-400 font-semibold">{s.markAssigned}</span>
                                                        ) : (
                                                            <span className="text-amber-400 text-[10px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">Pending</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {s.filePath ? (
                                                            <a href={s.filePath} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                                                                View File
                                                            </a>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        <button
                                                            onClick={() => handleOpenGrading(s)}
                                                            className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 text-[10px] font-medium rounded border border-emerald-800/80 transition cursor-pointer"
                                                        >
                                                            {s.markAssigned !== null ? 'Edit Grade' : 'Grade Task'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredSubmissions.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-slate-500">
                                                        No submissions match your filter criteria.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 4: MY CLASSES --- */}
                    {activeTab === 'classes' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                                <h3 className="text-xs font-semibold text-slate-200">Your Assigned Classes ({myClasses.length})</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {myClasses.map((c) => (
                                        <div key={c.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold text-xs text-slate-200">{c.className}</h4>
                                                <p className="text-[10px] text-slate-400 mt-1">Room: {c.roomNumber}</p>
                                                {c.subjectName && (
                                                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                                                        {c.subjectName} ({c.subjectCode})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {myClasses.length === 0 && (
                                        <p className="text-xs text-slate-500 col-span-full">
                                            No classes assigned to you yet by the administrator.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* --- Grade Submission Modal --- */}
            {gradingSubmission && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="text-xs font-semibold text-slate-200">Evaluate Submission</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">{gradingSubmission.studentName} - {gradingSubmission.assignmentTitle}</p>
                            </div>
                            <button
                                onClick={() => setGradingSubmission(null)}
                                className="text-slate-400 hover:text-white text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmitGrade} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Marks Assigned</label>
                                <input
                                    type="number"
                                    value={givenMark}
                                    onChange={(e) => setGivenMark(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">Teacher Feedback / Notes</label>
                                <textarea
                                    value={givenFeedback}
                                    onChange={(e) => setGivenFeedback(e.target.value)}
                                    placeholder="Provide constructive feedback for the student..."
                                    rows={3}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setGradingSubmission(null)}
                                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-md text-xs hover:bg-slate-700 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-500 transition cursor-pointer"
                                >
                                    Save Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}