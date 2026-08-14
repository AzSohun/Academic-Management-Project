import React, { useState } from 'react';
import { api } from '@/lib/api';
import { ClassOption } from '@/interfaces/admin';

interface EditClassProps {
    classItem: ClassOption;
    onClose: () => void;
    onSuccess: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function EditClass({ classItem, onClose, onSuccess, showStatus }: EditClassProps) {
    const [editClassName, setEditClassName] = useState(classItem.className);
    const [editSection, setEditSection] = useState(classItem.section || '');
    const [editRoomNumber, setEditRoomNumber] = useState(classItem.roomNumber);

    const handleUpdateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/admin/classes/${classItem.id}`, {
                className: editClassName,
                section: editSection,
                roomNumber: editRoomNumber
            });
            showStatus('success', `Class updated successfully!`);
            onSuccess();
        } catch { showStatus('error', 'Failed to update class.'); }
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
                    <div className="flex justify-end gap-2 pt-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition cursor-pointer">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}