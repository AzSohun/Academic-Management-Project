'use client';

import React from 'react';
import { MyClass } from '@/interfaces/teacher';

interface ViewClassInfoProps {
    viewingStudentsClass: MyClass;
    onClose: () => void;
}

export default function ViewClassInfo({ viewingStudentsClass, onClose }: ViewClassInfoProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            {/* 🎯 Added a top accent border (border-t-emerald-500) for a premium look */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border-t-4 border-t-emerald-500">
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/50 shrink-0">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                            Class: {viewingStudentsClass.className}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-slate-400 font-medium">Room {viewingStudentsClass.roomNumber}</span>
                            {/* 🎯 Beautiful Badge for Student Count */}
                            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {viewingStudentsClass.studentCount} Students Enrolled
                            </span>
                        </div>
                    </div>
                    {/* 🎯 Close button turns slightly red on hover for better UX */}
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-inner bg-slate-950/50">
                        <table className="w-full text-left text-sm text-slate-300">
                            {/* 🎯 Sticky Header: Scrolls smoothly inside the modal */}
                            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 sticky top-0 backdrop-blur-md z-10">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Roll No</th>
                                    <th className="p-4 font-semibold">Section</th>
                                    <th className="p-4 font-semibold">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {viewingStudentsClass.students && viewingStudentsClass.students.length > 0 ? (
                                    viewingStudentsClass.students.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-800/40 transition group">
                                            {/* 🎯 Name changes color on hover */}
                                            <td className="p-4 font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">{s.fullName}</td>
                                            <td className="p-4 font-mono text-indigo-400">{s.rollNo || 'N/A'}</td>
                                            <td className="p-4 text-slate-400">{s.section || 'N/A'}</td>
                                            <td className="p-4 text-slate-400">{s.email || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    /* 🎯 Enhanced Empty State UI */
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 shadow-inner">
                                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                </div>
                                                <span className="text-sm font-medium text-slate-300">No students enrolled</span>
                                                <span className="text-xs mt-1 text-slate-500">Students assigned to this class will appear here.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition shadow-md cursor-pointer">
                        Close View
                    </button>
                </div>
            </div>
        </div>
    );
}