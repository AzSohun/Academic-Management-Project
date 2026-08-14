'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Submission } from '@/interfaces/teacher';

interface GradeSubmissionProps {
    submission: Submission;
    onClose: () => void;
    onSuccess: () => void;
    showStatus?: (type: 'success' | 'error', msg: string) => void;
}

export default function GradeSubmission({ submission, onClose, onSuccess }: GradeSubmissionProps) {
    const [givenMark, setGivenMark] = useState<number>(submission.markAssigned ?? 0);
    const [givenFeedback, setGivenFeedback] = useState<string>(submission.teacherFeedback ?? '');

    const [inlineMsg, setInlineMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const maxMarks = (submission as any).assignment?.marks || (submission as any).assignmentMarks || 100;

    const handleSubmitGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineMsg(null);
        setIsLoading(true);

        try {
            await api.post(`/teacher/submissions/${submission.id}/grade`, {
                marksAssigned: Number(givenMark),
                feedback: givenFeedback,
                status: 'Graded'
            });

            setInlineMsg({ text: 'Grade & Feedback updated successfully!', type: 'success' });

            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message
                || error.response?.data?.detail
                || error.response?.data?.title
                || (typeof error.response?.data === 'string' ? error.response.data : null)
                || 'Failed to submit grade. (Server error)';

            setInlineMsg({ text: errorMessage, type: 'error' });
            setIsLoading(false);
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
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-medium text-slate-400">Marks Assigned</label>
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Max: {maxMarks}
                            </span>
                        </div>
                        <input
                            type="number"
                            min="0"
                            max={maxMarks}
                            value={givenMark}
                            onChange={(e) => setGivenMark(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Teacher Feedback / Notes</label>
                        <textarea
                            value={givenFeedback}
                            onChange={(e) => setGivenFeedback(e.target.value)}
                            placeholder="Provide constructive feedback for the student..."
                            rows={4}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    {inlineMsg && (
                        <div className={`p-2.5 mt-2 rounded-lg text-xs font-medium border ${inlineMsg.type === 'error' ? 'bg-rose-950/40 text-rose-400 border-rose-800/60' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'}`}>
                            {inlineMsg.type === 'error' ? '⚠ ' : '✓ '} {inlineMsg.text}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-md text-sm hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-500 transition cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Grade'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}