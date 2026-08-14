'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { StudentDetailed, ClassOption } from '@/interfaces/admin';

interface EditStudentProps {
    student: StudentDetailed;
    classList: ClassOption[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditStudent({ student, classList, onClose, onSuccess }: EditStudentProps) {
    const [editStudentRoll, setEditStudentRoll] = useState('');
    const [editStudentGroup, setEditStudentGroup] = useState('');
    const [editStudentClassId, setEditStudentClassId] = useState('');

    const [inlineMsg, setInlineMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setEditStudentRoll(student.rollNo || '');
        setEditStudentGroup(student.group || '');
        const currentClassId = (student as any).classDetailsId || classList.find(c => c.className === student.className)?.id || '';
        setEditStudentClassId(currentClassId);
    }, [student, classList]);

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineMsg(null);
        setIsLoading(true);

        const selectedClass = classList.find((c: any) => c.id === editStudentClassId);
        const derivedSection = selectedClass ? selectedClass.section : '';

        try {
            await api.put(`/admin/students/${student.id}`, {
                rollNo: editStudentRoll,
                group: editStudentGroup,
                section: derivedSection,
                classDetailsId: editStudentClassId || null
            });

            setInlineMsg({ text: 'Student details updated successfully!', type: 'success' });

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message
                || err.response?.data?.detail
                || err.response?.data?.title
                || (typeof err.response?.data === 'string' ? err.response.data : null)
                || 'Failed to update student. (Server error)';

            setInlineMsg({ text: errorMessage, type: 'error' });
            setIsLoading(false);
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
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Roll No</label>
                        <input type="text" value={editStudentRoll} onChange={(e) => setEditStudentRoll(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Class & Section</label>
                        <select
                            value={editStudentClassId}
                            onChange={(e) => setEditStudentClassId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                        >
                            <option value="">Unassigned</option>
                            {classList.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.className} {c.section ? `(Section: ${c.section})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Group</label>
                        <select
                            value={editStudentGroup}
                            onChange={(e) => setEditStudentGroup(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                        >
                            <option value="">Select Group...</option>
                            <option value="Science">Science</option>
                            <option value="Commerce">Commerce</option>
                            <option value="Arts">Arts</option>
                        </select>
                    </div>

                    {inlineMsg && (
                        <div className={`p-2.5 mt-2 rounded-lg text-xs font-medium border ${inlineMsg.type === 'error' ? 'bg-rose-950/40 text-rose-400 border-rose-800/60' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'}`}>
                            {inlineMsg.type === 'error' ? '⚠ ' : '✓ '} {inlineMsg.text}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50">
                            {isLoading ? 'Saving...' : 'Save Details'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}