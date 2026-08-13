import React from 'react';
import { MyEnrolledClass } from '@/interfaces/student';

interface OverviewProps {
    enrolledClass: MyEnrolledClass | null;
    assignmentsTotal: number;
    pendingAssignmentsCount: number;
    submissionsTotal: number;
    handleTabChange: (tabId: string) => void;
}

export default function Overview({ enrolledClass, assignmentsTotal, pendingAssignmentsCount, submissionsTotal, handleTabChange }: OverviewProps) {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-slate-400">Class Enrolled</p>
                    <h3 className="text-2xl font-bold text-violet-400 mt-2 truncate">{enrolledClass ? enrolledClass.className : 'Not Assigned'}</h3>
                    <span className="text-xs text-slate-500 block mt-2">{enrolledClass ? `Room: ${enrolledClass.roomNumber}` : 'Contact Administrator'}</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-slate-400">Active Tasks</p>
                    <h3 className="text-3xl font-bold text-indigo-400 mt-2">{assignmentsTotal}</h3>
                    <span className="text-xs text-slate-500 block mt-2">Class Coursework</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-slate-400">Pending Tasks</p>
                    <h3 className="text-3xl font-bold text-amber-400 mt-2">{pendingAssignmentsCount}</h3>
                    <span className="text-xs text-slate-500 block mt-2">To Be Submitted</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-slate-400">Completed Works</p>
                    <h3 className="text-3xl font-bold text-emerald-400 mt-2">{submissionsTotal}</h3>
                    <span className="text-xs text-slate-500 block mt-2">Submitted Homeworks</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div onClick={() => handleTabChange('assignments')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-6 rounded-xl transition">
                    <h3 className="font-semibold text-sm text-violet-300">View Active Assignments &rarr;</h3>
                    <p className="text-sm text-slate-400 mt-2">Check pending homework due dates and submit your solutions.</p>
                </div>
                <div onClick={() => handleTabChange('submissions')} className="cursor-pointer bg-slate-900/40 border border-slate-800 hover:border-slate-700 p-6 rounded-xl transition">
                    <h3 className="font-semibold text-sm text-emerald-300">Check Marks & Feedback &rarr;</h3>
                    <p className="text-sm text-slate-400 mt-2">Review assigned grades and comments left by your teachers.</p>
                </div>
            </div>
        </div>
    );
}