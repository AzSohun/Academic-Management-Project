'use client';

import AdminView from '@/components/AdminView';
import StudentView from '@/components/StudentView';
import TeacherView from '@/components/TeacherView';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 p-8">
            {/* Ambient glow blobs */}
            <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

            <div className="relative z-10 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-linear-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
                            Dashboard
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 capitalize">{user?.role} Account</p>
                    </div>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600/10 text-red-400 border border-red-900/50 rounded-md hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 font-medium"
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

