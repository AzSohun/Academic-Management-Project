'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { ClassOption } from '@/interfaces/admin';

interface EditClassProps {
    classItem: ClassOption;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditClass({ classItem, onClose, onSuccess }: EditClassProps) {
    const [editClassName, setEditClassName] = useState(classItem.className);
    const [editSection, setEditSection] = useState(classItem.section || '');
    const [editRoomNumber, setEditRoomNumber] = useState(classItem.roomNumber);

    const [inlineMsg, setInlineMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineMsg(null);
        setIsLoading(true);

        try {
            await api.put(`/admin/classes/${classItem.id}`, {
                className: editClassName,
                section: editSection,
                roomNumber: editRoomNumber
            });

            setInlineMsg({ text: 'Class updated successfully!', type: 'success' });

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);

        } catch (err: any) {
            setInlineMsg({ text: err.response?.data?.message || 'Failed to update class.', type: 'error' });
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-slate-200">Edit Class</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                </div>
                <form onSubmit={handleUpdateClass} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Class Name</label>
                        <input type="text" value={editClassName} onChange={(e) => setEditClassName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Section</label>
                        <input type="text" value={editSection} onChange={(e) => setEditSection(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Room Number</label>
                        <input type="text" value={editRoomNumber} onChange={(e) => setEditRoomNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required />
                    </div>

                    {inlineMsg && (
                        <div className={`p-2.5 mt-2 rounded-lg text-xs font-medium border ${inlineMsg.type === 'error' ? 'bg-rose-950/40 text-rose-400 border-rose-800/60' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'}`}>
                            {inlineMsg.type === 'error' ? '⚠ ' : '✓ '} {inlineMsg.text}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition cursor-pointer disabled:opacity-50">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}