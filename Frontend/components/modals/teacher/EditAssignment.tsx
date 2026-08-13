import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Assignment, MyClass, Subject } from '@/interfaces/teacher';

interface EditAssignmentProps {
    assignment: Assignment;
    myClasses: MyClass[];
    subjectList: Subject[];
    onClose: () => void;
    onSuccess: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function EditAssignment({ assignment, myClasses, subjectList, onClose, onSuccess, showStatus }: EditAssignmentProps) {
    const [editTitle, setEditTitle] = useState(assignment.title);
    const [editDescription, setEditDescription] = useState(assignment.description);
    const [editMarks, setEditMarks] = useState<number>(assignment.marks);
    const [editDueDate, setEditDueDate] = useState(assignment.dueDate.split('T')[0]);
    const [editClassId, setEditClassId] = useState(assignment.classDetailsId || '');
    const [editSubjectId, setEditSubjectId] = useState(assignment.subjectId || '');
    const [editIsDraft, setEditIsDraft] = useState(assignment.isDraft);

    const handleUpdateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editClassId || !editSubjectId) {
            showStatus('error', 'Please fill all required fields including Class and Subject.');
            return;
        }

        try {
            await api.put(`/teacher/assignments/${assignment.id}`, {
                title: editTitle, description: editDescription, marks: Number(editMarks), dueDate: editDueDate, isDraft: editIsDraft, classDetailsId: editClassId, subjectId: editSubjectId,
            });
            showStatus('success', 'Assignment updated successfully!');
            onSuccess();
        } catch {
            showStatus('error', 'Failed to update assignment.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-2xl shadow-2xl space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200">Edit Assignment</h3>
                        <p className="text-xs text-slate-400 mt-1">Update details for &quot;{assignment.title}&quot;</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                </div>
                <form onSubmit={handleUpdateAssignment} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Title</label><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                        <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Target Class</label><select value={editClassId} onChange={(e) => setEditClassId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer" required><option value="" className="bg-slate-900 text-slate-400">Re-Select Class...</option>{myClasses.map((c) => (<option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">{c.className} (Room: {c.roomNumber})</option>))}</select></div>
                        <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label><select value={editSubjectId} onChange={(e) => setEditSubjectId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer" required><option value="" className="bg-slate-900 text-slate-400">Re-Select Subject...</option>{subjectList.map((s) => (<option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">{s.subjectName} ({s.subjectCode})</option>))}</select></div>
                    </div>
                    <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Description / Instructions</label><textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-2">
                        <div className="flex flex-wrap items-center gap-5 w-full sm:w-auto">
                            <div className="w-32"><label className="block text-xs font-medium text-slate-400 mb-1.5">Total Marks</label><input type="number" value={editMarks} onChange={(e) => setEditMarks(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required /></div>
                            <div className="w-48"><label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label><input type="date" value={editDueDate} min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]} onChange={(e) => setEditDueDate(e.target.value)} onClick={(e) => { if ('showPicker' in e.currentTarget) e.currentTarget.showPicker(); }} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer scheme-dark" required /></div>
                            <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="editDraftCheck" checked={editIsDraft} onChange={(e) => setEditIsDraft(e.target.checked)} className="w-4 h-4 accent-indigo-600 rounded cursor-pointer" /><label htmlFor="editDraftCheck" className="text-sm text-slate-300 cursor-pointer select-none">Save as Draft</label></div>
                        </div>
                        <div className="flex justify-end gap-3 self-end">
                            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition cursor-pointer font-medium">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition cursor-pointer shadow-md shadow-indigo-600/20">Save Changes</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}