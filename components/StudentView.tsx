import React from 'react'

export default function StudentView() {
    return (
        <div className="bg-slate-900/70 backdrop-blur-xl p-6 rounded-xl border border-slate-800 border-l-4 border-l-violet-500 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-bold text-violet-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                Student Portal
            </h2>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50 hover:border-violet-500/40 hover:bg-slate-800/80 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    View Class Assignments
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50 hover:border-violet-500/40 hover:bg-slate-800/80 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    Submit Homework / Assignments
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50 hover:border-violet-500/40 hover:bg-slate-800/80 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                    Check Marks and Feedback
                </li>
            </ul>
        </div>
    )
}
