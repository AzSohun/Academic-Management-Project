'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { StudentOption, TeacherOption, ClassOption, SubjectOption, Assignment, Submission, TeacherDetailed, StudentDetailed, extractArrayData } from '@/interfaces/admin';

// Import the sub-components
import Overview from '@/components/admin/Overview';
import AcademicManagement from '@/components/admin/AcademicManagement';
import TeacherManagement from '@/components/admin/TeacherManagement';
import StudentManagement from '@/components/admin/StudentManagement';
import ClassesAndSubjects from '@/components/admin/ClassesAndSubjects';
import AssignmentsAndSubmissions from '@/components/admin/AssignmentsAndSubmissions';

export default function AdminView() {
    const { user: currentUser } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentTab = (searchParams.get('tab') as any) || 'overview';
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'teachers' | 'students' | 'classes' | 'assignments'>(currentTab);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId as any);
        router.push(`${pathname}?tab=${tabId}`);
    };

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) setActiveTab(tab as any);
    }, [searchParams]);

    // Master States
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
    const [usersTotal, setUsersTotal] = useState(0);

    const showStatus = (type: 'success' | 'error', text: string) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg(null), 4000);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [
                studentsRes, teachersRes, classesRes, subjectsRes, assignmentsRes, submissionsRes,
                detailedTeachersRes, detailedStudentsRes, basicUsersRes
            ] = await Promise.allSettled([
                api.get('/admin/students'), api.get('/admin/teachers'), api.get('/admin/classes'),
                api.get('/admin/subjects'), api.get('/admin/assignments'), api.get('/admin/submissions'),
                api.get('/admin/teachers-detailed'), api.get('/admin/students-detailed'), api.get('/admin/users?pageSize=1')
            ]);

            if (studentsRes.status === 'fulfilled') setStudentsList(extractArrayData(studentsRes.value));
            if (teachersRes.status === 'fulfilled') setTeachersList(extractArrayData(teachersRes.value));
            if (classesRes.status === 'fulfilled') setClassList(extractArrayData(classesRes.value));
            if (subjectsRes.status === 'fulfilled') setSubjectList(extractArrayData(subjectsRes.value));
            if (assignmentsRes.status === 'fulfilled') setAssignments(extractArrayData(assignmentsRes.value));
            if (submissionsRes.status === 'fulfilled') setSubmissions(extractArrayData(submissionsRes.value));
            if (detailedTeachersRes.status === 'fulfilled') setDetailedTeachers(extractArrayData(detailedTeachersRes.value));
            if (detailedStudentsRes.status === 'fulfilled') setDetailedStudents(extractArrayData(detailedStudentsRes.value));
            if (basicUsersRes.status === 'fulfilled') setUsersTotal(basicUsersRes.value.data.totalCount ?? 0);
        } catch {
            showStatus('error', 'Failed to load system data');
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
        { id: 'users', label: 'Academic', count: usersTotal, icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
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
                                <button key={item.id} onClick={() => handleTabChange(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
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

                <main className="flex-1 p-6 w-full overflow-y-auto">
                    {activeTab === 'overview' && <Overview usersTotal={usersTotal} classesTotal={classList.length} subjectsTotal={subjectList.length} assignmentsTotal={assignments.length} submissionsTotal={submissions.length} handleTabChange={handleTabChange} />}
                    {activeTab === 'users' && <AcademicManagement currentUser={currentUser} studentsList={studentsList} teachersList={teachersList} classList={classList} subjectList={subjectList} fetchDashboardData={fetchDashboardData} showStatus={showStatus} />}
                    {activeTab === 'teachers' && <TeacherManagement detailedTeachers={detailedTeachers} classList={classList} subjectList={subjectList} fetchDashboardData={fetchDashboardData} showStatus={showStatus} />}
                    {activeTab === 'students' && <StudentManagement detailedStudents={detailedStudents} classList={classList} fetchDashboardData={fetchDashboardData} showStatus={showStatus} />}
                    {activeTab === 'classes' && <ClassesAndSubjects classList={classList} subjectList={subjectList} fetchDashboardData={fetchDashboardData} showStatus={showStatus} />}
                    {activeTab === 'assignments' && <AssignmentsAndSubmissions assignments={assignments} submissions={submissions} />}
                </main>
            </div>
        </div>
    );
}