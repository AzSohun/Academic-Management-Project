'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MyEnrolledClass, Assignment, Submission, StudentProfile, extractArrayData } from '@/interfaces/student';

import Overview from '@/components/student/Overview';
import ActiveAssignments from '@/components/student/ActiveAssignments';
import MyClass from '@/components/student/MyClass';
import Profile from '@/components/student/Profile';

import SubmitTask from '@/components/modals/student/SubmitTask';
import EditSubmission from '@/components/modals/student/EditSubmission';
import MySubmissions from '@/components/student/MySubmission';

export default function StudentView() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentTab = (searchParams.get('tab') as any) || 'overview';
    const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'submissions' | 'my-class' | 'profile'>(currentTab);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId as any);
        router.push(`${pathname}?tab=${tabId}`);
    };

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    // Master States
    const [enrolledClass, setEnrolledClass] = useState<MyEnrolledClass | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Modal States
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);

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

            if (classRes.status === 'fulfilled') setEnrolledClass(classRes.value.data?.data || classRes.value.data);
            if (assignmentsRes.status === 'fulfilled') setAssignments(extractArrayData(assignmentsRes.value));
            if (submissionsRes.status === 'fulfilled') setSubmissions(extractArrayData(submissionsRes.value));
            if (profileRes.status === 'fulfilled') setStudentProfile(profileRes.value.data?.data || profileRes.value.data);
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

    const pendingAssignmentsCount = useMemo(() => {
        return assignments.filter((a) => !submissions.some((s) => s.assignmentId === a.id)).length;
    }, [assignments, submissions]);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { id: 'assignments', label: 'Active Tasks', count: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : undefined, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
        { id: 'submissions', label: 'My Submissions & Grades', count: submissions.length, icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        { id: 'my-class', label: 'My Enrolled Class', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
        { id: 'profile', label: 'My Profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    ];

    return (
        <div className="h-full w-full bg-slate-950 text-slate-100 flex font-sans antialiased overflow-hidden selection:bg-violet-500 selection:text-white">
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
                                <button key={item.id} onClick={() => handleTabChange(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${active ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                                    <span>{item.icon}</span>
                                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                                    {isSidebarOpen && item.count !== undefined && <span className={`ml-auto px-2 py-0.5 rounded text-xs ${active ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{item.count}</span>}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="h-16 px-8 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <h1 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{activeTab.replace('-', ' ')}</h1>
                    <button onClick={fetchStudentData} disabled={loading} className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-sm font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer" title="Refresh Data">
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin text-violet-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Refresh
                    </button>
                </header>

                <main className="flex-1 p-8 w-full overflow-y-auto">
                    {activeTab === 'overview' && <Overview enrolledClass={enrolledClass} assignmentsTotal={assignments.length} pendingAssignmentsCount={pendingAssignmentsCount} submissionsTotal={submissions.length} handleTabChange={handleTabChange} />}
                    {activeTab === 'assignments' && <ActiveAssignments assignments={assignments} submissions={submissions} onOpenSubmitModal={setSelectedAssignment} />}
                    {activeTab === 'submissions' && <MySubmissions submissions={submissions} assignments={assignments} onOpenEditModal={setEditingSubmission} />}
                    {activeTab === 'my-class' && <MyClass enrolledClass={enrolledClass} />}
                    {activeTab === 'profile' && <Profile studentProfile={studentProfile} fetchStudentData={fetchStudentData} showStatus={showStatus} />}
                </main>
            </div>

            {selectedAssignment && <SubmitTask assignment={selectedAssignment} onClose={() => setSelectedAssignment(null)} onSuccess={() => { setSelectedAssignment(null); fetchStudentData(); }} showStatus={showStatus} />}
            {editingSubmission && <EditSubmission submission={editingSubmission} onClose={() => setEditingSubmission(null)} onSuccess={() => { setEditingSubmission(null); fetchStudentData(); }} showStatus={showStatus} />}
        </div>
    );
}