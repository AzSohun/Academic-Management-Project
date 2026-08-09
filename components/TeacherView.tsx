import React from 'react'

export default function TeacherView() {
    return (
        <div className="bg-slate-900/70 backdrop-blur-xl p-6 rounded-xl border border-slate-800 border-l-4 border-l-emerald-500 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
                Teacher Portal
            </h2>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Create / Update Assignments
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Review Student Submissions
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Provide Feedback and Marks
                </li>
            </ul>
        </div>
    )
}
