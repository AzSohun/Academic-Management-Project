'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import Swal from 'sweetalert2';
import { Assignment } from '@/interfaces/student';

interface SubmitTaskProps {
    assignment: Assignment;
    onClose: () => void;
    onSuccess: () => void;
    showStatus: (type: 'success' | 'error', msg: string) => void;
}

export default function SubmitTask({ assignment, onClose, onSuccess, showStatus }: SubmitTaskProps) {
    const [filePathInput, setFilePathInput] = useState('');
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const [inlineMsg, setInlineMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleTaskSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineMsg(null);
        if (!filePathInput) return;

        setIsSubmittingTask(true);
        try {
            await api.post('/student/submissions', {
                assignmentId: assignment.id,
                filePath: filePathInput,
            });

            setInlineMsg({ text: 'Submission processed successfully!', type: 'success' });

            setTimeout(() => {
                Swal.fire({
                    title: 'Submitted!',
                    text: `Your response for "${assignment.title}" was uploaded successfully.`,
                    icon: 'success',
                    background: '#0f172a',
                    color: '#f8fafc',
                    confirmButtonColor: '#7c3aed',
                    customClass: { popup: 'border border-slate-800 rounded-xl', title: 'text-sm font-bold text-white', htmlContainer: 'text-xs text-slate-400' }
                });
                onSuccess();
            }, 500);

        } catch (err: any) {
            // ৪ লেয়ারের এরর এক্সট্রাকশন লজিক
            const errorMessage = err.response?.data?.message
                || err.response?.data?.detail
                || err.response?.data?.title
                || (typeof err.response?.data === 'string' ? err.response.data : null)
                || 'Failed to submit assignment. Try again.';

            setInlineMsg({ text: errorMessage, type: 'error' });
        } finally {
            setIsSubmittingTask(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl w-full max-w-md shadow-2xl space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-200">Submit Assignment</h3>
                        <p className="text-xs text-slate-400 mt-1">{assignment.title}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-base cursor-pointer">✕</button>
                </div>
                <form onSubmit={handleTaskSubmission} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">File Link / Path / Drive URL</label>
                        <input
                            type="text"
                            value={filePathInput}
                            onChange={(e) => setFilePathInput(e.target.value)}
                            placeholder="e.g. https://drive.google.com/file/... or github link"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                            required
                        />
                    </div>

                    {/* ইনলাইন মেসেজ দেখানোর সুন্দর বক্স */}
                    {inlineMsg && (
                        <div className={`p-2.5 rounded-lg text-xs font-medium border ${inlineMsg.type === 'error' ? 'bg-rose-950/40 text-rose-400 border-rose-800/60' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'}`}>
                            {inlineMsg.type === 'error' ? '⚠ ' : '✓ '} {inlineMsg.text}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                        <button type="button" onClick={onClose} disabled={isSubmittingTask} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition cursor-pointer font-medium mt-3 disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isSubmittingTask} className="px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-500 transition cursor-pointer disabled:opacity-50 mt-3 shadow-md shadow-violet-600/20">
                            {isSubmittingTask ? 'Uploading...' : 'Confirm Submission'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}