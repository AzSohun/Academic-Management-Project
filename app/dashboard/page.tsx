'use client';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-slate-400 text-sm mt-1 capitalize">{user?.role} Account</p>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-900/50 rounded-md hover:bg-red-600 hover:text-white transition-all font-medium"
                    >
                        Logout
                    </button>
                </div>

                {/* Role Based Section Views */}
                {user?.role === 'Admin' && <AdminView />}
                {user?.role === 'Teacher' && <TeacherView />}
                {user?.role === 'Student' && <StudentView />}
            </div>
        </div>
    );
}

function AdminView() {
    return (
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 border-l-4 border-l-blue-500 shadow-lg shadow-black/20">
            <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Admin Control Panel
            </h2>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Manage Users
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Assign Teachers to Classes
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    System Settings
                </li>
            </ul>
        </div>
    );
}

function TeacherView() {
    return (
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 border-l-4 border-l-emerald-500 shadow-lg shadow-black/20">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
                Teacher Portal
            </h2>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Create / Update Assignments
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Review Student Submissions
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Provide Feedback and Marks
                </li>
            </ul>
        </div>
    );
}

function StudentView() {
    return (
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 border-l-4 border-l-violet-500 shadow-lg shadow-black/20">
            <h2 className="text-xl font-bold text-violet-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
                Student Portal
            </h2>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    View Class Assignments
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    Submit Homework / Assignments
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    Check Marks and Feedback
                </li>
            </ul>
        </div>
    );
}