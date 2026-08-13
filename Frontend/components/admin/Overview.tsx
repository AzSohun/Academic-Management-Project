import React from 'react';

interface OverviewProps {
    usersTotal: number;
    classesTotal: number;
    subjectsTotal: number;
    assignmentsTotal: number;
    submissionsTotal: number;
    handleTabChange: (tabId: string) => void;
}

export default function Overview({ usersTotal, classesTotal, subjectsTotal, assignmentsTotal, submissionsTotal, handleTabChange }: OverviewProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400">Total System Users</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{usersTotal}</h3>
                    <span className="text-[11px] text-slate-500 block mt-2">Admins, Teachers, Students</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400">Active Classes</p>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">{classesTotal}</h3>
                    <span className="text-[11px] text-slate-500 block mt-2">{subjectsTotal} Subjects Registered</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400">Assignments</p>
                    <h3 className="text-2xl font-bold text-amber-400 mt-1">{assignmentsTotal}</h3>
                    <span className="text-[11px] text-slate-500 block mt-2">Drafts & Published</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400">Submissions</p>
                    <h3 className="text-2xl font-bold text-purple-400 mt-1">{submissionsTotal}</h3>
                    <span className="text-[11px] text-slate-500 block mt-2">Completed Work</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => handleTabChange('users')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition">
                    <h3 className="font-semibold text-sm text-indigo-300">User Allocations &rarr;</h3>
                    <p className="text-xs text-slate-400 mt-1">Assign students to classes or link teachers to courses.</p>
                </div>
                <div onClick={() => handleTabChange('classes')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition">
                    <h3 className="font-semibold text-sm text-emerald-300">Classes & Subjects &rarr;</h3>
                    <p className="text-xs text-slate-400 mt-1">Add new academic sections, room numbers and subject codes.</p>
                </div>
            </div>
        </div>
    );
}