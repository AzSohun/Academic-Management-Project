import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Submission } from '@/interfaces/student';

interface EditSubmissionProps {
    submission: Submission;
    onClose: () => void;
    onSuccess: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function EditSubmission({ submission, onClose, onSuccess, showStatus }: EditSubmissionProps) {
    const [filePathInput, setFilePathInput] = useState(submission.filePath);
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);

    const handleUpdateSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!filePathInput) return;

        setIsSubmittingTask(true);
        try {
            await api.put(`/student/submissions/${submission.id}?newFilePath=${encodeURIComponent(filePathInput)}`);
            showStatus('success', 'Submission link updated successfully!');
            onSuccess();
        } catch (err: any) {
            showStatus('error', err.response?.data?.message || 'Failed to update submission. Try again.');
        } finally {
            setIsSubmittingTask(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200">Update Submission</h3>
                        <p className="text-xs text-slate-400 mt-1">{submission.assignmentTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                </div>
                <form onSubmit={handleUpdateSubmission} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">New File Link / Path</label>
                        <input
                            type="text"
                            value={filePathInput}
                            onChange={(e) => setFilePathInput(e.target.value)}
                            placeholder="Paste your updated link here..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition cursor-pointer font-medium mt-3">Cancel</button>
                        <button type="submit" disabled={isSubmittingTask} className="px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 transition cursor-pointer disabled:opacity-50 mt-3 shadow-md shadow-violet-600/20">
                            {isSubmittingTask ? 'Updating...' : 'Update Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}