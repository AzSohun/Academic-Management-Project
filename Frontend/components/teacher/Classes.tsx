import React from 'react';
import { MyClass } from '@/interfaces/teacher';

interface ClassesProps {
    myClasses: MyClass[];
    onViewStudents: (c: MyClass) => void;
}

export default function ClassesTab({ myClasses, onViewStudents }: ClassesProps) {
    return (
        <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-5">
                <h3 className="text-sm font-semibold text-slate-200">Your Assigned Classes ({myClasses.length})</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
                    {myClasses.map((c) => (
                        <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-900/10 transition duration-200 overflow-hidden h-fit">
                            <div className="p-5 border-b border-slate-800/60 bg-slate-900/20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-base text-slate-200">{c.className}</h4>
                                        <p className="text-xs text-slate-400 mt-1">Room: {c.roomNumber}</p>
                                    </div>
                                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-md font-medium border border-emerald-500/20 whitespace-nowrap">
                                        {c.studentCount} {c.studentCount === 1 ? 'Student' : 'Students'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1">
                                <p className="text-[10px] font-semibold text-slate-500 mb-3 uppercase tracking-wider">Assigned Subjects</p>
                                <div className="flex flex-wrap gap-2">
                                    {c.subjects && c.subjects.length > 0 ? (
                                        c.subjects.map(sub => (
                                            <span key={sub.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                                                {sub.subjectName} <span className="opacity-50 text-[10px] ml-1.5 font-mono">({sub.subjectCode})</span>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-500 italic">No subjects assigned</span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-800/60 bg-slate-900/10">
                                <button onClick={() => onViewStudents(c)} className="w-full py-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-800/50 transition cursor-pointer flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    View Enrolled Students
                                </button>
                            </div>
                        </div>
                    ))}
                    {myClasses.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
                            <svg className="w-10 h-10 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <p className="text-sm text-slate-400 font-medium">No Classes Assigned</p>
                            <p className="text-xs text-slate-500 mt-1">You haven&apos;t been assigned to any classes yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}