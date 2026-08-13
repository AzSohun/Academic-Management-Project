import React from 'react';

interface OverviewProps {
    totalClasses: number;
    totalAssignments: number;
    pendingSubmissionsCount: number;
    gradedSubmissionsCount: number;
    handleTabChange: (tabId: string) => void;
}

export default function Overview({ totalClasses, totalAssignments, pendingSubmissionsCount, gradedSubmissionsCount, handleTabChange }: OverviewProps) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-slate-400">Assigned Classes</p>
                    <h3 className="text-3xl font-bold text-emerald-400 mt-2">{totalClasses}</h3>
                    <span className="text-xs text-slate-500 block mt-2">Active Classrooms</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-slate-400">Total Assignments</p>
                    <h3 className="text-3xl font-bold text-indigo-400 mt-2">{totalAssignments}</h3>
                    <span className="text-xs text-slate-500 block mt-2">Created Coursework</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-slate-400">Pending Submissions</p>
                    <h3 className="text-3xl font-bold text-amber-400 mt-2">{pendingSubmissionsCount}</h3>
                    <span className="text-xs text-slate-500 block mt-2">Requires Grading</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-slate-400">Graded Answers</p>
                    <h3 className="text-3xl font-bold text-purple-400 mt-2">{gradedSubmissionsCount}</h3>
                    <span className="text-xs text-slate-500 block mt-2">Completed Reviews</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => handleTabChange('assignments')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-6 rounded-xl transition">
                    <h3 className="font-semibold text-sm text-emerald-300">Create & Manage Assignments &rarr;</h3>
                    <p className="text-sm text-slate-400 mt-2">Publish new assignments or edit deadlines for your classes.</p>
                </div>
                <div onClick={() => handleTabChange('submissions')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-6 rounded-xl transition">
                    <h3 className="font-semibold text-sm text-amber-300">Grade Student Submissions &rarr;</h3>
                    <p className="text-sm text-slate-400 mt-2">Evaluate uploaded homework, assign marks and provide direct feedback.</p>
                </div>
            </div>
        </div>
    );
}