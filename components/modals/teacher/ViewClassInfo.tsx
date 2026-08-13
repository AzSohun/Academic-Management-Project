import React from 'react';
import { MyClass } from '@/interfaces/teacher';

interface ViewClassInfoProps {
    viewingStudentsClass: MyClass;
    onClose: () => void;
}

export default function ViewClassInfo({ viewingStudentsClass, onClose }: ViewClassInfoProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/50 shrink-0">
                    <div>
                        <h3 className="text-base font-semibold text-slate-200">Enrolled Students: {viewingStudentsClass.className}</h3>
                        <p className="text-xs text-slate-400 mt-1">Room {viewingStudentsClass.roomNumber} • {viewingStudentsClass.studentCount} Students Total</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="overflow-x-auto rounded-lg border border-slate-800">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                                <tr>
                                    <th className="p-4 font-semibold">Name</th>
                                    <th className="p-4 font-semibold">Roll No</th>
                                    <th className="p-4 font-semibold">Section</th>
                                    <th className="p-4 font-semibold">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                {viewingStudentsClass.students && viewingStudentsClass.students.length > 0 ? (
                                    viewingStudentsClass.students.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-800/40 transition">
                                            <td className="p-4 font-medium text-slate-200">{s.fullName}</td>
                                            <td className="p-4 font-mono text-indigo-400">{s.rollNo || 'N/A'}</td>
                                            <td className="p-4 text-slate-400">{s.section || 'N/A'}</td>
                                            <td className="p-4 text-slate-400">{s.email || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                <span className="text-sm">No students enrolled in this class yet.</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end shrink-0">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition cursor-pointer">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}