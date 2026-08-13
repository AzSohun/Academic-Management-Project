import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Submission } from '@/interfaces/teacher';

interface GradeSubmissionProps {
    submission: Submission;
    onClose: () => void;
    onSuccess: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function GradeSubmission({ submission, onClose, onSuccess, showStatus }: GradeSubmissionProps) {
    const [givenMark, setGivenMark] = useState<number>(submission.markAssigned ?? 0);
    const [givenFeedback, setGivenFeedback] = useState<string>(submission.teacherFeedback ?? '');

    const handleSubmitGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/teacher/submissions/${submission.id}/grade`, { marksAssigned: Number(givenMark), feedback: givenFeedback });
            showStatus('success', 'Grade & Feedback updated successfully!');
            onSuccess();
        } catch {
            showStatus('error', 'Failed to submit grade.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200">Evaluate Submission</h3>
                        <p className="text-xs text-slate-400 mt-1">{submission.studentName} - {submission.assignmentTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                </div>
                <form onSubmit={handleSubmitGrade} className="space-y-4">
                    <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Marks Assigned</label><input type="number" value={givenMark} onChange={(e) => setGivenMark(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" required /></div>
                    <div><label className="block text-xs font-medium text-slate-400 mb-1.5">Teacher Feedback / Notes</label><textarea value={givenFeedback} onChange={(e) => setGivenFeedback(e.target.value)} placeholder="Provide constructive feedback for the student..." rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500" /></div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-500 transition cursor-pointer">Save Grade</button>
                    </div>
                </form>
            </div>
        </div>
    );
}