import React from 'react';
import { MyEnrolledClass } from '@/interfaces/student';

interface MyClassProps {
    enrolledClass: MyEnrolledClass | null;
}

export default function MyClass({ enrolledClass }: MyClassProps) {
    if (!enrolledClass) {
        return (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <svg className="w-16 h-16 text-slate-700 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                <p className="text-lg text-slate-300 font-semibold tracking-tight">No Class Assigned</p>
                <p className="text-sm text-slate-500 mt-2 max-w-sm text-center">You are currently not assigned to any academic class. Please contact the system administrator to update your enrollment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600"></div>
                <div>
                    <h2 className="text-2xl font-bold text-violet-400 tracking-tight">{enrolledClass.className}</h2>
                    <p className="text-sm text-slate-400 mt-1.5">Room Number: <span className="text-slate-300 font-medium">{enrolledClass.roomNumber}</span></p>
                </div>
                <div className="shrink-0">
                    <div className="bg-violet-950/40 border border-violet-800/50 px-5 py-2.5 rounded-xl shadow-inner text-center">
                        <p className="text-[10px] text-violet-300/80 uppercase font-semibold tracking-wider mb-0.5">Total Classmates</p>
                        <p className="text-2xl font-bold text-violet-300">{enrolledClass.classmates?.length || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-200">Enrolled Subjects</h3>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                        <ul className="divide-y divide-slate-800/60">
                            {enrolledClass.subjects?.length > 0 ? (
                                enrolledClass.subjects.map(sub => (
                                    <li key={sub.id} className="p-5 flex justify-between items-center hover:bg-slate-800/30 transition">
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{sub.subjectName}</p>
                                            <p className="text-xs text-slate-500 font-mono mt-1">{sub.subjectCode}</p>
                                        </div>
                                        {sub.activeAssignments > 0 ? (
                                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap shadow-sm shadow-amber-900/20">
                                                {sub.activeAssignments} Due
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-400 whitespace-nowrap border border-slate-700/50">
                                                0 Due
                                            </span>
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li className="p-6 text-center text-sm text-slate-500 italic">No subjects assigned to this class yet.</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="xl:col-span-2 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-200">Classmates Directory</h3>
                    <div className="overflow-x-auto bg-slate-900/50 rounded-xl border border-slate-800 shadow-sm">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Roll No</th>
                                    <th className="p-4 font-semibold">Section</th>
                                    <th className="p-4 font-semibold">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {enrolledClass.classmates?.length > 0 ? (
                                    enrolledClass.classmates.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-800/30 transition">
                                            <td className="p-4 font-medium text-slate-200 whitespace-nowrap">{student.fullName}</td>
                                            <td className="p-4 font-mono text-violet-400">{student.rollNo || 'N/A'}</td>
                                            <td className="p-4 text-slate-400">{student.section || 'N/A'}</td>
                                            <td className="p-4 text-slate-400">{student.email}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                <span className="text-sm">No other students enrolled in this class yet.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}