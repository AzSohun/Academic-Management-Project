'use client';

import { useAuth } from '@/context/AuthContext';
import Admin from './admin/page';
import Student from './student/page';
import Teacher from './teacher/page';

const ROLE_STYLES = {
    Admin: { accent: 'bg-blue-500', text: 'text-blue-400', ring: 'ring-blue-500/30', glow: 'bg-blue-500/10' },
    Teacher: { accent: 'bg-emerald-500', text: 'text-emerald-400', ring: 'ring-emerald-500/30', glow: 'bg-emerald-500/10' },
    Student: { accent: 'bg-violet-500', text: 'text-violet-400', ring: 'ring-violet-500/30', glow: 'bg-violet-500/10' },
} as const;

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const role = (user?.role as keyof typeof ROLE_STYLES) ?? 'Student';
    const styles = ROLE_STYLES[role] ?? ROLE_STYLES.Student;

    const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??';

    return (
        <div className="h-screen w-screen bg-[#080c14] text-slate-200 antialiased select-none flex flex-col overflow-hidden">
            <header className="relative border-b border-slate-800/80 bg-[#0d1322]/90 backdrop-blur-md shrink-0 z-30">
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${styles.accent}`} />
                <div className="w-full px-6 py-2.5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-slate-100 tracking-tight leading-none">
                                Academic Management
                            </h1>
                            <span className={`text-[11px] font-medium ${styles.text} capitalize`}>
                                {role} Workspace
                            </span>
                        </div>
                    </div>

                    {/* User Profile & Sign Out */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">{user?.email}</span>
                        <div
                            className={`h-8 w-8 rounded-full ${styles.glow} ring-1 ${styles.ring} flex items-center justify-center text-xs font-bold ${styles.text}`}
                        >
                            {initials}
                        </div>
                        <button
                            onClick={logout}
                            className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>


            <main className="flex-1 w-full overflow-y-auto">
                {role === 'Admin' && <Admin />}
                {role === 'Teacher' && <Teacher />}
                {role === 'Student' && <Student />}
            </main>
        </div>
    );
}