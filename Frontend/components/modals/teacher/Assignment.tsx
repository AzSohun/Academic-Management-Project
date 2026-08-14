'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';
import Pagination from '@/components/common/Pagination';
import { Assignment as IAssignment, MyClass, Subject } from '@/interfaces/teacher';

interface AssignmentProps {
    assignments: IAssignment[];
    myClasses: MyClass[];
    subjectList: Subject[];
    fetchTeacherData: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
    onEditAssignment: (a: IAssignment) => void;
    onViewSubmissions: (a: IAssignment) => void;
}

export default function AssignmentTab({ assignments, myClasses, subjectList, fetchTeacherData, showStatus, onEditAssignment, onViewSubmissions }: AssignmentProps) {
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newMarks, setNewMarks] = useState<number>(100);
    const [newDueDate, setNewDueDate] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [isDraft, setIsDraft] = useState(false);

    const [isCreating, setIsCreating] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const extractError = (err: any, fallbackMsg: string) => {
        return err.response?.data?.message
            || err.response?.data?.detail
            || err.response?.data?.title
            || (typeof err.response?.data === 'string' ? err.response.data : fallbackMsg);
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();


        if (isCreating) return;

        if (!selectedClassId || !selectedSubjectId) return showStatus('error', 'Please select both class and subject.');

        setIsCreating(true);

        try {
            await api.post('/teacher/assignments', {
                title: newTitle,
                description: newDescription,
                marks: Number(newMarks),
                dueDate: newDueDate,
                isDraft,
                classDetailsId: selectedClassId,
                subjectId: selectedSubjectId
            });

            showStatus('success', `Assignment "${newTitle}" created successfully!`);
            setNewTitle(''); setNewDescription(''); setNewMarks(100); setNewDueDate(''); setSelectedClassId(''); setSelectedSubjectId(''); setIsDraft(false);
            fetchTeacherData();
        } catch (err: any) {
            showStatus('error', extractError(err, 'Failed to create assignment.'));
        } finally {
            setIsCreating(false);
        }
    };

    const handlePublishAssignment = async (assignment: IAssignment) => {
        const result = await Swal.fire({ title: 'Publish Assignment?', text: `Are you sure you want to publish "${assignment.title}"?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Yes, Publish', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#10b981' });

        if (result.isConfirmed) {
            try {
                await api.patch(`/teacher/assignments/${assignment.id}/publish?isDraft=false`);
                showStatus('success', 'Assignment published!');
                fetchTeacherData();
            } catch (err: any) {
                showStatus('error', extractError(err, 'Failed to publish assignment.'));
            }
        }
    };

    const handleDeleteAssignment = async (assignment: IAssignment) => {
        const result = await Swal.fire({ title: 'Are you sure?', text: `Delete "${assignment.title}"?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, Delete', background: '#0f172a', color: '#f8fafc', confirmButtonColor: '#e11d48' });

        if (result.isConfirmed) {
            try {
                await api.delete(`/teacher/assignments/${assignment.id}`);
                showStatus('success', 'Deleted!');
                fetchTeacherData();
            } catch (err: any) {
                showStatus('error', extractError(err, 'Could not delete assignment.'));
            }
        }
    };

    const start = (page - 1) * limit;
    const paginatedAssignments = assignments.slice(start, start + limit);

    return (
        <div className="space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-5">
                <h3 className="text-sm font-semibold text-slate-200">Create New Assignment</h3>
                <form onSubmit={handleCreateAssignment} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label>
                            <input type="text" placeholder="e.g. Midterm Homework 01" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Class</label>
                            <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer" required>
                                <option value="" className="bg-slate-900 text-slate-400">Select Class...</option>
                                {myClasses.map((c) => (<option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">{c.className} (Room: {c.roomNumber})</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label>
                            <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer" required>
                                <option value="" className="bg-slate-900 text-slate-400">Select Subject...</option>
                                {subjectList.map((s) => (<option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">{s.subjectName} ({s.subjectCode})</option>))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Description / Instructions</label>
                        <textarea placeholder="Write task details..." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-2">
                        <div className="flex flex-wrap items-center gap-5 w-full sm:w-auto">
                            <div className="w-32">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Marks</label>
                                <input type="number" value={newMarks} onChange={(e) => setNewMarks(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required />
                            </div>
                            <div className="w-48">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label>
                                <input type="date" value={newDueDate} min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]} onChange={(e) => setNewDueDate(e.target.value)} onClick={(e) => { if ('showPicker' in e.currentTarget) e.currentTarget.showPicker(); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer scheme-dark" required />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input type="checkbox" id="draftCheck" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" />
                                <label htmlFor="draftCheck" className="text-sm text-slate-300 cursor-pointer select-none">Save as Draft</label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition cursor-pointer shadow-md shadow-emerald-600/20 shrink-0 self-end disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    Processing...
                                </>
                            ) : (
                                isDraft ? 'Save Draft' : 'Publish Assignment'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Your Assignments ({assignments.length})</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-800">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Class</th>
                                <th className="p-4">Marks</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/20">
                            {paginatedAssignments.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-800/30 transition">
                                    <td className="p-4 font-medium text-slate-200">{a.title}</td>
                                    <td className="p-4 text-slate-400">{a.className || 'N/A'}</td>
                                    <td className="p-4 text-slate-300">{a.marks}</td>
                                    <td className="p-4 text-slate-400">{a.dueDate}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${a.isDraft ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                                            {a.isDraft ? 'Draft' : 'Published'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button onClick={() => onViewSubmissions(a)} className="px-3 py-1.5 bg-violet-950/60 text-violet-400 hover:bg-violet-900 text-xs font-medium rounded-md border border-violet-800/80 transition cursor-pointer">Submissions</button>
                                            <button onClick={() => onEditAssignment(a)} className="px-3 py-1.5 bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900 text-xs font-medium rounded-md border border-indigo-800/80 transition cursor-pointer">Edit</button>
                                            {a.isDraft && <button onClick={() => handlePublishAssignment(a)} className="px-3 py-1.5 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 text-xs font-medium rounded-md border border-emerald-800/80 transition cursor-pointer">Publish</button>}
                                            <button onClick={() => handleDeleteAssignment(a)} className="px-3 py-1.5 bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-medium rounded-md border border-rose-800/80 transition cursor-pointer">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {assignments.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500 text-sm">No assignments created yet.</td></tr>}
                        </tbody>
                    </table>
                    <Pagination totalItems={assignments.length} page={page} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
                </div>
            </div>
        </div>
    );
}