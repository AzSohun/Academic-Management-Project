import React from 'react'

export default function AdminView() {
    return (
        <div className="bg-slate-900/70 backdrop-blur-xl p-6 rounded-xl border border-slate-800 border-l-4 border-l-blue-500 shadow-2xl shadow-black/30">
            <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Admin Control Panel
            </h2>
            <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50 hover:border-blue-500/40 hover:bg-slate-800/80 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Manage Users
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50 hover:border-blue-500/40 hover:bg-slate-800/80 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Assign Teachers to Classes
                </li>
                <li className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-md border border-slate-700/50 hover:border-blue-500/40 hover:bg-slate-800/80 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    System Settings
                </li>
            </ul>
        </div>
    )
}
