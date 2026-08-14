'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';
import Pagination from '@/components/common/Pagination';
import EditClass from '@/components/modals/Admin/EditClass';
import EditSubject from '@/components/modals/Admin/EditSubject';
import { ClassOption, SubjectOption } from '@/interfaces/admin';

interface ClassesAndSubjectsProps {
    classList: ClassOption[];
    subjectList: SubjectOption[];
    fetchDashboardData: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function ClassesAndSubjects({ classList, subjectList, fetchDashboardData, showStatus }: ClassesAndSubjectsProps) {
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [subjectCode, setSubjectCode] = useState('');
    const [subjectDescription, setSubjectDescription] = useState('');
    const [classSubjectMode, setClassSubjectMode] = useState<'assign' | 'remove'>('assign');
    const [assignClassId, setAssignClassId] = useState('');
    const [assignSubjectIdToClass, setAssignSubjectIdToClass] = useState('');

    const [classPage, setClassPage] = useState(1);
    const [classLimit, setClassLimit] = useState(5);
    const [subjectPage, setSubjectPage] = useState(1);
    const [subjectLimit, setSubjectLimit] = useState(5);

    const [editingClass, setEditingClass] = useState<ClassOption | null>(null);
    const [editingSubject, setEditingSubject] = useState<SubjectOption | null>(null);

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/classes', { className, section, roomNumber });
            showStatus('success', `Class created successfully!`);
            setClassName(''); setSection(''); setRoomNumber(''); fetchDashboardData();
        } catch { showStatus('error', 'Failed to create class.'); }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/subjects', { subjectName, subjectCode, subjectDescription });
            showStatus('success', `Subject created successfully!`);
            setSubjectName(''); setSubjectCode(''); setSubjectDescription(''); fetchDashboardData();
        } catch { showStatus('error', 'Failed to create subject.'); }
    };

    const handleClassSubjectAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignClassId || !assignSubjectIdToClass) return showStatus('error', 'Please select both class and subject.');
        try {
            const endpoint = classSubjectMode === 'assign' ? '/admin/assign-subject-class' : '/admin/remove-subject-class';
            await api.post(`${endpoint}?classId=${assignClassId}&subjectId=${assignSubjectIdToClass}`);
            showStatus('success', `Mapping ${classSubjectMode} successful!`);
            setAssignClassId(''); setAssignSubjectIdToClass(''); fetchDashboardData();
        } catch { showStatus('error', `Failed to ${classSubjectMode} mapping.`); }
    };

    const handleDeleteClass = async (c: ClassOption) => {
        const result = await Swal.fire({ title: 'Are you sure?', text: `Delete class "${c.className}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48', background: '#0f172a', color: '#fff' });
        if (result.isConfirmed) {
            try { await api.delete(`/admin/classes/${c.id}`); showStatus('success', 'Class deleted'); fetchDashboardData(); }
            catch { showStatus('error', 'Could not delete class'); }
        }
    };

    const handleDeleteSubject = async (s: SubjectOption) => {
        const result = await Swal.fire({ title: 'Are you sure?', text: `Delete subject "${s.subjectName}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#e11d48', background: '#0f172a', color: '#fff' });
        if (result.isConfirmed) {
            try { await api.delete(`/admin/subjects/${s.id}`); showStatus('success', 'Subject deleted'); fetchDashboardData(); }
            catch { showStatus('error', 'Could not delete subject'); }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="text-sm font-semibold text-slate-200">Create New Class</h3>
                    <form onSubmit={handleCreateClass} className="space-y-3">
                        <input type="text" placeholder="Class Name (e.g. 10)" value={className} onChange={(e) => setClassName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-indigo-500 outline-none" required />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Section (e.g. A)" value={section} onChange={(e) => setSection(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-indigo-500 outline-none" required />
                            <input type="text" placeholder="Room Number (e.g. 102)" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:border-indigo-500 outline-none" required />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm cursor-pointer">Create Class</button>
                    </form>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4">
                    <h3 className="text-sm font-semibold text-slate-200">Create New Subject</h3>
                    <form onSubmit={handleCreateSubject} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Subject Name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none" required />
                            <input type="text" placeholder="Subject Code" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none" required />
                        </div>
                        <input type="text" placeholder="Description" value={subjectDescription} onChange={(e) => setSubjectDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none" />
                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-sm cursor-pointer">Create Subject</button>
                    </form>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-4 md:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h3 className="text-sm font-semibold text-slate-200">Map Subject to Class</h3>
                        <div className="flex bg-slate-950 rounded p-0.5 border border-slate-700">
                            <button type="button" onClick={() => setClassSubjectMode('assign')} className={`px-3 py-1 text-xs rounded-sm transition cursor-pointer ${classSubjectMode === 'assign' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Assign</button>
                            <button type="button" onClick={() => setClassSubjectMode('remove')} className={`px-3 py-1 text-xs rounded-sm transition cursor-pointer ${classSubjectMode === 'remove' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}>Remove</button>
                        </div>
                    </div>
                    <form onSubmit={handleClassSubjectAction} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select value={assignClassId} onChange={(e) => setAssignClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm outline-none" required style={{ colorScheme: 'dark' }}>
                            <option value="">Select Target Class...</option>
                            {classList.map((c: any) => <option key={c.id} value={c.id}>{c.className} {c.section ? `(${c.section})` : ''}</option>)}
                        </select>
                        <select value={assignSubjectIdToClass} onChange={(e) => setAssignSubjectIdToClass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm outline-none" required style={{ colorScheme: 'dark' }}>
                            <option value="">Select Subject...</option>
                            {subjectList.map((s) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                        </select>
                        <button type="submit" className={`w-full text-white font-medium py-2.5 rounded-lg text-sm cursor-pointer ${classSubjectMode === 'assign' ? 'bg-indigo-600' : 'bg-rose-600'}`}>Confirm</button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-800/60">
                        <h3 className="text-sm font-semibold text-slate-200">Classes ({classList.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                <tr>
                                    <th className="p-3 pl-5">Class</th>
                                    <th className="p-3">Section</th>
                                    <th className="p-3">Room</th>
                                    <th className="p-3 text-right pr-5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                {classList.slice((classPage - 1) * classLimit, classPage * classLimit).map((c: any) => (
                                    <tr key={c.id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-3 pl-5 font-medium text-slate-200">{c.className}</td>
                                        <td className="p-3 text-slate-400">{c.section || '-'}</td>
                                        <td className="p-3 text-slate-400">{c.roomNumber}</td>
                                        <td className="p-3 text-right pr-5">
                                            <button onClick={() => setEditingClass(c)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 mr-2 cursor-pointer">Edit</button>
                                            <button onClick={() => handleDeleteClass(c)} className="px-3 py-1.5 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-medium rounded border border-rose-800/80 cursor-pointer">Del</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-auto border-t border-slate-800/60">
                        <Pagination totalItems={classList.length} page={classPage} limit={classLimit} onPageChange={setClassPage} onLimitChange={l => { setClassLimit(l); setClassPage(1); }} />
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-slate-800/60">
                        <h3 className="text-sm font-semibold text-slate-200">Subjects ({subjectList.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                                <tr>
                                    <th className="p-3 pl-5">Subject</th>
                                    <th className="p-3">Code</th>
                                    <th className="p-3 text-right pr-5">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                                {subjectList.slice((subjectPage - 1) * subjectLimit, subjectPage * subjectLimit).map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                                        <td className="p-3 pl-5 font-medium text-slate-200">{s.subjectName}</td>
                                        <td className="p-3 text-slate-400">{s.subjectCode}</td>
                                        <td className="p-3 text-right pr-5">
                                            <button onClick={() => setEditingSubject(s)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded border border-indigo-800/80 mr-2 cursor-pointer">Edit</button>
                                            <button onClick={() => handleDeleteSubject(s)} className="px-3 py-1.5 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-medium rounded border border-rose-800/80 cursor-pointer">Del</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-auto border-t border-slate-800/60">
                        <Pagination totalItems={subjectList.length} page={subjectPage} limit={subjectLimit} onPageChange={setSubjectPage} onLimitChange={l => { setSubjectLimit(l); setSubjectPage(1); }} />
                    </div>
                </div>
            </div>

            {editingClass && <EditClass classItem={editingClass} onClose={() => setEditingClass(null)} onSuccess={() => { setEditingClass(null); fetchDashboardData(); }} showStatus={showStatus} />}
            {editingSubject && <EditSubject subject={editingSubject} onClose={() => setEditingSubject(null)} onSuccess={() => { setEditingSubject(null); fetchDashboardData(); }} showStatus={showStatus} />}
        </div>
    );
}