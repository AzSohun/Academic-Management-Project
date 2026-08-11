'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';

// --- Types ---
interface ClassDetails {
    id: string;
    className: string;
    roomNumber: string;
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
    status: string; // 'Submitted' | 'Graded' | 'Late' | 'Pending'
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

export default function StudentView() {
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'submissions' | 'my-class'>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [enrolledClass, setEnrolledClass] = useState<ClassDetails | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // --- Submit Assignment Modal State ---
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [filePathInput, setFilePathInput] = useState('');
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        setLoading(true);
        try {
            const [classRes, assignmentsRes, submissionsRes] = await Promise.allSettled([
                api.get('/student/my-class'),
                api.get('/student/assignments'),
                api.get('/student/my-submissions'),
            ]);

            if (classRes.status === 'fulfilled') setEnrolledClass(classRes.value.data);
            if (assignmentsRes.status === 'fulfilled') setAssignments(extractArrayData(assignmentsRes.value));
            if (submissionsRes.status === 'fulfilled') setSubmissions(extractArrayData(submissionsRes.value));
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

    // Check if an assignment is already submitted
    const isSubmitted = (assignmentId: string) => {
        return submissions.some((s) => s.assignmentId === assignmentId);
    };

    // Filter pending assignments for student
    const pendingAssignmentsCount = useMemo(() => {
        return assignments.filter((a) => !isSubmitted(a.id)).length;
    }, [assignments, submissions]);

    // --- Open Submit Task Modal ---
    const handleOpenSubmitModal = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setFilePathInput('');
    };

    // --- Handle File/Task Submission ---
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
                customClass: {
                    popup: 'border border-slate-800 rounded-xl',
                    title: 'text-sm font-bold text-white',
                    htmlContainer: 'text-xs text-slate-400',
                }
            });

            setSelectedAssignment(null);
            setFilePathInput('');
            fetchStudentData();
        } catch {
            showStatus('error', 'Failed to submit assignment. Try again.');
        } finally {
            setIsSubmittingTask(false);
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
            label: 'Active Tasks',
            count: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : undefined,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            id: 'submissions',
            label: 'My Submissions & Grades',
            count: submissions.length,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
        },
        {
            id: 'my-class',
            label: 'My Enrolled Class',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
    ];

    return (
        <div className="h-full w-full bg-slate-950 text-slate-100 flex font-sans antialiased overflow-hidden selection:bg-violet-500 selection:text-white">
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
                            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                S
                            </div>
                            {isSidebarOpen && <span className="font-semibold text-xs tracking-wide text-white">Student Portal</span>}
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
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
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${active ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                                    {isSidebarOpen && item.count !== undefined && (
                                        <span
                                            className={`ml-auto px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-400'
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
                        onClick={fetchStudentData}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-xs font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        title="Refresh Data"
                    >
                        <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-violet-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </header>

                {/* Dashboard Workspace */}
                <main className="flex-1 p-6 space-y-6 w-full overflow-y-auto">
                    {/* --- TAB 1: OVERVIEW --- */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Class Enrolled</p>
                                    <h3 className="text-lg font-bold text-violet-400 mt-1 truncate">
                                        {enrolledClass ? enrolledClass.className : 'Not Assigned'}
                                    </h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">
                                        {enrolledClass ? `Room: ${enrolledClass.roomNumber}` : 'Contact Administrator'}
                                    </span>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Active Tasks</p>
                                    <h3 className="text-2xl font-bold text-indigo-400 mt-1">{assignments.length}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">Class Coursework</span>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Pending Tasks</p>
                                    <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingAssignmentsCount}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">To Be Submitted</span>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <p className="text-[11px] font-medium text-slate-400">Completed Works</p>
                                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">{submissions.length}</h3>
                                    <span className="text-[10px] text-slate-500 block mt-2">Submitted Homeworks</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => setActiveTab('assignments')}
                                    className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition"
                                >
                                    <h3 className="font-semibold text-xs text-violet-300">View Active Assignments &rarr;</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">Check pending homework due dates and submit your solutions.</p>
                                </div>

                                <div
                                    onClick={() => setActiveTab('submissions')}
                                    className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition"
                                >
                                    <h3 className="font-semibold text-xs text-emerald-300">Check Marks & Feedback &rarr;</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">Review assigned grades and comments left by your teachers.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: ACTIVE ASSIGNMENTS --- */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-3">
                                <h3 className="text-xs font-semibold text-slate-200">Class Assignments</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Title</th>
                                                <th className="p-3">Subject</th>
                                                <th className="p-3">Teacher</th>
                                                <th className="p-3">Total Marks</th>
                                                <th className="p-3">Due Date</th>
                                                <th className="p-3 text-right">Status / Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {assignments.map((a) => {
                                                const done = isSubmitted(a.id);
                                                return (
                                                    <tr key={a.id} className="hover:bg-slate-800/30 transition">
                                                        <td className="p-3 font-medium text-slate-200">
                                                            <div>{a.title}</div>
                                                            <p className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-1">{a.description}</p>
                                                        </td>
                                                        <td className="p-3 text-slate-400">{a.subjectName || 'General'}</td>
                                                        <td className="p-3 text-slate-400">{a.teacherName || 'Faculty'}</td>
                                                        <td className="p-3 text-slate-300 font-semibold">{a.marks}</td>
                                                        <td className="p-3 text-slate-400">{a.dueDate}</td>
                                                        <td className="p-3 text-right">
                                                            {done ? (
                                                                <span className="px-2.5 py-1 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                                                                    Submitted
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleOpenSubmitModal(a)}
                                                                    className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-medium rounded transition cursor-pointer shadow-md shadow-violet-600/20"
                                                                >
                                                                    Submit Task
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {assignments.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-4 text-center text-slate-500">
                                                        No active assignments for your class right now.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 3: SUBMISSIONS & GRADES --- */}
                    {activeTab === 'submissions' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-3">
                                <h3 className="text-xs font-semibold text-slate-200">My Uploaded Submissions & Grades</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-left text-xs text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Assignment</th>
                                                <th className="p-3">Submitted At</th>
                                                <th className="p-3">My File</th>
                                                <th className="p-3">Grade Assigned</th>
                                                <th className="p-3">Teacher Feedback</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                            {submissions.map((s) => (
                                                <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                                    <td className="p-3 font-medium text-slate-200">{s.assignmentTitle}</td>
                                                    <td className="p-3 text-slate-400">{new Date(s.submissionDate).toLocaleDateString()}</td>
                                                    <td className="p-3">
                                                        {s.filePath ? (
                                                            <a href={s.filePath} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline">
                                                                View File
                                                            </a>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {s.markAssigned !== null ? (
                                                            <span className="text-emerald-400 font-bold text-xs">{s.markAssigned}</span>
                                                        ) : (
                                                            <span className="text-amber-400 text-[10px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">Pending Review</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-slate-400 italic">
                                                        {s.teacherFeedback ? `"${s.teacherFeedback}"` : 'No feedback yet'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {submissions.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-slate-500">
                                                        You haven&apos;t submitted any assignments yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 4: MY CLASS --- */}
                    {activeTab === 'my-class' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4 max-w-xl">
                                <h3 className="text-xs font-semibold text-slate-200 border-b border-slate-800 pb-2">Enrolled Classroom Profile</h3>
                                {enrolledClass ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                                            <span className="text-xs text-slate-400">Class Name</span>
                                            <span className="text-xs font-semibold text-white">{enrolledClass.className}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                                            <span className="text-xs text-slate-400">Room Number</span>
                                            <span className="text-xs font-semibold text-white">{enrolledClass.roomNumber}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        You are currently not assigned to any class. Please contact the administrator.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* --- Submit Task Modal --- */}
            {selectedAssignment && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <div>
                                <h3 className="text-xs font-semibold text-slate-200">Submit Assignment</h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">{selectedAssignment.title}</p>
                            </div>
                            <button
                                onClick={() => setSelectedAssignment(null)}
                                className="text-slate-400 hover:text-white text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleTaskSubmission} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-400 mb-1">File Link / Path / Drive URL</label>
                                <input
                                    type="text"
                                    value={filePathInput}
                                    onChange={(e) => setFilePathInput(e.target.value)}
                                    placeholder="e.g. https://drive.google.com/file/... or github link"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAssignment(null)}
                                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-md text-xs hover:bg-slate-700 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingTask}
                                    className="px-4 py-1.5 bg-violet-600 text-white rounded-md text-xs font-medium hover:bg-violet-500 transition cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingTask ? 'Uploading...' : 'Confirm Submission'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}