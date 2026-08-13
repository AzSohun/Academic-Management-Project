import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { StudentDetailed, ClassOption } from '@/interfaces/admin';

interface EditStudentProps {
    student: StudentDetailed;
    classList: ClassOption[];
    onClose: () => void;
    onSuccess: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function EditStudent({ student, classList, onClose, onSuccess, showStatus }: EditStudentProps) {
    const [editStudentRoll, setEditStudentRoll] = useState('');
    const [editStudentGroup, setEditStudentGroup] = useState('');
    const [editStudentSection, setEditStudentSection] = useState('');
    const [editStudentClassId, setEditStudentClassId] = useState('');
    const [studentFormError, setStudentFormError] = useState('');

    useEffect(() => {
        setEditStudentRoll(student.rollNo || '');
        setEditStudentGroup(student.group || '');
        setEditStudentSection(student.section || '');
        const currentClassId = classList.find(c => c.className === student.className)?.id || '';
        setEditStudentClassId(currentClassId);
    }, [student, classList]);

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setStudentFormError('');
        try {
            await api.put(`/admin/students/${student.id}`, {
                rollNo: editStudentRoll, group: editStudentGroup,
                section: editStudentSection, classDetailsId: editStudentClassId || null
            });
            showStatus('success', 'Student details updated successfully!');
            onSuccess();
        } catch (err: any) {
            setStudentFormError(err.response?.data?.message || 'Failed to update student.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-sm shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200">Edit Student Identity</h3>
                        <p className="text-xs text-slate-400">{student.firstName} {student.lastName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                </div>
                <form onSubmit={handleUpdateStudent} className="space-y-4">
                    {studentFormError && <p className="text-xs text-rose-500 bg-rose-950/40 border border-rose-800 p-2 rounded">{studentFormError}</p>}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Roll No</label>
                        <input type="text" value={editStudentRoll} onChange={(e) => setEditStudentRoll(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Class</label>
                        <select value={editStudentClassId} onChange={(e) => setEditStudentClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer">
                            <option value="">Unassigned</option>
                            {classList.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Group</label>
                            <select value={editStudentGroup} onChange={(e) => setEditStudentGroup(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer">
                                <option value="">Select Group...</option>
                                <option value="Science">Science</option>
                                <option value="Commerce">Commerce</option>
                                <option value="Arts">Arts</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Section</label>
                            <input type="text" value={editStudentSection} onChange={(e) => setEditStudentSection(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition cursor-pointer">Save Details</button>
                    </div>
                </form>
            </div>
        </div>
    );
}